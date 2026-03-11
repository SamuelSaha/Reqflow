import { cn } from "@/lib/utils";
import { AVATAR_GRADIENTS } from "@/lib/design/tokens";

interface VendorAvatarProps {
  name: string;
  className?: string;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "??";
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function VendorAvatar({ name, className }: VendorAvatarProps) {
  const index = hashString(name) % AVATAR_GRADIENTS.length;
  const [color1, color2] = AVATAR_GRADIENTS[index];
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
        className
      )}
      style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
    >
      <span className="text-white text-xs font-semibold">{initials}</span>
    </div>
  );
}
