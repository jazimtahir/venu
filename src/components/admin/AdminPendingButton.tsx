'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface AdminPendingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AdminPendingButton({ children, disabled, className, ...props }: AdminPendingButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button type="submit" disabled={isDisabled} className={className} aria-busy={pending} {...props}>
      {pending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Updating…
        </>
      ) : (
        children
      )}
    </button>
  );
}
