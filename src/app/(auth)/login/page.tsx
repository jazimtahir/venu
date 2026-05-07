import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { next } = await searchParams;
    redirect(next ?? '/dashboard');
  }

  const { next } = await searchParams;

  return (
    <div className="rounded border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10 animate-fade-up">
      <h1 className="text-h2 text-foreground font-normal">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Sign in to your account</p>
      <LoginForm next={next} />
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-brand hover:underline underline-offset-2">
          Register
        </Link>
      </p>
    </div>
  );
}
