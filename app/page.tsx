import { supabaseServer } from "@/lib/supabase";
import { createPost, toggleLike, toggleRepost, toggleFollow, signIn, signUp } from "./actions";

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ authError?: string }>;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { authError } = await searchParams;
    return (
      <div className="panel">
        <div className="panel-header">Sign in to Perch</div>
        <div className="auth-form">
          {authError && <div className="error-box">{authError}</div>}
          <form action={signIn}>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" required />
            </div>
            <button className="btn" type="submit">Sign in</button>
          </form>
        </div>
        <div className="panel-header">New here? Create an account</div>
        <div className="auth-form">
          <form action={signUp}>
            <div className="field">
              <label>Handle</label>
              <input type="text" name="handle" placeholder="janedoe" required />
            </div>
            <div className="field">
              <label>Display name</label>
              <input type="text" name="displayName" placeholder="Jane Doe" required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" minLength={6} required />
            </div>
            <button className="btn" type="submit">Create account</button>
          </form>
        </div>
      </div>
    );
  }

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: rawPosts } = await supabase
    .from("posts")
    .select("id, author_id, body, created_at, profiles(id, handle, display_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: myLikes } = await supabase.from("likes").select("post_id").eq("profile_id", user.id);
  const { data: myReposts } = await supabase.from("reposts").select("post_id").eq("profile_id", user.id);
  const { data: myFollows } = await supabase.from("follows").select("followee_id").eq("follower_id", user.id);
  const { data: allLikes } = await supabase.from("likes").select("post_id");
  const { data: allReposts } = await supabase.from("reposts").select("post_id");

  const likedSet = new Set((myLikes ?? []).map((l) => l.post_id));
  const repostedSet = new Set((myReposts ?? []).map((r) => r.post_id));
  const followingSet = new Set((myFollows ?? []).map((f) => f.followee_id));

  const countBy = (rows: { post_id: number }[] | null) => {
    const map = new Map<number, number>();
    (rows ?? []).forEach((r) => map.set(r.post_id, (map.get(r.post_id) ?? 0) + 1));
    return map;
  };
  const likeCounts = countBy(allLikes);
  const repostCounts = countBy(allReposts);

  const posts = (rawPosts ?? []) as unknown as {
    id: number;
    author_id: string;
    body: string;
    created_at: string;
    profiles: { id: string; handle: string; display_name: string };
  }[];

  return (
    <>
      <div className="panel">
        <div className="panel-header">What's happening, {myProfile?.display_name ?? "friend"}?</div>
        <div className="composer">
          <form action={createPost}>
            <textarea name="body" maxLength={280} placeholder="Say something worth landing on..." required />
            <div className="composer-row">
              <span className="char-hint">280 characters max</span>
              <button className="btn" type="submit">Post</button>
            </div>
          </form>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">Recent posts</div>
        {posts.length === 0 && <div className="empty-state">Nobody has posted yet. Be the first to land here.</div>}
        {posts.map((post) => {
          const liked = likedSet.has(post.id);
          const reposted = repostedSet.has(post.id);
          const isMe = post.author_id === user.id;
          const following = followingSet.has(post.author_id);
          return (
            <div className="post" key={post.id}>
              <div className="avatar">{initials(post.profiles.display_name)}</div>
              <div className="post-body">
                <div className="post-meta">
                  <span className="name">{post.profiles.display_name}</span>{" "}
                  <span className="handle">@{post.profiles.handle}</span>
                  <span className="time">{timeAgo(post.created_at)}</span>
                </div>
                <div className="post-text">{post.body}</div>
                <div className="post-actions">
                  <form action={toggleLike.bind(null, post.id, liked)} style={{ display: "inline" }}>
                    <button type="submit" className={liked ? "active" : ""}>
                      {liked ? "liked" : "like"} ({likeCounts.get(post.id) ?? 0})
                    </button>
                  </form>
                  <form action={toggleRepost.bind(null, post.id, reposted)} style={{ display: "inline" }}>
                    <button type="submit" className={reposted ? "active" : ""}>
                      {reposted ? "reposted" : "repost"} ({repostCounts.get(post.id) ?? 0})
                    </button>
                  </form>
                  {!isMe && (
                    <form action={toggleFollow.bind(null, post.author_id, following)} style={{ display: "inline" }}>
                      <button type="submit">{following ? "following" : "follow"}</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="footer-note">Perch &mdash; a quiet place to land your thoughts.</div>
    </>
  );
}
