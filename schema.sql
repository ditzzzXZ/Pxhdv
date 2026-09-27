-- Perch database schema
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  display_name text not null,
  bio text default '',
  created_at timestamptz default now()
);

create table if not exists posts (
  id bigint generated always as identity primary key,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(body) <= 280),
  created_at timestamptz default now()
);

create table if not exists follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  followee_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, followee_id)
);

create table if not exists likes (
  post_id bigint not null references posts(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, profile_id)
);

create table if not exists reposts (
  post_id bigint not null references posts(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, profile_id)
);

-- Row Level Security
alter table profiles enable row level security;
alter table posts enable row level security;
alter table follows enable row level security;
alter table likes enable row level security;
alter table reposts enable row level security;

create policy "profiles are viewable by everyone" on profiles for select using (true);
create policy "users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "users can update their own profile" on profiles for update using (auth.uid() = id);

create policy "posts are viewable by everyone" on posts for select using (true);
create policy "users can insert their own posts" on posts for insert with check (auth.uid() = author_id);
create policy "users can delete their own posts" on posts for delete using (auth.uid() = author_id);

create policy "follows are viewable by everyone" on follows for select using (true);
create policy "users can manage their own follows" on follows for insert with check (auth.uid() = follower_id);
create policy "users can remove their own follows" on follows for delete using (auth.uid() = follower_id);

create policy "likes are viewable by everyone" on likes for select using (true);
create policy "users can like as themselves" on likes for insert with check (auth.uid() = profile_id);
create policy "users can unlike their own likes" on likes for delete using (auth.uid() = profile_id);

create policy "reposts are viewable by everyone" on reposts for select using (true);
create policy "users can repost as themselves" on reposts for insert with check (auth.uid() = profile_id);
create policy "users can undo their own reposts" on reposts for delete using (auth.uid() = profile_id);
