# Rett:ich

## Getting Started

Install dependencies and create your local environment file:

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` with the values from your Supabase project:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Before the app can load recipe data, set up the database:

1. Run `supabase/schema.sql` in the Supabase SQL Editor.
2. Run `supabase/seed-recipes.sql` in the Supabase SQL Editor.
3. For admin access, follow `supabase/README.md`.

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.
