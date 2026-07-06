import { Platform } from 'react-native';
import { supabase } from '../api/supabase';
import { reminderService } from '../../features/reminders/services/reminder.service';
import { logger } from '../../utils/logger';

const IS_NATIVE = Platform.OS !== 'web';

let Notifications: any = null;

if (IS_NATIVE) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (err) {
    logger.error('setNotificationHandler failed:', err);
  }
}

const ANDROID_CHANNEL_ID = 'medication-reminders';
const IOS_CATEGORY_ID = 'medication-reminder';
const BACKGROUND_TASK_NAME = 'background-notification-task';

export const notificationService = {
  async configure(): Promise<void> {
    if (!IS_NATIVE) return;

    try {
      await this.requestPermissions();
    } catch (err) {
      logger.error('requestPermissions failed:', err);
      return;
    }

    const channels = [
      { id: ANDROID_CHANNEL_ID, name: 'Medication Reminders', importance: Notifications.AndroidImportance.MAX },
      { id: 'snooze-reminders', name: 'Snooze Reminders', importance: Notifications.AndroidImportance.HIGH },
      { id: 'weekly-reminders', name: 'Weekly Medication Reminders', importance: Notifications.AndroidImportance.DEFAULT },
    ];

    for (const ch of channels) {
      try {
        await Notifications.setNotificationChannelAsync(ch.id, {
          name: ch.name,
          importance: ch.importance,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      } catch (err) {
        logger.error(`setNotificationChannelAsync(${ch.id}) failed:`, err);
      }
    }

    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('medication-reminders-weekly', {
          name: 'Weekly Medication Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      } catch (err) {
        logger.error('setNotificationChannelAsync(weekly) failed:', err);
      }
    }

    if (Platform.OS === 'ios') {
      try {
        await Notifications.setNotificationCategoryAsync(IOS_CATEGORY_ID, [
          { identifier: 'TAKEN', buttonTitle: 'Taken', options: { isAuthenticationRequired: false, opensAppToForeground: true } },
          { identifier: 'SKIPPED', buttonTitle: 'Skipped', options: { isAuthenticationRequired: false, opensAppToForeground: true } },
          { identifier: 'SNOOZE', buttonTitle: 'Remind me in 15 min', options: { isAuthenticationRequired: false, opensAppToForeground: false } },
          { identifier: 'OPEN', buttonTitle: 'Open', options: { isAuthenticationRequired: false, opensAppToForeground: true } },
        ]);
      } catch (err) {
        logger.error('setNotificationCategoryAsync failed:', err);
      }
    }
  },

  async requestPermissions(): Promise<boolean> {
    if (!IS_NATIVE) return false;

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return status === 'granted';
  },

  async registerPushToken(userId: string): Promise<string | null> {
    if (!IS_NATIVE) return null;

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;

      const { data: existing } = await supabase
        .from('push_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('token', token)
        .single();

      if (existing) {
        return token;
      }

      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: userId,
          token,
          platform: Platform.OS,
        }, { onConflict: 'user_id,token' });

      if (error) throw error;
      return token;
    } catch (error) {
      logger.error('Failed to register push token:', error);
      return null;
    }
  },

  async unregisterPushToken(userId: string, token: string): Promise<void> {
    try {
      await supabase
        .from('push_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('token', token);
    } catch (error) {
      logger.error('Failed to unregister push token:', error);
    }
  },

  async scheduleReminder(reminder: { id: string; fire_time: string; schedule_id: string }): Promise<string | null> {
    if (!IS_NATIVE) return null;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    const fireDate = new Date(reminder.fire_time);
    const now = new Date();
    if (fireDate <= now) return null;

    const medicineResult = await supabase
      .from('schedules')
      .select('medicine_id, medicines(name, dosage)')
      .eq('id', reminder.schedule_id)
      .single();

    if (medicineResult.error || !medicineResult.data) return null;

    const { medicine_id, medicines } = medicineResult.data;
    const medicineName = (medicines as any)?.name || 'Medication';
    const dosage = (medicines as any)?.dosage || '';

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for your medication',
        body: `${medicineName} ${dosage}`.trim(),
        data: {
          reminderId: reminder.id,
          scheduleId: reminder.schedule_id,
          medicineId: medicine_id,
          type: 'medication_reminder',
        },
        categoryIdentifier: IOS_CATEGORY_ID,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        date: fireDate,
        channelId: ANDROID_CHANNEL_ID,
      },
    });

    return notificationId;
  },

  async scheduleWeeklyReminder(reminder: { id: string; fire_time: string; schedule_id: string }): Promise<string | null> {
    if (!IS_NATIVE) return null;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    const fireDate = new Date(reminder.fire_time);
    const now = new Date();
    if (fireDate <= now) return null;

    const medicineResult = await supabase
      .from('schedules')
      .select('medicine_id, medicines(name, dosage)')
      .eq('id', reminder.schedule_id)
      .single();

    if (medicineResult.error || !medicineResult.data) return null;

    const { medicine_id, medicines } = medicineResult.data;
    const medicineName = (medicines as any)?.name || 'Medication';

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Medication Reminder',
        body: `${medicineName} - Time for your weekly check-in`,
        data: {
          reminderId: reminder.id,
          scheduleId: reminder.schedule_id,
          medicineId: medicine_id,
          type: 'weekly_reminder',
        },
        categoryIdentifier: IOS_CATEGORY_ID,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: fireDate,
        channelId: 'weekly-reminders',
      },
    });

    return notificationId;
  },

  async scheduleSnoozeReminder(reminder: { id: string; fire_time: string; schedule_id: string }, minutes: number = 15): Promise<string | null> {
    if (!IS_NATIVE) return null;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    const fireDate = new Date(Date.now() + minutes * 60 * 1000);
    const now = new Date();
    if (fireDate <= now) return null;

    const medicineResult = await supabase
      .from('schedules')
      .select('medicine_id, medicines(name, dosage)')
      .eq('id', reminder.schedule_id)
      .single();

    if (medicineResult.error || !medicineResult.data) return null;

    const { medicine_id, medicines } = medicineResult.data;
    const medicineName = (medicines as any)?.name || 'Medication';
    const dosage = (medicines as any)?.dosage || '';

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for your medication (Snoozed)',
        body: `${medicineName} ${dosage}`.trim(),
        data: {
          reminderId: reminder.id,
          scheduleId: reminder.schedule_id,
          medicineId: medicine_id,
          type: 'medication_reminder',
          snoozed: true,
        },
        categoryIdentifier: IOS_CATEGORY_ID,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: fireDate,
        channelId: 'snooze-reminders',
      },
    });

    return notificationId;
  },

  async cancelReminder(notificationId: string): Promise<void> {
    if (!IS_NATIVE) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  async cancelAllReminders(): Promise<void> {
    if (!IS_NATIVE) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async handleAction(action: 'taken' | 'skipped' | 'snooze' | 'open', reminderId: string, scheduleId: string): Promise<void> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      if (action === 'snooze') {
        const reminder = { id: reminderId, fire_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(), schedule_id: scheduleId };
        await this.scheduleSnoozeReminder(reminder, 15);
        return;
      }

      await reminderService.updateReminderStatus(reminderId, action as 'taken' | 'skipped');

      await supabase.from('medicine_logs').insert({
        reminder_id: reminderId,
        schedule_id: scheduleId,
        user_id: user.id,
        status: action,
        action_time: new Date().toISOString(),
      }).then(({ error }: { error: any }) => {
        if (error) logger.error('Failed to write medicine_logs:', error);
      });

      if (action === 'taken') {
        const { data: schedule } = await supabase
          .from('schedules')
          .select('id, frequency')
          .eq('id', scheduleId)
          .single();

        if (schedule) {
          const hours = schedule.frequency?.toLowerCase().includes('twice') ? 12
            : schedule.frequency?.toLowerCase().includes('three') ? 8
            : 24;
          const nextFireTime = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
          await reminderService.createNextReminder(scheduleId, nextFireTime);
        }
      }

      await this.scheduleReminder({ id: reminderId, fire_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), schedule_id: scheduleId });
    } catch (error) {
      logger.error('Failed to handle notification action:', error);
    }
  },

  addNotificationResponseListener(listener: (response: any) => void): any {
    if (!IS_NATIVE) return null;
    return Notifications.addNotificationResponseReceivedListener(listener);
  },

  addNotificationReceivedListener(listener: (notification: any) => void): any {
    if (!IS_NATIVE) return null;
    return Notifications.addNotificationReceivedListener(listener);
  },
};

if (IS_NATIVE) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TaskManager = require('expo-task-manager');
    TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }: { data?: any; error?: any }) => {
      if (error) {
        logger.error('Background notification task error:', error);
        return;
      }
      if (data) {
        console.log('Background notification received:', data);
      }
    });
  } catch (err) {
    logger.error('TaskManager.defineTask failed:', err);
  }
}

export { Notifications, BACKGROUND_TASK_NAME };
