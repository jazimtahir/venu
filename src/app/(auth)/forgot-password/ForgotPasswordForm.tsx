'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : undefined;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectTo ?? undefined,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10 animate-fade-up">
        <h1 className="text-h2 text-foreground font-normal">Check your email</h1>
        <p className="mt-2 text-muted-foreground">
          We&apos;ve sent a link to <strong className="text-foreground">{email}</strong> to reset your password.
          Click the link in that email to set a new password.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-brand hover:underline underline-offset-2">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10 animate-fade-up">
      <h1 className="text-h2 text-foreground font-normal">Forgot password</h1>
      <p className="mt-2 text-muted-foreground">Enter your email and we&apos;ll send you a link to reset your password.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl p-3 border border-destructive/20">{error}</p>
        )}
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="h-11"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full h-11">
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-brand hover:underline underline-offset-2">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
