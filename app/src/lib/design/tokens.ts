/**
 * Design Tokens - Reqflow Brand
 * Single source of truth for colors, spacing, and design values
 * Based on Figma design system
 */

// ============================================================================
// COLOR PALETTE (Figma Exact)
// ============================================================================

export const COLORS = {
  // Primary Brand Colors
  primary: {
    50: "#EFF6FF",   // blue-50
    100: "#DBEAFE",  // blue-100
    200: "#BFDBFE",  // blue-200
    300: "#93C5FD",  // blue-300
    400: "#60A5FA",  // blue-400
    500: "#3B82F6",  // blue-500 - Primary brand color
    600: "#2563EB",  // blue-600
    700: "#1D4ED8",  // blue-700
    800: "#1E40AF",  // blue-800
    900: "#1E3A8A",  // blue-900
  },

  // Neutral Colors
  slate: {
    50: "#F8FAFC",   // Surface backgrounds
    100: "#F1F5F9",  // Subtle backgrounds
    200: "#E2E8F0",  // Borders
    300: "#CBD5E1",  // Dividers
    400: "#94A3B8",  // Disabled text
    500: "#64748B",  // Secondary text
    600: "#475569",  // Muted text
    700: "#334155",  // Body text
    800: "#1E293B",  // Headings
    900: "#0F172A",  // Primary text
  },

  // Semantic Colors
  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
    900: "#14532D",
  },

  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    900: "#78350F",
  },

  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    900: "#7F1D1D",
  },

  info: {
    50: "#F0F9FF",
    100: "#E0F2FE",
    200: "#BAE6FD",
    500: "#0EA5E9",
    600: "#0284C7",
    700: "#0369A1",
  },
} as const;

// ============================================================================
// STATUS BADGES
// ============================================================================

export const STATUS_STYLES = {
  // Request statuses
  draft: {
    label: "Draft",
    bg: COLORS.slate[100],
    text: COLORS.slate[700],
    border: COLORS.slate[200],
    className: "bg-slate-100 text-slate-700",
  },
  pending: {
    label: "Pending",
    bg: COLORS.warning[100],
    text: COLORS.warning[700],
    border: COLORS.warning[200],
    className: "bg-amber-100 text-amber-800",
  },
  approved: {
    label: "Approved",
    bg: COLORS.success[100],
    text: COLORS.success[700],
    border: COLORS.success[200],
    className: "bg-green-100 text-green-800",
  },
  rejected: {
    label: "Rejected",
    bg: COLORS.error[100],
    text: COLORS.error[700],
    border: COLORS.error[200],
    className: "bg-red-100 text-red-800",
  },
  cancelled: {
    label: "Cancelled",
    bg: COLORS.slate[100],
    text: COLORS.slate[500],
    border: COLORS.slate[200],
    className: "bg-slate-100 text-slate-600",
  },
} as const;

// Urgency levels
export const URGENCY_STYLES = {
  low: {
    label: "Low",
    bg: COLORS.slate[100],
    text: COLORS.slate[600],
    className: "bg-slate-100 text-slate-600",
  },
  normal: {
    label: "Normal",
    bg: COLORS.warning[100],
    text: COLORS.warning[700],
    className: "bg-amber-100 text-amber-700",
  },
  urgent: {
    label: "Urgent",
    bg: COLORS.error[100],
    text: COLORS.error[700],
    className: "bg-red-100 text-red-700",
  },
} as const;

// ============================================================================
// AVATAR GRADIENTS
// ============================================================================

/** 12 gradient pairs for deterministic vendor/requester avatars */
export const AVATAR_GRADIENTS: [string, string][] = [
  ['#8B5CF6', '#6366F1'], // violet → indigo
  ['#3B82F6', '#6366F1'], // blue → indigo
  ['#EC4899', '#F43F5E'], // pink → rose
  ['#F59E0B', '#F97316'], // amber → orange
  ['#10B981', '#14B8A6'], // emerald → teal
  ['#06B6D4', '#3B82F6'], // cyan → blue
  ['#8B5CF6', '#EC4899'], // violet → pink
  ['#F97316', '#EF4444'], // orange → red
  ['#14B8A6', '#10B981'], // teal → emerald
  ['#6366F1', '#8B5CF6'], // indigo → violet
  ['#64748B', '#475569'], // slate → slate (neutral)
  ['#D946EF', '#8B5CF6'], // fuchsia → violet
];

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TYPOGRAPHY = {
  // Text colors
  text: {
    primary: "text-slate-900",
    secondary: "text-slate-600",
    muted: "text-slate-500",
    disabled: "text-slate-400",
    inverse: "text-white",
    link: "text-blue-600 hover:text-blue-700",
    linkHover: "text-blue-700",
  },

  // Font sizes
  size: {
    xs: "text-xs",      // 12px
    sm: "text-sm",      // 14px
    base: "text-base",  // 16px
    lg: "text-lg",      // 18px
    xl: "text-xl",      // 20px
    "2xl": "text-2xl",  // 24px
    "3xl": "text-3xl",  // 30px
  },

  // Font weights
  weight: {
    normal: "font-normal",    // 400
    medium: "font-medium",    // 500
    semibold: "font-semibold", // 600
    bold: "font-bold",        // 700
  },
} as const;

// ============================================================================
// BACKGROUNDS & SURFACES
// ============================================================================

export const SURFACES = {
  // Background colors
  background: {
    primary: "bg-white",
    secondary: "bg-slate-50",
    tertiary: "bg-slate-100",
    inverse: "bg-slate-900",
  },

  // Hover states
  hover: {
    subtle: "hover:bg-slate-50",
    card: "hover:bg-slate-100",
    primary: "hover:bg-blue-600",
  },

  // Interactive states
  active: "bg-slate-100",
  selected: "bg-blue-50 border-blue-200",
} as const;

// ============================================================================
// BORDERS & DIVIDERS
// ============================================================================

export const BORDERS = {
  color: {
    default: "border-slate-200",
    muted: "border-slate-100",
    strong: "border-slate-300",
    primary: "border-blue-200",
    success: "border-green-200",
    warning: "border-amber-200",
    error: "border-red-200",
  },

  width: {
    default: "border",
    thin: "border",
    thick: "border-2",
  },

  radius: {
    none: "rounded-none",
    sm: "rounded-sm",
    default: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const SPACING = {
  section: "space-y-8",
  card: "space-y-6",
  content: "space-y-4",
  compact: "space-y-2",
  tight: "space-y-1",
} as const;

// ============================================================================
// COMPONENT PRESETS
// ============================================================================

export const PRESETS = {
  // Card styles
  card: {
    default: "bg-white border border-slate-200 rounded-lg",
    hover: "bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow",
    interactive: "bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer",
  },

  // Button variants
  button: {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
  },

  // Input styles
  input: {
    default: "border border-slate-200 rounded-md focus:border-blue-500 focus:ring-blue-500",
    error: "border border-red-300 rounded-md focus:border-red-500 focus:ring-red-500",
  },

  // Badge styles
  badge: {
    default: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
    dot: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status badge classes
 */
export function getStatusBadge(status: keyof typeof STATUS_STYLES) {
  return STATUS_STYLES[status] || STATUS_STYLES.draft;
}

/**
 * Get urgency badge classes
 */
export function getUrgencyBadge(urgency: keyof typeof URGENCY_STYLES) {
  return URGENCY_STYLES[urgency] || URGENCY_STYLES.normal;
}

/**
 * Format currency
 */
export function formatCurrency(amount: string | number, currency = "EUR") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${currency} ${num.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
