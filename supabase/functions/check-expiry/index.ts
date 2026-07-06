import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ExpiryRecord {
  id: string;
  medicine_id: string;
  exp_date: string;
  batch_number: string | null;
  medicines: {
    id: string;
    name: string;
    dosage: string;
    user_id: string;
  };
}

interface NotificationPayload {
  to: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
}

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
  log('info', 'Starting expiry check');

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
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);
    
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);

    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const in7DaysStr = in7Days.toISOString().split('T')[0];
    const in30DaysStr = in30Days.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    const { data: expiries, error: expiryError } = await supabase
      .from('expiry_tracking')
      .select(`
        id,
        medicine_id,
        exp_date,
        batch_number,
        medicines!inner (
          id,
          name,
          dosage,
          user_id
        )
      `)
      .lte('exp_date', in30DaysStr)
      .order('exp_date', { ascending: true });

    if (expiryError) {
      log('error', 'Failed to fetch expiries', { error: expiryError.message });
      throw expiryError;
    }

    if (!expiries || expiries.length === 0) {
      log('info', 'No expiries found within 30 days');
      return new Response(
        JSON.stringify({ 
          message: 'Expiry check completed', 
          processed: 0,
          notificationsSent: 0,
          durationMs: Date.now() - startTime,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log('info', `Found ${expiries.length} expiring medications within 30 days`);

    const userIds = [...new Set(expiries.map(e => e.medicines.user_id))];
    
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

    for (const expiry of expiries as ExpiryRecord[]) {
      const userId = expiry.medicines.user_id;
      const tokens = tokenMap.get(userId) || [];
      
      if (tokens.length === 0) {
        log('warn', 'No push tokens for user', { userId, medicineId: expiry.medicine_id });
        continue;
      }

      const expDate = new Date(expiry.exp_date);
      const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let urgency = 'this_month';
      if (daysUntil <= 0) urgency = 'overdue';
      else if (daysUntil <= 1) urgency = 'tomorrow';
      else if (daysUntil <= 7) urgency = 'this_week';
      
      const title = urgency === 'overdue' 
        ? 'Medication Expired!' 
        : `Medication Expiring ${urgency === 'tomorrow' ? 'Tomorrow' : urgency === 'this_week' ? 'This Week' : 'This Month'}`;
      const body = `${expiry.medicines.name} ${expiry.medicines.dosage} ${urgency === 'overdue' ? 'expired on' : 'expires on'} ${expDate.toLocaleDateString()}${expiry.batch_number ? ` (Batch: ${expiry.batch_number})` : ''}`;

      for (const token of tokens) {
        const result = await sendPushNotification({
          to: token,
          title,
          body,
          data: {
            type: 'expiry_reminder',
            expiryId: expiry.id,
            medicineId: expiry.medicine_id,
            expDate: expiry.exp_date,
            urgency,
            daysUntil,
          },
        });

        if (result.success) {
          notificationsSent++;
        } else {
          errors.push(`Token ${token.slice(0, 10)}...: ${result.error}`);
        }
      }

      await supabase
        .from('expiry_notifications_log')
        .insert({
          expiry_id: expiry.id,
          user_id: userId,
          notification_type: 'expiry_reminder',
          urgency,
          sent_at: new Date().toISOString(),
          tokens_count: tokens.length,
        })
        .select()
        .single()
        .catch(err => log('error', 'Failed to log notification', { error: err.message }));
    }

    log('info', 'Expiry check completed', { 
      processed: expiries.length, 
      notificationsSent, 
      errors: errors.length,
      durationMs: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({ 
        message: 'Expiry check completed',
        processed: expiries.length,
        notificationsSent,
        errors: errors.length > 0 ? errors : undefined,
        durationMs: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    log('error', 'Expiry check failed', { error: errorMsg, durationMs: Date.now() - startTime });
    
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});