import { AlertCircle } from "lucide-react";

interface InlineErrorProps {
  message: string;
}

export function InlineError({ message }: InlineErrorProps) {
  return (
    <div className="flex items-center gap-2 mt-1" role="alert">
      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
      <p className="text-sm text-red-600">{message}</p>
    </div>
  );
}
