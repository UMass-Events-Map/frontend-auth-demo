'use client'

import { useEffect, useState } from 'react'
import { ApiService } from '@/app/services/api.service'
import { EventData } from '@/app/types/event'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, MapPin, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from 'next/image'

interface EventListProps {
    organizationId: string;
}

export function EventList({ organizationId }: EventListProps) {
    const [events, setEvents] = useState<EventData[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [limit] = useState(6)
    const [total, setTotal] = useState(0)
    const apiService = new ApiService()

    const fetchEvents = async () => {
        try {
            const offset = (page - 1) * limit
            const response = await apiService.getOrganizationEvents(organizationId, limit, offset)
            console.log(response)
            setEvents(response.data)
            setTotal(response.total)
        } catch (error) {
            console.error('Failed to fetch events:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [organizationId, page])

    const totalPages = Math.ceil(total / limit)

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        )
    }
    if (events.length === 0) {
        return (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No events</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new event.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ScrollArea className="h-[800px] rounded-md border">
                <div className="grid gap-6 p-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <Card key={event.id}>
                            {event.thumbnail && (
                                <div className="relative w-full h-40">
                                    <Image
                                        src={event.thumbnail}
                                        alt={event.name}
                                        fill
                                        className="object-cover rounded-t-lg"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-xl">{event.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {event.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {event.description}
                                        </p>
                                    )}
                                    <div className="flex items-center text-sm">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Clock className="h-4 w-4 mr-2" />
                                        <span>{event.time}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Building2 className="h-4 w-4 mr-2" />
                                        <span>{event.building?.name}</span>
                                        {event.room_number && (
                                            <span className="ml-1">• Room {event.room_number}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Users className="h-4 w-4 mr-2" />
                                        <span>{event.attendance} expected attendees</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>

            {totalPages > 1 && (
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
            )}
        </div>
    )
} 