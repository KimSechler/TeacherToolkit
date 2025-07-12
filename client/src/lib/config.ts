// Environment configuration for client-side
export const config = {
  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // App configuration
  app: {
    nodeEnv: import.meta.env.VITE_NODE_ENV || process.env.NODE_ENV || 'development',
    version: import.meta.env.VITE_VERSION || process.env.VERSION || 'dev',
    isDevelopment: (import.meta.env.VITE_NODE_ENV || process.env.NODE_ENV) === 'development',
  },
  
  // API configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  },
  
  // Feature flags
  features: {
    realtime: true,
    debug: import.meta.env.VITE_DEBUG === 'true' || false,
  }
};

// Validate required environment variables
export function validateConfig() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Initialize config validation
if (typeof window !== 'undefined') {
  validateConfig();
} 