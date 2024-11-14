'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ManageMembers } from './ManageMembers'
import { ApiService } from '@/app/services/api.service'
import { createClient } from '@/utils/supabase/client'
import { Organization, OrganizationMember } from '@/app/types/organization'
import { Users, Mail, MapPin, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface OrganizationDetailsDialogProps {
    organizationId: string;
    children: React.ReactNode;
}

export function OrganizationDetailsDialog({ organizationId, children }: OrganizationDetailsDialogProps) {
    const [details, setDetails] = useState<Organization | null>(null)
    const [members, setMembers] = useState<OrganizationMember[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [total, setTotal] = useState(0)
    const [dialogOpen, setDialogOpen] = useState(false)

    const apiService = new ApiService()
    const supabase = createClient()

    useEffect(() => {
        fetchDetails()
    }, [organizationId, page])

    const fetchDetails = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error('No access token found')
            }

            const offset = (page - 1) * limit
            const data = await apiService.getOrganizationDetails(
                organizationId,
                session.access_token,
                limit,
                offset
            )

            setDetails(data.organization)
            setMembers(data.members.data)
            setTotal(data.members.total)

            // Check if current user is admin
            const currentUserMember = data.members.data.find(
                member => member.profile_id === session.user.id
            )
            setIsAdmin(currentUserMember?.role === 'admin')
        } catch (error) {
            console.error('Failed to fetch organization details:', error)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(total / limit)

    return (
        <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
                setDialogOpen(open);
            }}
            modal={true}
        >
            <DialogTrigger asChild onClick={(e) => {
                e.stopPropagation();
                setDialogOpen(true);
            }}>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Organization Details</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                ) : details && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">{details.name}</h2>
                                {details.description && (
                                    <p className="text-muted-foreground mt-1">{details.description}</p>
                                )}
                            </div>
                            {isAdmin && (
                                <ManageMembers
                                    organizationId={organizationId}
                                    parentDialogOpen={dialogOpen}
                                    setParentDialogOpen={setDialogOpen}
                                />
                            )}
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center text-sm">
                                <Mail className="h-4 w-4 mr-2" />
                                <span>{details.email}</span>
                            </div>
                            {details.address && (
                                <div className="flex items-center text-sm">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <span>{details.address}</span>
                                </div>
                            )}
                            {details.verified && (
                                <div className="flex items-center text-sm text-green-600">
                                    <Building2 className="h-4 w-4 mr-2" />
                                    <span>Verified Organization</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Members</h3>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {members.map((member, index) => (
                                    <Card key={member.profile_id || `member-${index}`}>
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div>
                                                <p className="font-medium">
                                                    {member.profile.first_name} {member.profile.last_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {member.profile.email}
                                                </p>
                                            </div>
                                            <div className="text-sm">
                                                <span className="capitalize font-medium">
                                                    {member.role}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {members.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">
                                    <Users className="h-8 w-8 mx-auto mb-2" />
                                    <p>No members found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}