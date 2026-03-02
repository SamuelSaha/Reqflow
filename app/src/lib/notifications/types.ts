/**
 * Notification Types
 * Unified type definitions for multi-channel notifications
 */

// ============================================================================
// CHANNEL TYPES
// ============================================================================

export type NotificationChannel = "slack" | "discord" | "telegram" | "email" | "in-app";

export interface ChannelConfig {
  enabled: boolean;
  priority: number;
}

// ============================================================================
// NOTIFICATION PAYLOAD
// ============================================================================

export type NotificationType =
  | "request.created"
  | "request.approved"
  | "request.rejected"
  | "request.cancelled"
  | "approval.assigned"
  | "approval.reminder"
  | "budget.warning"
  | "budget.exceeded"
  | "trial.expiring"
  | "trial.expired"
  | "renewal.due"
  | "renewal.reminder"
  | "contract.expiring"
  | "invoice.received"
  | "invoice.overdue"
  | "user.invited"
  | "user.verified"
  | "system.alert"
  | "custom";

export interface NotificationActor {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface NotificationRecipient {
  userId?: string;
  email?: string;
  slackUserId?: string;
  telegramChatId?: string;
  discordUserId?: string;
}

export interface NotificationAction {
  label: string;
  url: string;
  style?: "primary" | "secondary" | "danger";
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  actor?: NotificationActor;
  recipient?: NotificationRecipient;
  metadata?: Record<string, unknown>;
  actions?: NotificationAction[];
  timestamp?: Date;
  tenantId?: string;
}

// ============================================================================
// CHANNEL-SPECIFIC FORMATS
// ============================================================================

export interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  fields?: Array<{ type: string; text: string }>;
  accessory?: Record<string, unknown>;
  elements?: Array<Record<string, unknown>>;
}

export interface SlackMessage {
  text: string;
  blocks?: SlackBlock[];
  username?: string;
  icon_emoji?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  author?: { name: string; url?: string; icon_url?: string };
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
  thumbnail?: { url: string };
  image?: { url: string };
}

export interface DiscordMessage {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
  components?: Array<{
    type: number;
    components: Array<{ type: number; label: string; style: number; url?: string }>;
  }>;
}

export interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  disable_web_page_preview?: boolean;
  reply_markup?: Record<string, unknown>;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface InAppNotification {
  userId: string;
  tenantId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  read?: boolean;
  actionUrl?: string;
}

// ============================================================================
// DELIVERY RESULT
// ============================================================================

export type DeliveryStatus = "pending" | "sent" | "delivered" | "failed" | "bounced" | "rate_limited";

export interface DeliveryResult {
  channel: NotificationChannel;
  status: DeliveryStatus;
  messageId?: string;
  timestamp: Date;
  error?: string;
  retryCount?: number;
}

export interface NotificationResult {
  success: boolean;
  results: DeliveryResult[];
  delivered: NotificationChannel[];
  failed: Array<{ channel: NotificationChannel; error: string }>;
}

// ============================================================================
// NOTIFIER INTERFACE
// ============================================================================

export interface Notifier {
  readonly channel: NotificationChannel;
  readonly name: string;

  isConfigured(): boolean;
  send(payload: NotificationPayload): Promise<DeliveryResult>;
  sendBatch(payloads: NotificationPayload[]): Promise<DeliveryResult[]>;
}

// ============================================================================
// NOTIFICATION OPTIONS
// ============================================================================

export interface NotificationOptions {
  channels?: NotificationChannel[];
  priority?: "low" | "normal" | "high" | "urgent";
  skipIfNotConfigured?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
  idempotencyKey?: string;
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export interface NotificationTemplate {
  type: NotificationType;
  getTitle: (ctx: TemplateContext) => string;
  getMessage: (ctx: TemplateContext) => string;
  getColor?: (ctx: TemplateContext) => number;
  getEmoji?: (ctx: TemplateContext) => string;
  getDefaultActions?: (ctx: TemplateContext) => NotificationAction[];
}

export interface TemplateContext {
  payload: NotificationPayload;
  channel: NotificationChannel;
  recipient?: NotificationRecipient;
}
