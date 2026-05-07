'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVenueSlotBlocks, blockVenueSlot, unblockVenueSlot } from '@/app/actions/venue';
import { getCached, setCached, invalidateCached } from '@/lib/client-cache';
import type { VenueSlot } from '@/types/database';

const BLOCKS_CACHE_TTL_MS = 60_000; // 1 min
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

interface BlockRow {
  id: string;
  slot_date: string;
  venue_slot_id: string;
  slot_name: string;
}

interface VenueSlotBlocksEditorProps {
  venueId: string;
  offeredSlots: VenueSlot[];
}

export function VenueSlotBlocksEditor({ venueId, offeredSlots }: VenueSlotBlocksEditorProps) {
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDate, setAddDate] = useState('');
  const [addSlotId, setAddSlotId] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBlocks = useCallback(async () => {
    const cacheKey = `venue-slot-blocks-${venueId}`;
    const cached = getCached<BlockRow[]>(cacheKey);
    if (cached) {
      setBlocks(cached);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const result = await getVenueSlotBlocks(venueId, today);
    setLoading(false);
    if (result.error) setError(result.error);
    else {
      const list = result.blocks ?? [];
      setBlocks(list);
      setCached(cacheKey, list, BLOCKS_CACHE_TTL_MS);
    }
  }, [venueId]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addDate || !addSlotId) return;
    setAdding(true);
    setError(null);
    const result = await blockVenueSlot(venueId, addDate, addSlotId);
    setAdding(false);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      toast.success('Date blocked');
      setAddDate('');
      setAddSlotId('');
      invalidateCached(`venue-slot-blocks-${venueId}`);
      loadBlocks();
    }
  }

  async function handleRemove(blockId: string) {
    setError(null);
    const result = await unblockVenueSlot(blockId);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      toast.success('Block removed');
      invalidateCached(`venue-slot-blocks-${venueId}`);
      loadBlocks();
    }
  }

  if (offeredSlots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add booking slots above first, then you can block dates here.
      </p>
    );
  }

  const inputClass =
    'w-full rounded border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-brand focus:ring-2 focus:ring-ring transition-all duration-200';
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded p-3 border border-destructive/20">{error}</p>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[140px]">
          <label className="block text-xs font-medium text-foreground mb-1">Date</label>
          <DatePicker
            value={addDate}
            onChange={setAddDate}
            min={today}
            placeholder="Pick date"
            required
            className="w-full"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-xs font-medium text-foreground mb-1">Slot</label>
          <Select value={addSlotId || undefined} onValueChange={setAddSlotId}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {offeredSlots.map((slot) => (
                <SelectItem key={slot.id} value={slot.id}>
                  {slot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          type="submit"
          disabled={adding}
          className="rounded bg-brand px-4 py-2.5 text-sm font-medium text-[var(--page-bg)] hover:bg-brand-hover disabled:opacity-50 transition-colors duration-200"
        >
          {adding ? 'Adding…' : 'Block slot'}
        </button>
      </form>

      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Blocked slots (upcoming)</h4>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blocked slots.</p>
        ) : (
          <ul className="space-y-2">
            {blocks.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded border border-border bg-section-alt px-3 py-2 text-sm"
              >
                <span className="text-foreground">
                  {b.slot_date} · {b.slot_name}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(b.id)}
                  className="text-brand hover:text-brand-hover font-medium transition-colors"
                >
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
