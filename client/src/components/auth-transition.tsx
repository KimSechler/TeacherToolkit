import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthLoading from './auth-loading';

interface AuthTransitionProps {
  children: React.ReactNode;
}

export default function AuthTransition({ children }: AuthTransitionProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showTransition, setShowTransition] = useState(false);
  const [prevAuthState, setPrevAuthState] = useState<boolean | null>(null);

  useEffect(() => {
    // If we're loading, show transition
    if (isLoading) {
      setShowTransition(true);
      return;
    }

    // If auth state changed, show transition briefly
    if (prevAuthState !== null && prevAuthState !== isAuthenticated) {
      setShowTransition(true);
      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 800); // Show transition for 800ms
      return () => clearTimeout(timer);
    }

    // If no previous state, just update it
    if (prevAuthState === null) {
      setPrevAuthState(isAuthenticated);
      setShowTransition(false);
    } else {
      setShowTransition(false);
    }
  }, [isAuthenticated, isLoading, prevAuthState]);

  // Show loading during transitions
  if (showTransition || isLoading) {
    return (
      <AuthLoading 
        message={isAuthenticated ? "Welcome back!" : "Signing you in..."} 
      />
    );
  }

  return <>{children}</>;
} 