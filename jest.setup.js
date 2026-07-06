jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      signInWithPassword: jest.fn(() => Promise.resolve({ data: { session: {} }, error: null })),
      signOut: jest.fn(),
      getSession: jest.fn(() => Promise.resolve({ data: { session: {} } })),
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test' } } })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: { id: 'test' }, error: null })),
    })),
    functions: {
      invoke: jest.fn(() => Promise.resolve({ data: { text: 'text', medications: [{name: 'M', dosage: '1', frequency: 'D'}] }, error: null })),
    },
    rpc: jest.fn(() => Promise.resolve({ data: 100, error: null })),
  })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

process.env.SUPABASE_URL = 'http://test.url';
process.env.SUPABASE_ANON_KEY = 'test-key';
