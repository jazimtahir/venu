'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteVenueAsAdmin } from '@/app/actions/venue';

export function DeleteVenueButton({ venueId }: { venueId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this venue? This cannot be undone.')) return;
    const res = await deleteVenueAsAdmin(venueId);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success('Venue deleted');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors duration-200 sm:min-h-0 sm:py-1.5"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden />
      Delete
    </button>
  );
}
