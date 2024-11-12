'use client'

import { createClient } from '@/utils/supabase/client'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { PropsWithChildren } from 'react'

export default function SupabaseProvider({ children }: PropsWithChildren) {
    const supabase = createClient()

    return (
        <SessionContextProvider supabaseClient={supabase}>
            {children}
        </SessionContextProvider>
    )
} 