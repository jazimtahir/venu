'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validLink, setValidLink] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const setFromSession = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setValidLink(!!session);
      });
    };
    setFromSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setValidLink(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push('/login?reset=success');
    router.refresh();
  }

  if (validLink === null) {
    return (
      <div className="rounded border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10 animate-fade-up">
        <p className="text-muted-foreground">Checking link…</p>
      </div>
    );
  }

  if (validLink === false) {
    return (
      <div className="rounded border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10 animate-fade-up">
        <h1 className="text-h2 text-foreground font-normal">Invalid or expired link</h1>
        <p className="mt-2 text-muted-foreground">
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block font-medium text-brand hover:underline underline-offset-2"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10 animate-fade-up">
      <h1 className="text-h2 text-foreground font-normal">Set new password</h1>
      <p className="mt-2 text-muted-foreground">Enter your new password below.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl p-3 border border-destructive/20">{error}</p>
        )}
        <div className="space-y-2">
          <Label htmlFor="reset-password">New password</Label>
          <Input
            id="reset-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-confirm">Confirm password</Label>
          <Input
            id="reset-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="h-11"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full h-11">
          {loading ? 'Updating…' : 'Update password'}
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
