export interface ScheduleWithMedicine {
  id: string;
  medicine_id: string;
  times: string[];
  medicines: {
    name: string;
    dosage: string;
  };
}

export interface Reminder {
  id: string;
  schedule_id: string;
  fire_time: string; // ISO String
  status: 'pending' | 'taken' | 'skipped';
  schedules: ScheduleWithMedicine;
}

export interface IReminderService {
  getUpcomingReminders(userId: string): Promise<Reminder[]>;
  updateReminderStatus(id: string, status: 'taken' | 'skipped'): Promise<void>;
  createNextReminder(scheduleId: string, fireTime: string): Promise<void>;
}
