export interface CreateOrganizationDto {
    organization_name: string;
    email: string;
    description?: string;
    image_url?: string;
    address?: string;
}

export interface Organization {
    id: string;
    name: string;
    email: string;
    description: string | null;
    image_url: string | null;
    address: string | null;
    verified: boolean;
}

export interface OrganizationMember {
    role: string;
    profile: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
    };
}

export interface OrganizationDetails {
    organization: Organization;
    members: {
        data: OrganizationMember[];
        total: number;
    };
}

export interface AddMemberDto {
    profileId: string;
    organizationId: string;
    role: string;
} 