'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle className="text-2xl text-destructive">Something went wrong!</CardTitle>
                <CardDescription>
                    An unexpected error occurred. You can try to recover from this error.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => reset()}>
                    Try again
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}
