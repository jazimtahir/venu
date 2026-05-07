'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function ProfileForm({
  fullName: initialFullName,
  phone: initialPhone,
  userId,
}: {
  fullName: string;
  phone: string;
  userId: string;
}) {
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: fullName || null, phone: phone || null })
      .eq('id', userId);
    setLoading(false);
    if (err) {
      setError(err.message);
      toast.error(err.message);
      return;
    }
    toast.success('Profile updated');
    router.refresh();
    router.push('/dashboard');
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded p-3 border border-destructive/20">{error}</p>
      )}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-11"
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="h-11">
          {loading ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="outline" asChild className="h-11">
          <Link href="/dashboard">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
