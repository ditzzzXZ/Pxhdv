"use server";

import { supabaseServer } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData): Promise<void> {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const handle = String(formData.get("handle")).trim().toLowerCase();
  const displayName = String(formData.get("displayName")).trim();

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) {
    redirect(`/?authError=${encodeURIComponent(error?.message ?? "Could not create account.")}`);
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user!.id,
    handle,
    display_name: displayName || handle,
  });
  if (profileError) {
    redirect(`/?authError=${encodeURIComponent("That handle is already taken.")}`);
  }

  redirect("/");
}

export async function signIn(formData: FormData): Promise<void> {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/?authError=${encodeURIComponent("Wrong email or password.")}`);
  }
  redirect("/");
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}

export async function createPost(formData: FormData) {
  const body = String(formData.get("body")).trim();
  if (!body || body.length > 280) return;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("posts").insert({ author_id: user.id, body });
  revalidatePath("/");
}

export async function toggleLike(postId: number, alreadyLiked: boolean) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (alreadyLiked) {
    await supabase.from("likes").delete().eq("post_id", postId).eq("profile_id", user.id);
  } else {
    await supabase.from("likes").insert({ post_id: postId, profile_id: user.id });
  }
  revalidatePath("/");
}

export async function toggleRepost(postId: number, alreadyReposted: boolean) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (alreadyReposted) {
    await supabase.from("reposts").delete().eq("post_id", postId).eq("profile_id", user.id);
  } else {
    await supabase.from("reposts").insert({ post_id: postId, profile_id: user.id });
  }
  revalidatePath("/");
}

export async function toggleFollow(followeeId: string, alreadyFollowing: boolean) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (alreadyFollowing) {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("followee_id", followeeId);
  } else {
    await supabase.from("follows").insert({ follower_id: user.id, followee_id: followeeId });
  }
  revalidatePath("/");
}
