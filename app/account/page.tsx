import AccountForm from './account-form'
import { createClient } from '@/utils/supabase/server'

export default async function Account() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        // Optionally handle unauthenticated access
        return <p>Loading...</p>
    }

    return <AccountForm user={user} />
} 