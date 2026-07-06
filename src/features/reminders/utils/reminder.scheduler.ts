export const reminderScheduler = {
  calculateNextFireTime: (
    lastFireTime: string,
    frequency: 'daily' | 'weekly' | 'monthly',
    timezone: string
  ): string => {
    const date = new Date(lastFireTime);
    
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
    }
    
    return date.toISOString();
  }
};
