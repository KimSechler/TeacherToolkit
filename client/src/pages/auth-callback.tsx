import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setError('Authentication failed. Please try again.')
          return
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          window.location.href = '/'
        } else {
          setError('No session found. Please try logging in again.')
        }
      } catch (err) {
        setError('An unexpected error occurred.')
      }
    }

    handleAuthCallback()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Authentication Error</CardTitle>
            <CardDescription className="text-red-500">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Back to Login
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <CardTitle className="text-2xl">Signing you in...</CardTitle>
          <CardDescription>
            Please wait while we complete your authentication
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
} 