import { createClient } from '@supabase/supabase-js'

// Use VITE_ prefixed variables for frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging for frontend environment variables
console.log('🔍 Frontend Environment Variables:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET (length: ' + supabaseAnonKey.length + ')' : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error);
  } else {
    console.log('✅ Supabase connection test successful');
  }
});

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const resendVerificationEmail = async (email: string) => {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: email
  })
  return { data, error }
}

export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
} 