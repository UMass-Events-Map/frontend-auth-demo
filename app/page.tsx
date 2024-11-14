import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LogoutButton from '@/components/LogoutButton'
import { redirect } from 'next/navigation'
import { CreateOrganizationDialog } from './components/CreateOrganizationDialog'
import { OrganizationList } from './components/OrganizationList'

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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <LogoutButton />
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Organizations</CardTitle>
                  <CardDescription>
                    Manage your organizations and their members
                  </CardDescription>
                </div>
                <CreateOrganizationDialog />
              </div>
            </CardHeader>
            <CardContent>
              <OrganizationList userId={user.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}