/**
 * EmptyState Component
 * Consistent empty state pattern with illustrations, clear messaging, and CTAs
 */

import { Button } from "./button";
import { ReactNode } from "react";
import Link from "next/link";

interface EmptyStateProps {
  /** Illustration/icon component */
  illustration: ReactNode;
  /** Main heading (e.g., "No requests yet") */
  title: string;
  /** Descriptive text explaining the empty state */
  description?: string;
  /** Primary call-to-action */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Secondary action or help link */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Compact mode for smaller empty states */
  compact?: boolean;
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`text-center ${compact ? "py-8" : "py-12"}`}>
      {/* Illustration */}
      <div className={`mx-auto ${compact ? "mb-4" : "mb-6"} flex justify-center`}>
        {illustration}
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto space-y-2">
        <h3
          className={`font-semibold text-slate-900 ${
            compact ? "text-base" : "text-lg"
          }`}
        >
          {title}
        </h3>
        {description && (
          <p className={`text-slate-600 ${compact ? "text-sm" : "text-base"}`}>
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 ${
            compact ? "mt-4" : "mt-6"
          }`}
        >
          {action && (
            <>
              {action.href ? (
                <Link href={action.href}>
                  <Button>{action.label}</Button>
                </Link>
              ) : (
                <Button onClick={action.onClick}>{action.label}</Button>
              )}
            </>
          )}
          {secondaryAction && (
            <>
              {secondaryAction.href ? (
                <Link href={secondaryAction.href}>
                  <Button variant="ghost" size="sm">
                    {secondaryAction.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
