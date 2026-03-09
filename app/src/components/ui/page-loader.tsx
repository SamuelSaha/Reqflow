import { Spinner } from "./spinner";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-sm text-slate-600">{message}</p>
      )}
    </div>
  );
}
