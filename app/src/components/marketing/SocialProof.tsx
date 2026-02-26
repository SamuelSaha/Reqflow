/**
 * Social Proof Components - Trust signals and credibility boosters
 * Place near CTAs to reduce friction and increase conversions
 */

import { cn } from "@/lib/utils";
import { Check, Star, Users } from "lucide-react";

/* ============================================
   USER COUNT - "Join 500+ teams"
   ============================================ */
interface UserCountProps {
  count: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserCount({
  count,
  label = "teams",
  size = "md",
  className,
}: UserCountProps) {
  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-base gap-2",
    lg: "text-lg gap-2",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center font-medium text-slate-600",
        sizeClasses[size],
        className
      )}
    >
      <Users className={cn("text-blue-600", iconSizes[size])} />
      <span>
        Join{" "}
        <span className="font-semibold text-slate-900">
          {count.toLocaleString()}+
        </span>{" "}
        {label}
      </span>
    </div>
  );
}

/* ============================================
   RATING - Star rating with review count
   ============================================ */
interface RatingProps {
  rating: number; // 0-5
  reviews: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Rating({
  rating,
  reviews,
  size = "md",
  className,
}: RatingProps) {
  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-base gap-2",
    lg: "text-lg gap-2",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center font-medium text-slate-600",
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              iconSizes[size],
              i < Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            )}
          />
        ))}
      </div>
      <span>
        <span className="font-semibold text-slate-900">{rating.toFixed(1)}</span>
        {" "}({reviews.toLocaleString()} reviews)
      </span>
    </div>
  );
}

/* ============================================
   TRUST BADGES - Security/compliance signals
   ============================================ */
interface TrustBadgesProps {
  badges?: ("ssl" | "gdpr" | "soc2" | "uptime")[];
  size?: "sm" | "md";
  className?: string;
}

export function TrustBadges({
  badges = ["ssl", "gdpr", "soc2", "uptime"],
  size = "md",
  className,
}: TrustBadgesProps) {
  const badgeLabels = {
    ssl: "256-bit SSL",
    gdpr: "GDPR Compliant",
    soc2: "SOC 2 Type II",
    uptime: "99.9% Uptime",
  };

  const sizeClasses = {
    sm: "text-xs gap-3",
    md: "text-sm gap-4",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center flex-wrap font-medium text-slate-500",
        sizeClasses[size],
        className
      )}
    >
      {badges.map((badge) => (
        <div key={badge} className="flex items-center gap-1">
          <Check className={cn("text-green-600", iconSizes[size])} />
          <span>{badgeLabels[badge]}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================
   NO CREDIT CARD - Friction reducer
   ============================================ */
interface NoCreditCardProps {
  additionalText?: string;
  size?: "sm" | "md";
  className?: string;
}

export function NoCreditCard({
  additionalText = "Free 14-day trial",
  size = "md",
  className,
}: NoCreditCardProps) {
  const sizeClasses = {
    sm: "text-xs gap-2",
    md: "text-sm gap-3",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center font-medium text-slate-600",
        sizeClasses[size],
        className
      )}
    >
      <span className="flex items-center gap-1">
        <Check className={cn("text-green-600", iconSizes[size])} />
        No credit card required
      </span>
      {additionalText && (
        <>
          <span className="text-slate-400">•</span>
          <span>{additionalText}</span>
        </>
      )}
    </div>
  );
}

/* ============================================
   SOCIAL PROOF GROUP - Combined signals
   ============================================ */
interface SocialProofGroupProps {
  userCount?: number;
  rating?: { rating: number; reviews: number };
  showNoCreditCard?: boolean;
  showTrustBadges?: boolean;
  alignment?: "left" | "center" | "right";
  size?: "sm" | "md";
  className?: string;
}

export function SocialProofGroup({
  userCount = 500,
  rating,
  showNoCreditCard = true,
  showTrustBadges = false,
  alignment = "center",
  size = "md",
  className,
}: SocialProofGroupProps) {
  const alignmentClasses = {
    left: "justify-start text-left",
    center: "justify-center text-center",
    right: "justify-end text-right",
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        alignmentClasses[alignment],
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-4">
        <UserCount count={userCount} size={size} />
        {rating && (
          <Rating
            rating={rating.rating}
            reviews={rating.reviews}
            size={size}
          />
        )}
      </div>

      {showNoCreditCard && <NoCreditCard size={size} />}

      {showTrustBadges && <TrustBadges size={size} />}
    </div>
  );
}
