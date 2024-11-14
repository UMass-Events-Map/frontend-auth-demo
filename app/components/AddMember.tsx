'use client'

import { useState } from 'react'
import { ApiService } from '@/app/services/api.service'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface AddMemberProps {
    organizationId: string
    onMemberAdded: (member: any) => void
}

export function AddMember({ organizationId, onMemberAdded }: AddMemberProps) {
    const { data: session } = useSession()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const apiService = new ApiService()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!session?.access_token) return

            const response = await apiService.addMember(
                organizationId,
                email,
                session.access_token
            )

            onMemberAdded(response.member)
            setEmail('')

            toast({
                title: "Success",
                description: "Member added successfully",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1">
                <Label htmlFor="email" className="sr-only">
                    Email
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="Add member by email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add'}
            </Button>
        </form>
    )
} 