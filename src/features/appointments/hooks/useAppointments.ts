import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService, Appointment } from '../services/appointment.service';

export const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentService.getAppointments(),
  });
};

export const useAddAppointment = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (appointment: Omit<Appointment, 'id' | 'user_id'>) => 
      appointmentService.createAppointment(appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
  return { ...mutation, isPending: mutation.isPending };
};
