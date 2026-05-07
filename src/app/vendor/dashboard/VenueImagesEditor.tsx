'use client';

import { useState } from 'react';
import Image from 'next/image';
import { uploadVenueImage, deleteVenueImage } from '@/app/actions/venue';
import { toast } from 'sonner';

interface ImageRow {
  id: string;
  image_url: string;
  display_order: number;
}

export function VenueImagesEditor({ venueId, images }: { venueId: string; images: ImageRow[] }) {
  const [list, setList] = useState(images);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    const formData = new FormData();
    formData.set('venueId', venueId);
    formData.set('file', file);
    const result = await uploadVenueImage(formData);
    setUploading(false);
    if (result.error) setError(result.error);
    else if (result.id != null && result.url) setList((prev) => [...prev, { id: result.id as string, image_url: result.url!, display_order: prev.length }]);
    e.target.value = '';
  }

  async function remove(imageId: string) {
    setError('');
    const err = await deleteVenueImage(venueId, imageId);
    if (err.error) {
      setError(err.error);
      toast.error(err.error);
    } else {
      toast.success('Image removed');
      setList((prev) => prev.filter((i) => i.id !== imageId));
    }
  }

  return (
    <div>
      {error && <p className="text-sm text-destructive bg-destructive/10 rounded p-3 border border-destructive/20 mb-4">{error}</p>}
      <div className="flex flex-wrap gap-4">
        {list.map((img) => (
          <div key={img.id} className="relative group">
            <div className="w-32 h-32 relative rounded overflow-hidden bg-section-alt border border-border">
              <Image src={img.image_url} alt="" fill className="object-cover" sizes="128px" />
            </div>
            <button
              type="button"
              onClick={() => remove(img.id)}
              className="absolute top-2 right-2 rounded bg-destructive px-2 py-1 text-xs font-medium text-[var(--page-bg)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
            >
              Remove
            </button>
          </div>
        ))}
        <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-border bg-section-alt text-center text-sm text-muted-foreground transition-colors hover:border-brand hover:bg-brand/5 hover:text-brand">
          <input type="file" accept="image/*" className="hidden" onChange={onFileSelect} disabled={uploading} />
          {uploading ? 'Uploading…' : '+ Add image'}
        </label>
      </div>
    </div>
  );
}
