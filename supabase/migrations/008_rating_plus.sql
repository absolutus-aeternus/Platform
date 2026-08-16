-- Rating Plus tables
CREATE TABLE IF NOT EXISTS rating_plus_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'frozen')),
  level INT DEFAULT 1,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  available_balance DECIMAL(12,2) DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES rating_plus_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rating_plus_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  reward DECIMAL(10,2) NOT NULL,
  task_type TEXT DEFAULT 'standard',
  max_completions INT DEFAULT 100,
  current_completions INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rating_plus_task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES rating_plus_users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES rating_plus_tasks(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proof_url TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS rating_plus_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES rating_plus_users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS rating_plus_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES rating_plus_users(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rp_users_email ON rating_plus_users(email);
CREATE INDEX IF NOT EXISTS idx_rp_users_status ON rating_plus_users(status);
CREATE INDEX IF NOT EXISTS idx_rp_users_referral ON rating_plus_users(referral_code);
CREATE INDEX IF NOT EXISTS idx_rp_completions_user ON rating_plus_task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_rp_completions_task ON rating_plus_task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_rp_withdrawals_user ON rating_plus_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_rp_chat_user ON rating_plus_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_rp_chat_created ON rating_plus_chat_messages(created_at DESC);

-- RLS
ALTER TABLE rating_plus_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_plus_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_plus_task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_plus_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_plus_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own R+ profile" ON rating_plus_users FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all R+ users" ON rating_plus_users FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN')));
CREATE POLICY "Admins can update R+ users" ON rating_plus_users FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))) WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN')));
CREATE POLICY "Anyone can read active tasks" ON rating_plus_tasks FOR SELECT USING (is_active = true);
CREATE POLICY "Users can read own completions" ON rating_plus_task_completions FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM rating_plus_users WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own completions" ON rating_plus_task_completions FOR INSERT TO authenticated WITH CHECK (user_id IN (SELECT id FROM rating_plus_users WHERE user_id = auth.uid()));
CREATE POLICY "Users can read own withdrawals" ON rating_plus_withdrawals FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM rating_plus_users WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own withdrawals" ON rating_plus_withdrawals FOR INSERT TO authenticated WITH CHECK (user_id IN (SELECT id FROM rating_plus_users WHERE user_id = auth.uid()));
CREATE POLICY "Users can read own chats" ON rating_plus_chat_messages FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM rating_plus_users WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN')));
CREATE POLICY "Users can send chats" ON rating_plus_chat_messages FOR INSERT TO authenticated WITH CHECK (sender_type = 'user' AND user_id IN (SELECT id FROM rating_plus_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins can send chats" ON rating_plus_chat_messages FOR INSERT TO authenticated WITH CHECK (sender_type = 'admin' AND EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN')));
