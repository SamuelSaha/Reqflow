import { Spinner } from "./spinner";

interface InlineLoaderProps {
  text?: string;
}

export function InlineLoader({ text = "Loading..." }: InlineLoaderProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <Spinner size="sm" />
      <span className="text-sm text-slate-600">{text}</span>
    </div>
  );
}
