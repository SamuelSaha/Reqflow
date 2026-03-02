"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, loadingText, children, disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(className)}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {loading && loadingText ? loadingText : children}
      </Button>
    );
  }
);
LoadingButton.displayName = "LoadingButton";
