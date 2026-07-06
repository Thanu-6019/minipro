import { supabase } from '../../../services/api/supabase';

export const mealReminderService = {
  confirmMeal: async (mealReminderId: string) => {
    const { error } = await supabase
      .from('meal_reminders')
      .update({ confirmed: true })
      .eq('id', mealReminderId);
    if (error) throw new Error(error.message);
  },

  rescheduleReminder: async (reminderId: string) => {
    // Logic: Fetch current reminder, add 30 mins to fire_time, update DB
    const { data: reminder, error: fetchError } = await supabase
      .from('reminders')
      .select('fire_time')
      .eq('id', reminderId)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!reminder) throw new Error('Reminder not found');

    const newFireTime = new Date(new Date(reminder.fire_time).getTime() + 30 * 60000).toISOString();

    const { error: updateError } = await supabase
      .from('reminders')
      .update({ fire_time: newFireTime })
      .eq('id', reminderId);

    if (updateError) throw new Error(updateError.message);
  }
};
