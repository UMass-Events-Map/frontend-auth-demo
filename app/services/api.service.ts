import { CreateProfileDto } from '../types/profile';
import { CreateOrganizationDto, AddMemberDto, OrganizationDetails } from '../types/organization'

interface ProfileSearchResult {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
}

export class ApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
    }

    async checkProfile(userId: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/profiles/exists/${userId}`);
            const data = await response.json();
            return response.ok && data.exists;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async createProfile(profileData: CreateProfileDto, token: string) {
        const response = await fetch(`${this.baseUrl}/profiles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            throw new Error('Failed to create profile');
        }

        return await response.json();
    }

    async createOrganization(organizationData: CreateOrganizationDto, token: string) {
        const response = await fetch(`${this.baseUrl}/organizations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(organizationData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create organization');
        }

        return await response.json();
    }

    async getOrganizations(profileId: string) {
        const response = await fetch(`${this.baseUrl}/organizations/profile/${profileId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch organizations');
        }

        return await response.json();
    }

    async addMember(memberData: AddMemberDto, token: string) {
        const response = await fetch(`${this.baseUrl}/profiles-organizations/add-member`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(memberData)
        });

        if (!response.ok) {
            throw new Error('Failed to add member');
        }

        return await response.json();
    }

    async removeMember(organizationId: string, profileId: string, token: string) {
        const response = await fetch(
            `${this.baseUrl}/profiles-organizations/${organizationId}/members/${profileId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to remove member');
        }

        return await response.json();
    }

    async searchProfiles(query: string, token: string): Promise<ProfileSearchResult[]> {
        const response = await fetch(
            `${this.baseUrl}/profiles/search?query=${encodeURIComponent(query)}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to search profiles');
        }

        return await response.json();
    }

    async getOrganizationDetails(
        organizationId: string,
        token: string,
        limit?: number,
        offset?: number
    ): Promise<OrganizationDetails> {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());

        const response = await fetch(
            `${this.baseUrl}/organizations/${organizationId}/details?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch organization details');
        }

        return await response.json();
    }
} 