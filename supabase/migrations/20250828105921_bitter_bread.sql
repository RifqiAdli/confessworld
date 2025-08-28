/*
  # Create confessions table

  1. New Tables
    - `confessions`
      - `id` (uuid, primary key)
      - `target_name` (text) - nama tujuan confess
      - `message` (text) - isi pesan confess
      - `song_url` (text, optional) - link lagu spotify
      - `song_embed_id` (text, optional) - spotify embed id extracted from URL
      - `is_approved` (boolean) - status approval dari admin
      - `created_at` (timestamp)
      - `unique_slug` (text, unique) - untuk link sharing

  2. Security
    - Enable RLS on `confessions` table
    - Add policy for public read access to approved confessions
    - Add policy for public insert (submissions)
    - Add policy for authenticated users (admin) to manage all confessions
*/

CREATE TABLE IF NOT EXISTS confessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_name text NOT NULL,
  message text NOT NULL,
  song_url text,
  song_embed_id text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  unique_slug text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex')
);

ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;

-- Allow public to read approved confessions
CREATE POLICY "Anyone can read approved confessions"
  ON confessions
  FOR SELECT
  TO public
  USING (is_approved = true);

-- Allow public to insert new confessions
CREATE POLICY "Anyone can submit confessions"
  ON confessions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users (admin) to manage all confessions
CREATE POLICY "Authenticated users can manage confessions"
  ON confessions
  FOR ALL
  TO authenticated
  USING (true);

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS confessions_target_search 
  ON confessions USING gin(to_tsvector('indonesian', target_name));

CREATE INDEX IF NOT EXISTS confessions_message_search 
  ON confessions USING gin(to_tsvector('indonesian', message));

CREATE INDEX IF NOT EXISTS confessions_created_at_idx 
  ON confessions (created_at DESC);