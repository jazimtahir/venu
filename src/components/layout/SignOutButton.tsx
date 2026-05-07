'use client';

import { signOut } from '@/app/actions/auth';

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
        Sign out
      </button>
    </form>
  );
}
