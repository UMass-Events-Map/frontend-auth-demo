export interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
}

export interface CreateProfileDto {
    first_name: string;
    last_name: string;
} 