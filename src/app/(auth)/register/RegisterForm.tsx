'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RegisterForm({ isVendor }: { isVendor: boolean }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (!authData.user) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    // Update profile
    await supabase
      .from('profiles')
      .update({ full_name: fullName, phone: phone || null })
      .eq('id', authData.user.id);

    if (isVendor && businessName && city) {
      await supabase.from('profiles').update({ role: 'vendor' }).eq('id', authData.user.id);
      await supabase.from('vendors').insert({
        user_id: authData.user.id,
        business_name: businessName,
        vendor_type: 'venue',
        city,
      });
    }

    setLoading(false);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-xl p-3 border border-destructive/20">{error}</p>
      )}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Your name" className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" className="h-11" />
      </div>
      {isVendor && (
        <>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input id="businessName" type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required={isVendor} placeholder="Your venue name" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required={isVendor} placeholder="Lahore" className="h-11" />
          </div>
        </>
      )}
      <Button type="submit" disabled={loading} className="w-full h-11">
        {loading ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
