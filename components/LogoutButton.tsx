'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { createClient } from '@/utils/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const { toast } = useToast()
  const supabaseClient = createClient()

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut()

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success!",
      description: "You have been logged out successfully.",
    })

    router.push('/login')
    router.refresh()
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  )
}