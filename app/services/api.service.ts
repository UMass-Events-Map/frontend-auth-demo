import { CreateProfileDto } from '../types/profile';

export class ApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
    }

    async checkProfile(userId: string): Promise<boolean> {
        try {
            console.log(`${this.baseUrl}/profiles/exists/${userId}`);
            const response = await fetch(`${this.baseUrl}/profiles/exists/${userId}`);
            const data = await response.json();
            return response.ok && data.exists;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async createProfile(profileData: CreateProfileDto, token: string) {
        console.log(`${this.baseUrl}/profiles`);
        console.log(JSON.stringify(profileData));
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
} 