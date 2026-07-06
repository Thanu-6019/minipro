import { supabase } from '../../../services/api/supabase';

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  appointment_date: string; // ISO String
  location?: string;
}

export interface IAppointmentService {
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: Omit<Appointment, 'id' | 'user_id'>): Promise<Appointment>;
  updateAppointment(appointment: Appointment): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;
}

export const appointmentService: IAppointmentService = {
  getAppointments: async (): Promise<Appointment[]> => {
    const { data, error } = await supabase.from('appointments').select('*').order('appointment_date');
    if (error) throw new Error(error.message);
    return (data ?? []) as Appointment[];
  },

  createAppointment: async (appointment: Omit<Appointment, 'id' | 'user_id'>): Promise<Appointment> => {
    if (!appointment.title || !appointment.appointment_date) throw new Error('Title and Date required');
    const { data, error } = await supabase.from('appointments').insert(appointment).select().single();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Failed to create appointment');
    return data as Appointment;
  },

  updateAppointment: async (appointment: Appointment): Promise<Appointment> => {
    const { data, error } = await supabase.from('appointments').update(appointment).eq('id', appointment.id).select().single();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Failed to update appointment');
    return data as Appointment;
  },

  deleteAppointment: async (id: string): Promise<void> => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
};
