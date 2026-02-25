-- Migration: add ban columns to members table
-- Run this once in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/xkcpourzczanfdracack/sql/new

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS banned     boolean  DEFAULT false  NOT NULL,
  ADD COLUMN IF NOT EXISTS ban_message text     DEFAULT null;

-- Optional: index for quick ban checks
CREATE INDEX IF NOT EXISTS idx_members_banned ON members (banned) WHERE banned = true;
