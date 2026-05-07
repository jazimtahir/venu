import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileForm } from './ProfileForm';

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single();

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-h2 text-foreground font-normal">Edit profile</h1>
      <ProfileForm
        fullName={profile?.full_name ?? ''}
        phone={profile?.phone ?? ''}
        userId={user.id}
      />
    </div>
  );
}
