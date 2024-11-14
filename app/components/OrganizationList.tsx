'use client'

import { useEffect, useState } from 'react'
import { ApiService } from '@/app/services/api.service'
import { Organization } from '@/app/types/organization'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Mail, MapPin, Users } from 'lucide-react'
import Image from 'next/image'
import { OrganizationDetailsDialog } from './OrganizationDetailsDialog'

interface OrganizationListProps {
    userId: string
}

export function OrganizationList({ userId }: OrganizationListProps) {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const apiService = new ApiService()

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const data = await apiService.getOrganizations(userId)
                setOrganizations(data)
            } catch (error) {
                console.error('Failed to fetch organizations:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrganizations()
    }, [userId])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        )
    }

    if (organizations.length === 0) {
        return (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No organizations</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new organization.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
                <OrganizationDetailsDialog key={org.id} organizationId={org.id}>
                    <Card className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
                        {org.image_url && (
                            <div className="relative w-full h-40">
                                <Image
                                    src={org.image_url}
                                    alt={org.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                        )}
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl font-bold">
                                        {org.name}
                                        {org.verified && (
                                            <Badge className="ml-2" variant="success">
                                                Verified
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    {org.description && (
                                        <CardDescription className="mt-2 line-clamp-2">
                                            {org.description}
                                        </CardDescription>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4 mr-2" />
                                    <a href={`mailto:${org.email}`} className="hover:underline">
                                        {org.email}
                                    </a>
                                </div>
                                {org.address && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        <span>{org.address}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Building2 className="h-4 w-4 mr-2" />
                                    <span>Organization ID: {org.id}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </OrganizationDetailsDialog>
            ))}
        </div>
    )
} 