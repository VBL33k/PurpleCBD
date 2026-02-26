-- Allow discord_id to be NULL for physical (guest) sales
ALTER TABLE orders ALTER COLUMN discord_id DROP NOT NULL;
