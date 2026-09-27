# Perch — setup & deploy

Perch is a small, real Next.js + Supabase app styled like a 2008-era web app:
post short updates, follow people, like and repost.

## Files that matter
- `app/page.tsx` — the timeline, composer, and sign in/sign up forms
- `app/actions.ts` — server actions: auth, posting, liking, reposting, following
- `app/layout.tsx` — header + tab bar shell
- `app/globals.css` — all styling (the 2008 look)
- `lib/supabase.ts` — Supabase client setup
- `schema.sql` — run this once in Supabase to create the tables

## 1. Create a Supabase project
1. Go to https://supabase.com, create a free project.
2. In the Supabase dashboard, open **SQL Editor** → paste the contents of
   `schema.sql` → run it. This creates the `profiles`, `posts`, `follows`,
   `likes`, and `reposts` tables with row-level security enabled.
3. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
4. In Supabase **Authentication → Providers**, make sure Email is enabled.
   Under **Authentication → Settings**, you can turn off "Confirm email" while
   testing so sign-up works instantly.

## 2. Configure environment variables
Copy `.env.local.example` to `.env.local` and fill in the two values from
step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxx
```

## 3. Run locally
```
npm install
npm run dev
```
Open http://localhost:3000 — create an account, post something.

## 4. Deploy to Vercel
1. Push this folder to a GitHub repo.
2. Go to https://vercel.com/new, import the repo.
3. Add the same two environment variables in the Vercel project settings
   (Project → Settings → Environment Variables).
4. Deploy. Vercel builds and hosts the app; Supabase holds the data.

That's it — no separate backend server needed, Vercel + Supabase is the whole stack.
