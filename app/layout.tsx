import type { Metadata } from "next";
import "./globals.css";
import { supabaseServer } from "@/lib/supabase";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Perch",
  description: "A quiet place to land your thoughts.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <div className="site-header">
          <div className="site-header-inner">
            <div>
              <span className="wordmark">Perch</span>
              <span className="tagline">a quiet place to land your thoughts</span>
            </div>
            <div className="header-right">
              {user ? (
                <form action={signOut}>
                  <button type="submit">sign out</button>
                </form>
              ) : (
                <a href="/">sign in</a>
              )}
            </div>
          </div>
        </div>
        {user && (
          <div className="tabs">
            <div className="tabs-inner">
              <div className="tab active">Nest (Home)</div>
              <div className="tab">Flock (Following)</div>
            </div>
          </div>
        )}
        <div className="wrap">{children}</div>
      </body>
    </html>
  );
}
