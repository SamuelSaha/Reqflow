/**
 * Renewal Readiness Utilities
 * Calculate readiness scores, urgency colors, and manage checkpoint state
 */

export interface RenewalCheckpoint {
  id: string;
  label: string;
  weight: number;
  completed: boolean;
  completedAt?: string;
  completedById?: string;
  notes?: string;
}

export interface ReadinessScore {
  checkpoints: RenewalCheckpoint[];
  totalScore: number;
}

/**
 * Initialize default checkpoint structure
 */
export function initializeCheckpoints(): RenewalCheckpoint[] {
  return [
    {
      id: "usage_review",
      label: "Review usage metrics",
      weight: 25,
      completed: false,
    },
    {
      id: "alternatives",
      label: "Evaluate alternatives",
      weight: 25,
      completed: false,
    },
    {
      id: "decision",
      label: "Make decision (keep/cancel/renegotiate)",
      weight: 30,
      completed: false,
    },
    {
      id: "owner",
      label: "Assign owner and finalize",
      weight: 20,
      completed: false,
    },
  ];
}

/**
 * Calculate total readiness score from checkpoints
 */
export function calculateReadinessScore(
  checkpoints: RenewalCheckpoint[]
): number {
  return checkpoints.reduce((total, checkpoint) => {
    return total + (checkpoint.completed ? checkpoint.weight : 0);
  }, 0);
}

/**
 * Get urgency color based on days until deadline and readiness score
 * Green: >60% ready OR >90 days
 * Yellow: 30-60% ready OR 30-90 days
 * Red: <30% ready OR <30 days
 */
export function getUrgencyColor(
  daysUntilDeadline: number,
  readinessScore: number
): "green" | "yellow" | "red" {
  // Critical: less than 30 days OR not ready
  if (daysUntilDeadline < 30 || readinessScore < 30) {
    return "red";
  }

  // Warning: 30-90 days OR partially ready
  if (
    (daysUntilDeadline >= 30 && daysUntilDeadline <= 90) ||
    (readinessScore >= 30 && readinessScore < 60)
  ) {
    return "yellow";
  }

  // Good: >90 days OR well prepared
  return "green";
}

/**
 * Get urgency label for display
 */
export function getUrgencyLabel(
  daysUntilDeadline: number,
  readinessScore: number
): string {
  if (daysUntilDeadline < 0) {
    return "Overdue";
  }

  if (daysUntilDeadline === 0) {
    return "Due today";
  }

  if (daysUntilDeadline === 1) {
    return "1 day left";
  }

  const color = getUrgencyColor(daysUntilDeadline, readinessScore);

  if (color === "red") {
    return `${daysUntilDeadline}d left - Urgent`;
  }

  if (color === "yellow") {
    return `${daysUntilDeadline}d left - Action needed`;
  }

  return `${daysUntilDeadline}d left`;
}

/**
 * Determine which checkpoint should be active based on days until deadline
 */
export function getNextCheckpoint(
  daysUntilDeadline: number,
  checkpoints: RenewalCheckpoint[]
): RenewalCheckpoint | null {
  // Find first incomplete checkpoint based on timeline
  if (daysUntilDeadline > 120) {
    // Too early
    return null;
  }

  if (daysUntilDeadline >= 90) {
    // 120-90 days: Usage review
    const checkpoint = checkpoints.find((c) => c.id === "usage_review");
    return checkpoint && !checkpoint.completed ? checkpoint : null;
  }

  if (daysUntilDeadline >= 60) {
    // 90-60 days: Alternatives
    const checkpoint = checkpoints.find((c) => c.id === "alternatives");
    return checkpoint && !checkpoint.completed ? checkpoint : null;
  }

  if (daysUntilDeadline >= 30) {
    // 60-30 days: Decision
    const checkpoint = checkpoints.find((c) => c.id === "decision");
    return checkpoint && !checkpoint.completed ? checkpoint : null;
  }

  // <30 days: Owner assignment
  const checkpoint = checkpoints.find((c) => c.id === "owner");
  return checkpoint && !checkpoint.completed ? checkpoint : null;
}

/**
 * Get readiness status badge text
 */
export function getReadinessStatus(readinessScore: number): string {
  if (readinessScore === 100) {
    return "Ready";
  }

  if (readinessScore >= 60) {
    return "On track";
  }

  if (readinessScore >= 30) {
    return "In progress";
  }

  return "Not started";
}

/**
 * Get Tailwind CSS classes for urgency badge
 */
export function getUrgencyBadgeClass(
  color: "green" | "yellow" | "red"
): string {
  const classes = {
    green: "bg-green-100 text-green-700 border-green-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    red: "bg-red-100 text-red-700 border-red-200",
  };
  return classes[color];
}

/**
 * Get Tailwind CSS classes for readiness score badge
 */
export function getReadinessBadgeClass(readinessScore: number): string {
  if (readinessScore >= 60) {
    return "bg-green-100 text-green-700 border-green-200";
  }
  if (readinessScore >= 30) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
  return "bg-red-100 text-red-700 border-red-200";
}
