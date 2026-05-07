'use client';

import { useState } from 'react';
import { addVenueSlot, removeVenueSlot } from '@/app/actions/venue';
import type { VenueSlot } from '@/types/database';
import { formatTime12h } from '@/lib/utils';
import { toast } from 'sonner';

function timeToInputValue(t: string) {
  if (!t) return '';
  const parts = t.split(':');
  return `${parts[0] ?? '09'}:${parts[1] ?? '00'}`;
}

export function VenueSlotsEditor({ venueId, slots }: { venueId: string; slots: VenueSlot[] }) {
  const [list, setList] = useState(slots);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('14:00');

  const inputClass =
    'w-full rounded border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-brand focus:ring-2 focus:ring-ring transition-all duration-200';

  async function add() {
    const name = newName.trim();
    if (!name) {
      setError('Slot name is required.');
      return;
    }
    setError('');
    const result = await addVenueSlot(venueId, {
      name,
      startTime: newStart,
      endTime: newEnd,
    });
    if (result.error) setError(result.error);
    else if (result.id) {
      setList((prev) => [
        ...prev,
        {
          id: result.id!,
          venue_id: venueId,
          name,
          start_time: newStart,
          end_time: newEnd,
          display_order: list.length,
        },
      ]);
      setAdding(false);
      setNewName('');
      setNewStart('09:00');
      setNewEnd('14:00');
    }
  }

  async function remove(slot: VenueSlot) {
    setError('');
    const err = await removeVenueSlot(slot.id, venueId);
    if (err.error) {
      setError(err.error);
      toast.error(err.error);
    } else {
      toast.success('Slot removed');
      setList((prev) => prev.filter((s) => s.id !== slot.id));
    }
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded p-3 border border-destructive/20 mb-4">{error}</p>
      )}
      <div className="space-y-3">
        {list.map((slot) => (
          <div
            key={slot.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-section-alt px-4 py-3"
          >
            <div>
              <span className="font-medium text-foreground">{slot.name}</span>
              <span className="text-sm text-muted-foreground ml-2">
                {formatTime12h(slot.start_time)} – {formatTime12h(slot.end_time)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => remove(slot)}
              className="rounded bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="mt-4 flex flex-wrap items-end gap-3 rounded border border-border bg-card p-4">
          <div className="min-w-[160px] flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">Slot name *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Morning 9am–2pm"
              className={inputClass}
            />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-foreground mb-1">Start</label>
            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-foreground mb-1">End</label>
            <input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={add}
            className="rounded bg-brand px-4 py-2.5 text-sm font-medium text-[var(--page-bg)] hover:bg-brand-hover transition-colors duration-200"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setNewName('');
              setNewStart('09:00');
              setNewEnd('14:00');
              setError('');
            }}
            className="rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-section-alt transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 rounded border-2 border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:border-brand hover:text-brand transition-colors duration-200"
        >
          + Add booking slot
        </button>
      )}
    </div>
  );
}
