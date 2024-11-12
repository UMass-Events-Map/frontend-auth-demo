import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LogoutButton from '@/components/LogoutButton'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-8">
          <LogoutButton />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Dashboard</CardTitle>
            <CardDescription>
              You are logged in as {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your user ID is: {user.id}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}