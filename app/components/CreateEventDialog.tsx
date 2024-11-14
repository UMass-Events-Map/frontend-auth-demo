'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ApiService } from '@/app/services/api.service'
import { createClient } from '@/utils/supabase/client'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface CreateEventDialogProps {
    organizationId: string;
    onEventCreated?: () => void;
}

interface Building {
    id: string;
    name: string;
}

export function CreateEventDialog({ organizationId, onEventCreated }: CreateEventDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [buildingId, setBuildingId] = useState('')
    const [buildings, setBuildings] = useState<Building[]>([])
    const [roomNumber, setRoomNumber] = useState('')
    const [thumbnail, setThumbnail] = useState('')
    const [attendance, setAttendance] = useState('')
    const [buildingsPage, setBuildingsPage] = useState(1)
    const [buildingsLimit] = useState(10)
    const [buildingsTotal, setBuildingsTotal] = useState(0)
    const [loadingBuildings, setLoadingBuildings] = useState(false)

    const { toast } = useToast()
    const apiService = new ApiService()
    const supabase = createClient()

    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                setLoadingBuildings(true)
                const { data: { session } } = await supabase.auth.getSession()
                if (!session?.access_token) return

                const offset = (buildingsPage - 1) * buildingsLimit
                const response = await apiService.getBuildings(
                    session.access_token,
                    buildingsLimit,
                    offset
                )

                setBuildings(response.data)
                setBuildingsTotal(response.total)
            } catch (error) {
                console.error('Failed to fetch buildings:', error)
                toast({
                    title: "Error",
                    description: "Failed to fetch buildings",
                    variant: "destructive",
                })
            } finally {
                setLoadingBuildings(false)
            }
        }

        if (open) {
            fetchBuildings()
        }
    }, [open, buildingsPage, buildingsLimit])

    const totalBuildingsPages = Math.ceil(buildingsTotal / buildingsLimit)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error('No access token found')
            }

            await apiService.createEvent(
                organizationId,
                {
                    name,
                    description: description || undefined,
                    date,
                    time,
                    building_id: buildingId,
                    room_number: roomNumber || undefined,
                    thumbnail: thumbnail || undefined,
                    attendance: attendance ? parseInt(attendance) : undefined,
                },
                session.access_token
            )

            toast({
                title: "Success",
                description: "Event created successfully",
            })

            setOpen(false)
            onEventCreated?.()
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    New Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Event Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your event..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Time *</Label>
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="building">Building *</Label>
                        <Select
                            value={buildingId}
                            onValueChange={setBuildingId}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a building" />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingBuildings ? (
                                    <div className="flex items-center justify-center p-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                                    </div>
                                ) : (
                                    <>
                                        {buildings.map((building) => (
                                            <SelectItem key={building.id} value={building.id}>
                                                {building.name}
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                        {totalBuildingsPages > 1 && (
                            <div className="flex justify-end items-center space-x-2 mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setBuildingsPage(p => Math.max(1, p - 1))}
                                    disabled={buildingsPage === 1 || loadingBuildings}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm">
                                    Page {buildingsPage} of {totalBuildingsPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setBuildingsPage(p => Math.min(totalBuildingsPages, p + 1))}
                                    disabled={buildingsPage === totalBuildingsPages || loadingBuildings}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="roomNumber">Room Number</Label>
                        <Input
                            id="roomNumber"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            placeholder="e.g., 101A"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="thumbnail">Thumbnail URL</Label>
                        <Input
                            id="thumbnail"
                            type="url"
                            value={thumbnail}
                            onChange={(e) => setThumbnail(e.target.value)}
                            placeholder="https://example.com/thumbnail.jpg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="attendance">Expected Attendance</Label>
                        <Input
                            id="attendance"
                            type="number"
                            value={attendance}
                            onChange={(e) => setAttendance(e.target.value)}
                            min="0"
                            placeholder="0"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Event'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}