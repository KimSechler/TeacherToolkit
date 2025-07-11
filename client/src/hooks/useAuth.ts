import { useEffect, useState } from "react";
import { supabase, onAuthStateChange } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error getting session:", error);
        setUser(null);
      } finally {
        // Add a small delay to prevent flashing
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setUser(user);
      // Add a longer delay to prevent flashing during auth state changes
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
