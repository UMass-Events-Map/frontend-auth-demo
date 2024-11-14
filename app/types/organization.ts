import { Profile } from "./profile";

export interface CreateOrganizationDto {
    organization_name: string;
    email: string;
    description?: string;
    image_url?: string;
    address?: string;
}

export interface OrganizationMemberProfileDto {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
}

export interface OrganizationMemberDto {
    role: string;
    profile: OrganizationMemberProfileDto;
}

export interface OrganizationMembersResponseDto {
    data: OrganizationMemberDto[];
    total: number;
}

export interface OrganizationResponseDto {
    id: string;
    name: string;
    email: string;
    description: string | null;
    image_url: string | null;
    address: string | null;
    verified: boolean;
}

export interface OrganizationDetailsResponseDto {
    organization: OrganizationResponseDto;
    members: OrganizationMembersResponseDto;
}

export interface AddMemberDto {
    profileId: string;
    organizationId: string;
    role?: string;
}

export interface ProfilesOrganizations {
    profile_id: string;
    organization_id: string;
    role: 'member' | 'admin';
    profile: Profile;
    organization: OrganizationResponseDto;
} 