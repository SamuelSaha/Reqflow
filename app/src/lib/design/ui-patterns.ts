/**
 * UI Patterns & Design Tokens
 *
 * Usage guidelines for consistent component selection.
 * Reference this when unsure which component to use.
 */

export const LOADING_PATTERNS = {
  page: 'Use <PageLoader /> for full-page loading (during initial data fetch)',
  card: 'Use <CardSkeleton /> for card/section loading (optimistic UI)',
  inline: 'Use <InlineLoader /> for inline updates (card refreshes, list updates)',
  button: 'Use <LoadingButton /> for button actions (form submissions)',
  custom: 'Use <Spinner /> for custom layouts',
} as const;

export const ERROR_PATTERNS = {
  page: 'Use <ErrorState variant="error" /> for page-level errors (404, 500)',
  field: 'Use <InlineError /> for form field validation',
  alert: 'Use <Alert variant="warning" /> for contextual warnings',
  toast: 'Use toast.error() for mutation failures',
} as const;

export const NAVIGATION_PATTERNS = {
  breadcrumb: 'Add breadcrumbs to detail pages (contracts/[id], subscriptions/[id])',
  back: 'Use breadcrumbs instead of back button for better context',
} as const;

export const IDENTITY_PATTERNS = {
  avatar: 'Use <Avatar /> for user identity (requesters, approvers, owners)',
  group: 'Use <AvatarGroup /> for multiple users (multi-approver workflows)',
} as const;

export const HELP_PATTERNS = {
  tooltip: 'Use <Tooltip /> for icon buttons, truncated text, and explanations',
  popover: 'Use <Popover /> for menus, filters, and interactive panels',
} as const;

export const PROGRESS_PATTERNS = {
  linear: 'Use <Progress /> for budget consumption, trial progress',
  circular: 'Use <CircularProgress /> for compact spaces',
} as const;

/**
 * Loading Component Decision Tree
 */
export function getLoadingComponent(context: string): string {
  const mapping: Record<string, string> = {
    'page-initial-load': '<PageLoader />',
    'card-refresh': '<InlineLoader />',
    'button-submit': '<LoadingButton />',
    'list-skeleton': '<CardSkeleton variant="list" />',
    'grid-skeleton': '<CardSkeleton variant="grid" />',
    'custom': '<Spinner size="md" />',
  };
  return mapping[context] || '<Spinner />';
}

/**
 * Error Component Decision Matrix
 */
export function getErrorComponent(situation: string): string {
  const mapping: Record<string, string> = {
    'page-failed': '<ErrorState variant="error" />',
    'section-failed': 'Card with <InlineError />',
    'form-validation': '<InlineError />',
    'budget-warning': '<Alert variant="warning" />',
    'mutation-failed': 'toast.error()',
    'info-message': '<Alert variant="info" />',
  };
  return mapping[situation] || '<ErrorState />';
}
