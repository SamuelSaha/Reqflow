"use client";

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

/**
 * LoadingSkeleton Component
 * Skeleton screen for loading states
 */
export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse" role="status" aria-label="Loading...">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
          <div className="w-20 h-8 bg-slate-200 rounded-full" />
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * ErrorState Component
 * Error state with retry action and variants
 */
export function ErrorState({
  variant = "error",
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again.",
  onRetry,
  illustration,
}: {
  variant?: "error" | "warning" | "info" | "empty";
  title?: string;
  description?: string;
  onRetry?: () => void;
  illustration?: ReactNode;
}) {
  const variantStyles = {
    error: {
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      icon: (
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    warning: {
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      icon: (
        <svg
          className="w-8 h-8 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    info: {
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      icon: (
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    empty: {
      bgColor: "bg-slate-50",
      iconColor: "text-slate-400",
      icon: (
        <svg
          className="w-8 h-8 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      ),
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center" role="alert">
      {illustration ? (
        <div className="mb-4">{illustration}</div>
      ) : (
        <div className={`w-16 h-16 rounded-full ${styles.bgColor} flex items-center justify-center mb-4`}>
          {styles.icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-6">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="default">
          Try Again
        </Button>
      )}
    </div>
  );
}
