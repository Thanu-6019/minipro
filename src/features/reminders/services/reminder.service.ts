import { supabase } from '../../../services/api/supabase';
import { IReminderService, Reminder } from './reminder.service.interface';

export const reminderService: IReminderService = {
  getUpcomingReminders: async (userId: string): Promise<Reminder[]> => {
    const { data, error } = await supabase
      .from('reminders')
      .select('*, schedules(id, medicine_id, times, medicines(name, dosage))')
      .eq('status', 'pending')
      .order('fire_time', { ascending: true });
      
    if (error) throw new Error(error.message);
    return (data ?? []) as any as Reminder[];
  },

  updateReminderStatus: async (id: string, status: 'taken' | 'skipped'): Promise<void> => {
    const { error } = await supabase
      .from('reminders')
      .update({ status })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  createNextReminder: async (scheduleId: string, fireTime: string): Promise<void> => {
    const { error } = await supabase
      .from('reminders')
      .insert({ schedule_id: scheduleId, fire_time: fireTime, status: 'pending' });
    if (error) throw new Error(error.message);
  }
};
