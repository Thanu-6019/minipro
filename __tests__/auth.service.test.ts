import { authService } from '../src/features/auth/services/auth.service';
import { supabase } from '../src/services/api/supabase';

describe('Auth Service', () => {
  it('calls signUp', async () => {
    await authService.signUp('test@test.com', 'password');
    expect(supabase.auth.signUp).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
  });
});
