-- ── Logs table ──
-- Trace toutes les actions admin/vendeur et inscriptions membres

CREATE TABLE IF NOT EXISTS logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL    DEFAULT now(),
  actor_id      text        NOT NULL,
  actor_email   text        NOT NULL,
  action        text        NOT NULL,
  target_name   text,
  target_id     text,
  details       jsonb       DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_action     ON logs (action);
CREATE INDEX IF NOT EXISTS idx_logs_actor_id   ON logs (actor_id);

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Le backend (service_role) peut insérer des logs
CREATE POLICY "service_insert"
  ON logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Les admins authentifiés peuvent lire les logs
CREATE POLICY "admin_select"
  ON logs FOR SELECT
  TO authenticated
  USING (true);
