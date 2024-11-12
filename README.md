# Next.js Supabase Auth

This project implements authentication using Supabase in Next.js.

## Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Copy `.env.example` to `.env.local`
3. Update the environment variables in `.env.local` with your Supabase project credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project anon/public key

## Development

```bash
npm run dev
```

## Features

- Email/Password authentication
- Protected routes
- Secure session management
- HTTP-only cookie JWT storage