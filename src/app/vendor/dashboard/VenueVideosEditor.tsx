'use client';

import { useState } from 'react';
import { addVenueVideoUrl, uploadVenueVideo, deleteVenueVideo } from '@/app/actions/venue';
import type { VenueVideo } from '@/types/database';
import { toast } from 'sonner';

export function VenueVideosEditor({ venueId, videos }: { venueId: string; videos: VenueVideo[] }) {
  const [list, setList] = useState(videos);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);
  const [uploading, setUploading] = useState(false);

  const inputClass =
    'w-full rounded border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-ring transition-all duration-200';

  async function addByUrl() {
    const url = urlInput.trim();
    if (!url) return;
    setError('');
    const result = await addVenueVideoUrl(venueId, url);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else if (result.id) {
      toast.success('Video added');
      setList((prev) => [...prev, { id: result.id!, venue_id: venueId, video_url: url, display_order: prev.length }]);
      setUrlInput('');
      setAddingUrl(false);
    }
  }

  async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    const formData = new FormData();
    formData.set('venueId', venueId);
    formData.set('file', file);
    const result = await uploadVenueVideo(formData);
    setUploading(false);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else if (result.id != null && result.url) {
      toast.success('Video added');
      setList((prev) => [...prev, { id: result.id as string, venue_id: venueId, video_url: result.url!, display_order: list.length }]);
    }
    e.target.value = '';
  }

  async function remove(video: VenueVideo) {
    setError('');
    const err = await deleteVenueVideo(video.id, venueId);
    if (err.error) {
      setError(err.error);
      toast.error(err.error);
    } else {
      toast.success('Video removed');
      setList((prev) => prev.filter((v) => v.id !== video.id));
    }
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded p-3 border border-destructive/20 mb-4">{error}</p>
      )}
      <div className="space-y-4">
        {list.map((video) => (
          <div
            key={video.id}
            className="rounded-xl border border-stone-200 bg-stone-50/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm text-stone-600 truncate">{video.video_url}</p>
            </div>
            <button
              type="button"
              onClick={() => remove(video)}
              className="shrink-0 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {addingUrl ? (
        <div className="mt-4 flex flex-wrap items-end gap-2 rounded border border-border bg-card p-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-foreground mb-1">Video URL (YouTube, Vimeo, or direct link)</label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={addByUrl}
            className="rounded bg-brand px-4 py-2.5 text-sm font-medium text-[var(--page-bg)] hover:bg-brand-hover transition-colors duration-200"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setAddingUrl(false); setUrlInput(''); setError(''); }}
            className="rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-section-alt transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAddingUrl(true)}
            className="rounded border-2 border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:border-brand hover:text-brand transition-colors duration-200"
          >
            + Add video URL
          </button>
          <label className="rounded border-2 border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:border-brand hover:text-brand transition-colors duration-200 cursor-pointer">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={onFileSelect}
              disabled={uploading}
            />
            {uploading ? 'Uploading…' : '+ Upload video'}
          </label>
        </div>
      )}
    </div>
  );
}
