import { supabase } from '../services/api/supabase';
import { logger } from './logger';

export const verifyConnectivity = async () => {
  try {
    // Test Supabase connectivity
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    logger.info('Supabase connectivity verified');
    return true;
  } catch (error) {
    logger.error('Connectivity verification failed', error);
    return false;
  }
};
