import { ApiService } from '@/app/services/api.service'
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { firstName, lastName } = await request.json();

        console.log(firstName, lastName);

        // Get the session token from the server-side client
        const supabase = await createClient();

        const { data: { session } } = await supabase.auth.getSession();

        const token = session?.access_token;

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        // Create the profile using your API service
        const apiService = new ApiService()
        const profile = await apiService.createProfile({
            first_name: firstName,
            last_name: lastName
        }, token)

        return NextResponse.json(profile)
    } catch (error: any) {
        console.log(error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
} 