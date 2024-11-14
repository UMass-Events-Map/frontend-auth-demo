'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ApiService } from '@/app/services/api.service'
import { createClient } from '@/utils/supabase/client'
import { Organization, OrganizationMember } from '@/app/types/organization'
import { Users, Mail, MapPin, Building2, ChevronLeft, ChevronRight, ChevronsUpDown, Check, Trash2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from '@/hooks/use-debounce'

interface ProfileSearchResult {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
}

interface OrganizationDetailsDialogProps {
    organizationId: string;
    children: React.ReactNode;
}

const apiService = new ApiService()
const supabase = createClient()

export function OrganizationDetailsDialog({ organizationId, children }: OrganizationDetailsDialogProps) {
    const [details, setDetails] = useState<Organization | null>(null)
    const [members, setMembers] = useState<OrganizationMember[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [total, setTotal] = useState(0)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<ProfileSearchResult[]>([])
    const [selectedProfile, setSelectedProfile] = useState<ProfileSearchResult | null>(null)
    const [role, setRole] = useState('member')
    const [searchLoading, setSearchLoading] = useState(false)
    const [key, setKey] = useState(0)
    const { toast } = useToast()
    const [commandOpen, setCommandOpen] = useState(false)

    const debouncedSearch = useDebounce(searchQuery, 300)

    useEffect(() => {
        if (dialogOpen) {
            fetchDetails()
        }
    }, [organizationId, page, dialogOpen])

    useEffect(() => {
        const searchProfiles = async () => {
            if (!debouncedSearch || !dialogOpen) {
                setSearchResults([]);
                return;
            }

            setSearchLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!session?.access_token) {
                    throw new Error('No access token found')
                }

                const results = await apiService.searchProfiles(debouncedSearch, session.access_token)
                setSearchResults(results)
                if (results.length > 0) {
                    setCommandOpen(true)
                }
            } catch (error) {
                console.error('Failed to search profiles:', error)
                setSearchResults([])
            } finally {
                setSearchLoading(false)
            }
        }

        searchProfiles()
    }, [debouncedSearch, dialogOpen])

    const fetchDetails = useCallback(async () => {
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

            const currentUserMember = data.members.data.find(
                member => member.profile.id === session.user.id
            )

            setIsAdmin(currentUserMember?.role == 'admin')
        } catch (error) {
            console.error('Failed to fetch organization details:', error)
        } finally {
            setLoading(false)
        }
    }, [organizationId, page, limit])

    const totalPages = Math.ceil(total / limit)

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProfile) return

        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error('No access token found')
            }

            await apiService.addMember({
                profileId: selectedProfile.id,
                organizationId,
                role
            }, session.access_token)

            toast({
                title: "Success",
                description: "Member added successfully",
            })

            // Refresh the members list
            fetchDetails()
            setSelectedProfile(null)
            setSearchQuery('')
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

    const handleRemoveMember = async (profileId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error('No access token found')
            }

            await apiService.removeMember(organizationId, profileId, session.access_token)

            toast({
                title: "Success",
                description: "Member removed successfully",
            })

            // Refresh the members list
            fetchDetails()
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
                        <div>
                            <h2 className="text-2xl font-bold">{details.name}</h2>
                            {details.description && (
                                <p className="text-muted-foreground mt-1">{details.description}</p>
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
                                {isAdmin && (
                                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="default"
                                                size="sm"
                                            >
                                                <Users className="h-4 w-4 mr-2" />
                                                Add Member
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <form onSubmit={handleAddMember} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Search Member</Label>
                                                    <Command
                                                        shouldFilter={false}
                                                    >
                                                        <CommandInput
                                                            placeholder="Search by name or email..."
                                                            value={searchQuery}
                                                            onValueChange={(value) => {
                                                                setSearchQuery(value)
                                                                if (value) {
                                                                    setCommandOpen(true)
                                                                }
                                                            }}
                                                        />
                                                        <CommandEmpty>
                                                            {searchLoading ? (
                                                                <div className="flex items-center justify-center py-2">
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                                                                </div>
                                                            ) : (
                                                                'No results found.'
                                                            )}
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {searchResults.map((profile) => (
                                                                <CommandItem
                                                                    key={profile.id}
                                                                    onSelect={() => {
                                                                        setSelectedProfile(profile)
                                                                        setPopoverOpen(false)
                                                                        setCommandOpen(false)
                                                                        setSearchQuery('')
                                                                    }}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <span>
                                                                            {profile.first_name} {profile.last_name}
                                                                        </span>
                                                                        <span className="ml-2 text-sm text-muted-foreground">
                                                                            ({profile.email})
                                                                        </span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </div>
                                                {selectedProfile && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label>Role</Label>
                                                            <Select value={role} onValueChange={setRole}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a role" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="member">Member</SelectItem>
                                                                    <SelectItem value="admin">Admin</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <Button type="submit" className="w-full" disabled={loading}>
                                                            {loading ? 'Adding...' : 'Add Member'}
                                                        </Button>
                                                    </>
                                                )}
                                            </form>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>

                            <div className="space-y-3">
                                {members.map((member, index) => (
                                    <Card key={member.profile.id || `member-${index}`}>
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div>
                                                <p className="font-medium">
                                                    {member.profile.first_name} {member.profile.last_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {member.profile.email}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="capitalize font-medium">
                                                    {member.role}
                                                </span>
                                                {isAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            handleRemoveMember(member.profile.id)
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                )}
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

                            <div className="flex justify-end items-center space-x-2 mt-4">
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
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}