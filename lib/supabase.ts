import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Used in Client Components
export function supabaseBrowser() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Used in Server Components / Server Actions
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // called from a Server Component during render; safe to ignore
          // because middleware refreshes sessions on navigation.
        }
      },
    },
  });
}

export type Profile = {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  created_at: string;
};

export type Post = {
  id: number;
  author_id: string;
  body: string;
  created_at: string;
  profiles: Profile;
  like_count: number;
  repost_count: number;
  liked_by_me: boolean;
};
    
