import { Profile } from "./profile";

export interface CreateEventDto {
    name: string;
    description?: string;
    date: string;
    time: string;
    building_id: string;
    room_number?: string;
    organization_id?: string;
    thumbnail?: string;
    attendance?: number;
}

export interface EventData {
    id: string;
    name: string;
    description: string | null;
    date: string;
    time: string;
    room_number: string | null;
    organization_id: string | null;
    thumbnail: string | null;
    attendance: number;
    created_at: string;
    updated_at: string;
    building: BuildingData | null;
}

export interface EventsResponse {
    data: EventData[];
    total: number;
}

export interface BuildingData {
    id: string;
    name: string;
    thumbnail: string | null;
    address: string | null;
    latitude: number;
    longitude: number;
    created_at: string;
    updated_at: string;
}

export interface EventLog {
    id: string;
    profile_id: string | null;
    event_id: string | null;
    action: string;
    timestamp: string;
    profile: Profile | null;
    event: any;
} 