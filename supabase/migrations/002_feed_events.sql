-- Feed events for realtime updates
CREATE TABLE IF NOT EXISTS feed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  user_id UUID REFERENCES profiles(id),
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view feed events" ON feed_events FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert feed events" ON feed_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Index for realtime
CREATE INDEX idx_feed_events_created ON feed_events(created_at DESC);
CREATE INDEX idx_feed_events_entity ON feed_events(entity_type, entity_id);
