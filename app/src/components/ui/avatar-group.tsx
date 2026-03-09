import { Children, ReactElement } from "react";
import { cn } from "@/lib/utils";

interface AvatarGroupProps {
  children: ReactElement[];
  max?: number;
  className?: string;
}

export function AvatarGroup({ children, max = 3, className }: AvatarGroupProps) {
  const childArray = Children.toArray(children);
  const visibleAvatars = childArray.slice(0, max);
  const overflow = childArray.length - max;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {visibleAvatars.map((child, index) => (
        <div key={index} className="relative" data-avatar>
          {child}
        </div>
      ))}
      {overflow > 0 && (
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 border-2 border-white text-xs font-medium text-slate-600">
          +{overflow}
        </div>
      )}
    </div>
  );
}
