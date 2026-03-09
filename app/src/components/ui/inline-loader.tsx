import { Spinner } from "./spinner";

interface InlineLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function InlineLoader({ size = "sm", text }: InlineLoaderProps) {
  if (!text) {
    return <Spinner size={size} />;
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Spinner size={size} />
      <span className="text-sm text-slate-600">{text}</span>
    </div>
  );
}
