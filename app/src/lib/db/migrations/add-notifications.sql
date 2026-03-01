-- Migration: Add notifications table and notification preferences
-- Created: 2026-03-01

-- Add notificationPreferences column to users table
ALTER TABLE users
ADD COLUMN notification_preferences JSONB;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Notification content
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,

  -- Status
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS notifications_tenant_idx ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications(created_at);
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx ON notifications(user_id, read);

-- Add comment
COMMENT ON TABLE notifications IS 'In-app notifications for users (approvals, budget warnings, etc.)';
COMMENT ON COLUMN users.notification_preferences IS 'User preferences for notification delivery channels (email, in-app, Slack) per notification type';
