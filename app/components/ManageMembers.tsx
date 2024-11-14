'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { ApiService } from '@/app/services/api.service'
import { createClient } from '@/utils/supabase/client'
import { Check, ChevronsUpDown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '../../hooks/use-debounce'

interface ProfileSearchResult {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
}

interface ManageMembersProps {
    organizationId: string;
    parentDialogOpen: boolean;
    setParentDialogOpen: (open: boolean) => void;
}

export function ManageMembers({
    organizationId,
    parentDialogOpen,
    setParentDialogOpen
}: ManageMembersProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<ProfileSearchResult[]>([])
    const [selectedProfile, setSelectedProfile] = useState<ProfileSearchResult | null>(null)
    const [role, setRole] = useState('member')
    const [searchLoading, setSearchLoading] = useState(false)
    const [key, setKey] = useState(0)

    const router = useRouter()
    const { toast } = useToast()

    const apiService = useMemo(() => new ApiService(), [])
    const supabase = useMemo(() => createClient(), [])

    const debouncedSearch = useDebounce(searchQuery, 300)

    useEffect(() => {
        const searchProfiles = async () => {
            if (!debouncedSearch) {
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
                console.log('Search results:', results)
                setSearchResults(results)
                setKey(prev => prev + 1)
            } catch (error) {
                console.error('Failed to search profiles:', error)
                setSearchResults([])
            } finally {
                setSearchLoading(false)
            }
        }

        searchProfiles()
    }, [debouncedSearch, supabase, apiService])

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

            setDialogOpen(false)
            router.refresh()
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
                if (!open) {
                    setDialogOpen(false);
                    if (setParentDialogOpen) {
                        setParentDialogOpen(false);
                    }
                } else {
                    setDialogOpen(true);
                }
            }}
            modal={true}
        >
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDialogOpen(true);
                    }}
                >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Organization Members</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Search Member</Label>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setPopoverOpen(!popoverOpen)
                                    }}
                                >
                                    {selectedProfile ?
                                        `${selectedProfile.first_name} ${selectedProfile.last_name} (${selectedProfile.email})` :
                                        "Search for a member..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent key={key} className="w-[400px] p-0" onClick={(e) => e.stopPropagation()}>
                                <Command>
                                    <CommandInput
                                        placeholder="Search by email..."
                                        value={searchQuery}
                                        onValueChange={(value) => {
                                            setSearchQuery(value)
                                        }}
                                        autoFocus
                                    />
                                    <CommandEmpty>
                                        {searchLoading ? 'Searching...' : 'No results found.'}
                                    </CommandEmpty>
                                    {!searchLoading && searchResults.length > 0 && (
                                        <CommandGroup>
                                            {searchResults.map((profile) => (
                                                <CommandItem
                                                    key={profile.id}
                                                    onSelect={() => {
                                                        setSelectedProfile(profile)
                                                        setPopoverOpen(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedProfile?.id === profile.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {profile.first_name} {profile.last_name}
                                                    <span className="ml-2 text-muted-foreground">
                                                        ({profile.email})
                                                    </span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || !selectedProfile}
                    >
                        {loading ? 'Adding...' : 'Add Member'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}