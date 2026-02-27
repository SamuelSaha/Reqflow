/**
 * Empty State Illustrations
 * Simple, clean SVG illustrations matching the design system
 * Colors: slate-200 (light), slate-300 (medium), blue-600 (accent), violet-600 (premium)
 */

interface IllustrationProps {
  className?: string;
}

/** Empty clipboard/document - for no requests */
export function EmptyRequestsIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clipboard base */}
      <rect x="50" y="40" width="100" height="130" rx="8" fill="#E2E8F0" />
      <rect x="55" y="45" width="90" height="120" rx="4" fill="white" />
      {/* Clip */}
      <rect x="80" y="30" width="40" height="20" rx="4" fill="#2563EB" />
      <rect x="85" y="35" width="30" height="10" rx="2" fill="#E2E8F0" />
      {/* Empty lines (faded) */}
      <line x1="70" y1="70" x2="130" y2="70" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="90" x2="110" y2="90" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="110" x2="120" y2="110" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Checkmark in circle - for no approvals (positive) */
export function NoApprovalsIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle background */}
      <circle cx="100" cy="100" r="60" fill="#DBEAFE" />
      {/* Checkmark */}
      <path
        d="M70 100 L90 120 L130 75"
        stroke="#2563EB"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Decorative circles */}
      <circle cx="50" cy="60" r="8" fill="#93C5FD" opacity="0.5" />
      <circle cx="150" cy="140" r="12" fill="#93C5FD" opacity="0.3" />
    </svg>
  );
}

/** Flask/beaker - for trials */
export function EmptyTrialsIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Flask body */}
      <path
        d="M 70 50 L 70 90 L 50 130 Q 50 150 70 150 L 130 150 Q 150 150 150 130 L 130 90 L 130 50 Z"
        fill="#E2E8F0"
        stroke="#94A3B8"
        strokeWidth="3"
      />
      {/* Flask neck */}
      <rect x="85" y="30" width="30" height="20" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="3" />
      {/* Liquid (violet accent) */}
      <path
        d="M 65 120 L 55 140 Q 55 145 65 145 L 135 145 Q 145 145 145 140 L 135 120 Z"
        fill="#8B5CF6"
        opacity="0.3"
      />
      {/* Bubbles */}
      <circle cx="85" cy="130" r="4" fill="#8B5CF6" opacity="0.5" />
      <circle cx="105" cy="135" r="3" fill="#8B5CF6" opacity="0.5" />
      <circle cx="120" cy="128" r="5" fill="#8B5CF6" opacity="0.5" />
    </svg>
  );
}

/** Wallet/budget - for budgets */
export function EmptyBudgetsIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wallet base */}
      <rect x="40" y="70" width="120" height="80" rx="8" fill="#E2E8F0" />
      <rect x="45" y="75" width="110" height="70" rx="4" fill="white" />
      {/* Card slot */}
      <rect x="55" y="85" width="90" height="20" rx="4" fill="#2563EB" opacity="0.2" />
      {/* Euro symbol */}
      <text x="95" y="130" fontSize="32" fontWeight="bold" fill="#2563EB" textAnchor="middle">
        €
      </text>
      {/* Decorative coins */}
      <circle cx="150" cy="60" r="15" fill="#FCD34D" opacity="0.3" />
      <circle cx="160" cy="50" r="12" fill="#FCD34D" opacity="0.4" />
    </svg>
  );
}

/** People/team - for team empty state */
export function EmptyTeamIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Person 1 (back) */}
      <circle cx="80" cy="70" r="20" fill="#CBD5E1" />
      <path d="M 60 100 Q 60 90 80 90 Q 100 90 100 100 L 100 120 L 60 120 Z" fill="#CBD5E1" />
      {/* Person 2 (front, accent) */}
      <circle cx="120" cy="90" r="24" fill="#2563EB" opacity="0.2" />
      <path d="M 92 125 Q 92 113 120 113 Q 148 113 148 125 L 148 150 L 92 150 Z" fill="#2563EB" opacity="0.2" />
      {/* Plus icon overlay */}
      <circle cx="140" cy="130" r="18" fill="#2563EB" />
      <line x1="140" y1="120" x2="140" y2="140" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="130" y1="130" x2="150" y2="130" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Search/filter - for filtered empty results */
export function NoResultsIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Magnifying glass */}
      <circle cx="85" cy="85" r="40" stroke="#94A3B8" strokeWidth="6" fill="#F1F5F9" />
      <line
        x1="115"
        y1="115"
        x2="145"
        y2="145"
        stroke="#94A3B8"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Question mark inside */}
      <text x="85" y="100" fontSize="40" fontWeight="bold" fill="#CBD5E1" textAnchor="middle">
        ?
      </text>
    </svg>
  );
}

/** Empty box/package - for vendors/renewals */
export function EmptyBoxIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Box base */}
      <path d="M 100 60 L 150 80 L 150 140 L 100 160 L 50 140 L 50 80 Z" fill="#E2E8F0" />
      {/* Box top */}
      <path d="M 100 60 L 150 80 L 100 100 L 50 80 Z" fill="#CBD5E1" />
      {/* Box front */}
      <path d="M 100 100 L 150 80 L 150 140 L 100 160 Z" fill="#F1F5F9" />
      {/* Tape line */}
      <line x1="100" y1="60" x2="100" y2="160" stroke="#2563EB" strokeWidth="4" opacity="0.3" />
    </svg>
  );
}
