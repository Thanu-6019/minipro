import { useQuery } from '@tanstack/react-query';
import { reminderService } from '../services/reminder.service';
import { useAuthStore } from '@/store/authStore';

export const useUpcomingReminders = () => {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ['reminders', 'upcoming'],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated');
      return reminderService.getUpcomingReminders(user.id);
    },
    enabled: !!user,
  });
};
