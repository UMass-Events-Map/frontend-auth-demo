import './globals.css'
import type { Metadata } from 'next'
import SupabaseProvider from '@/components/providers/SupabaseProvider'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Next.js Supabase Auth',
  description: 'Authentication using Supabase in Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          {children}
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  )
}