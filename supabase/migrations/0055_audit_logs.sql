-- Audit Logs table for tracking sensitive operations
-- Created: 2026-08-18

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'order', 'product', 'seller', 'wallet', 'role'
  target_id UUID,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- RLS: Only SUPER_ADMIN can read audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_superadmin_read" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN')
  );

-- Only service role can insert (from Worker API)
CREATE POLICY "audit_service_insert" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- No one can update or delete audit logs (immutable)
-- (Default: no UPDATE/DELETE policies = denied)

-- Seller approval workflow: add columns to sellers table
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add index for approval queries
CREATE INDEX IF NOT EXISTS idx_sellers_approval ON sellers(approval_status);

-- Withdrawal approval workflow: add columns to withdrawals table
-- (if withdrawals table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'withdrawals') THEN
    ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
    ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
    ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
    ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    CREATE INDEX IF NOT EXISTS idx_withdrawals_approval ON withdrawals(approval_status);
  END IF;
END $$;

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for sensitive operations (role changes, approvals, deletions)';
COMMENT ON COLUMN audit_logs.action IS 'Operation type: role_change, seller_approval, withdrawal_approval, user_delete, etc.';
