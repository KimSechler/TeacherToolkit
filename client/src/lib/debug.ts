// Debug utility for authentication issues
export const debugAuth = {
  log: (message: string, data?: any) => {
    console.log(`🔍 [AUTH DEBUG] ${message}`, data || '');
  },
  
  error: (message: string, error?: any) => {
    console.error(`❌ [AUTH ERROR] ${message}`, error || '');
  },
  
  checkEnvironment: () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('🔍 [AUTH DEBUG] Environment Check:');
    console.log('  VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('  VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ [AUTH ERROR] Missing Supabase environment variables!');
      return false;
    }
    
    return true;
  },
  
  checkSupabaseConnection: async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ [AUTH ERROR] Cannot test connection - missing env vars');
        return false;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ [AUTH ERROR] Supabase connection failed:', error);
        return false;
      }
      
      console.log('✅ [AUTH DEBUG] Supabase connection successful');
      return true;
    } catch (error) {
      console.error('❌ [AUTH ERROR] Failed to test Supabase connection:', error);
      return false;
    }
  }
}; 