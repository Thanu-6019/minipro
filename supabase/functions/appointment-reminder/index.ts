import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AppointmentRecord {
  id: string;
  user_id: string;
  title: string;
  appointment_date: string;
  location: string | null;
}

interface NotificationPayload {
  to: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
}

interface ReminderWindow {
  hoursBefore: number;
  label: string;
}

const REMINDER_WINDOWS: ReminderWindow[] = [
  { hoursBefore: 168, label: '1 week' },   // 1 week before
  { hoursBefore: 24, label: '24 hours' },  // 24 hours before
  { hoursBefore: 1, label: '1 hour' },     // 1 hour before
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function log(level: 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, level, message, ...meta }));
}

async function sendPushNotification(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  const expoPushUrl = 'https://exp.host/--/api/v2/push/send';
  
  try {
    const response = await fetch(expoPushUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (result.data?.status === 'ok') {
      return { success: true };
    }
    
    const errorMsg = result.data?.message || 'Unknown Expo push error';
    log('error', 'Expo push failed', { payload, error: errorMsg });
    return { success: false, error: errorMsg };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Network error';
    log('error', 'Expo push request failed', { payload, error: errorMsg });
    return { success: false, error: errorMsg };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  log('info', 'Starting appointment reminder check');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      log('error', 'Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const now = new Date();
    const maxWindow = REMINDER_WINDOWS[0].hoursBefore;
    const windowEnd = new Date(now.getTime() + maxWindow * 60 * 60 * 1000);

    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select('id, user_id, title, appointment_date, location')
      .gte('appointment_date', now.toISOString())
      .lte('appointment_date', windowEnd.toISOString())
      .order('appointment_date', { ascending: true });

    if (apptError) {
      log('error', 'Failed to fetch appointments', { error: apptError.message });
      throw apptError;
    }

    if (!appointments || appointments.length === 0) {
      log('info', 'No appointments due in next 7 days');
      return new Response(
        JSON.stringify({ 
          message: 'Appointment reminder check completed', 
          processed: 0,
          notificationsSent: 0,
          durationMs: Date.now() - startTime,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log('info', `Found ${appointments.length} upcoming appointments within 7 days`);

    const userIds = [...new Set(appointments.map(a => a.user_id))];
    
    const { data: pushTokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('user_id, token')
      .in('user_id', userIds);

    if (tokenError) {
      log('error', 'Failed to fetch push tokens', { error: tokenError.message });
    }

    const tokenMap = new Map<string, string[]>();
    pushTokens?.forEach(pt => {
      const tokens = tokenMap.get(pt.user_id) || [];
      tokens.push(pt.token);
      tokenMap.set(pt.user_id, tokens);
    });

    let notificationsSent = 0;
    const errors: string[] = [];

    for (const appointment of appointments as AppointmentRecord[]) {
      const userId = appointment.user_id;
      const tokens = tokenMap.get(userId) || [];
      
      if (tokens.length === 0) {
        log('warn', 'No push tokens for user', { userId, appointmentId: appointment.id });
        continue;
      }

      const apptDate = new Date(appointment.appointment_date);
      const msUntil = apptDate.getTime() - now.getTime();
      const hoursUntil = msUntil / (1000 * 60 * 60);

      const applicableWindows = REMINDER_WINDOWS.filter(w => {
        const windowStart = w.hoursBefore - 0.5;
        const windowEnd = w.hoursBefore + 0.5;
        return hoursUntil <= windowEnd && hoursUntil >= windowStart;
      });

      if (applicableWindows.length === 0) {
        continue;
      }

      for (const window of applicableWindows) {
        const timeDescription = window.hoursBefore >= 24 
          ? `in ${window.label}` 
          : `in ${window.hoursBefore} hour${window.hoursBefore !== 1 ? 's' : ''}`;

        const title = 'Upcoming Appointment';
        const body = `${appointment.title}${appointment.location ? ` at ${appointment.location}` : ''} ${timeDescription}`;

        for (const token of tokens) {
          const result = await sendPushNotification({
            to: token,
            title,
            body,
            data: {
              type: 'appointment_reminder',
              appointmentId: appointment.id,
              appointmentDate: appointment.appointment_date,
              hoursBefore: window.hoursBefore,
              reminderLabel: window.label,
            },
          });

          if (result.success) {
            notificationsSent++;
          } else {
            errors.push(`Token ${token.slice(0, 10)}...: ${result.error}`);
          }
        }

        await supabase
          .from('appointment_notifications_log')
          .insert({
            appointment_id: appointment.id,
            user_id: userId,
            notification_type: 'appointment_reminder',
            sent_at: new Date().toISOString(),
            hours_before: window.hoursBefore,
            tokens_count: tokens.length,
          })
          .select()
          .single()
          .catch(err => log('error', 'Failed to log notification', { error: err.message }));
      }
    }

    log('info', 'Appointment reminder check completed', { 
      processed: appointments.length, 
      notificationsSent, 
      errors: errors.length,
      durationMs: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({ 
        message: 'Appointment reminder check completed',
        processed: appointments.length,
        notificationsSent,
        errors: errors.length > 0 ? errors : undefined,
        durationMs: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    log('error', 'Appointment reminder check failed', { error: errorMsg, durationMs: Date.now() - startTime });
    
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});