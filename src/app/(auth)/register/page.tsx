import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RegisterForm } from './RegisterForm';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ vendor?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  const { vendor } = await searchParams;
  const isVendor = vendor === '1' || vendor === 'true';

  return (
    <div className="rounded border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10 animate-fade-up">
      <h1 className="text-h2 text-foreground font-normal">
        {isVendor ? 'List your business' : 'Create an account'}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {isVendor
          ? 'Register as a venue partner to start receiving inquiries.'
          : 'Register to save venues and send inquiries.'}
      </p>
      <RegisterForm isVendor={isVendor} />
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand hover:underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  );
}
