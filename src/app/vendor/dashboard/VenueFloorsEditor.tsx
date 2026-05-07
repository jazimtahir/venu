'use client';

import { useState } from 'react';
import { addVenueFloor, removeVenueFloor } from '@/app/actions/venue';
import type { VenueFloor } from '@/types/database';
import { toast } from 'sonner';

export function VenueFloorsEditor({ venueId, floors }: { venueId: string; floors: VenueFloor[] }) {
  const [list, setList] = useState(floors);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCapacity, setNewCapacity] = useState('');

  const inputClass =
    'w-full rounded border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-ring transition-all duration-200';

  async function add() {
    const name = newName.trim();
    if (!name) {
      setError('Floor/hall name is required.');
      return;
    }
    setError('');
    const result = await addVenueFloor(venueId, {
      name,
      capacity: newCapacity ? Number(newCapacity) : undefined,
    });
    if (result.error) setError(result.error);
    else if (result.id) {
      setList((prev) => [
        ...prev,
        {
          id: result.id!,
          venue_id: venueId,
          name,
          capacity: newCapacity ? Number(newCapacity) : null,
          display_order: list.length,
        },
      ]);
      setAdding(false);
      setNewName('');
      setNewCapacity('');
    }
  }

  async function remove(floor: VenueFloor) {
    setError('');
    const err = await removeVenueFloor(floor.id, venueId);
    if (err.error) {
      setError(err.error);
      toast.error(err.error);
    } else {
      toast.success('Floor removed');
      setList((prev) => prev.filter((f) => f.id !== floor.id));
    }
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded p-3 border border-destructive/20 mb-4">{error}</p>
      )}
      <div className="space-y-3">
        {list.map((floor) => (
          <div
            key={floor.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-section-alt px-4 py-3"
          >
            <span className="font-medium text-foreground">{floor.name}</span>
            <div className="flex items-center gap-3">
              {floor.capacity != null && (
                <span className="text-sm text-muted-foreground">Capacity: {floor.capacity}</span>
              )}
              <button
                type="button"
                onClick={() => remove(floor)}
                className="rounded bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="mt-4 flex flex-wrap items-end gap-3 rounded border border-border bg-card p-4">
          <div className="min-w-[180px] flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">Floor / hall name *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Ground Hall, Lawn"
              className={inputClass}
            />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-foreground mb-1">Capacity</label>
            <input
              type="number"
              min={0}
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
              placeholder="Optional"
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
              setNewCapacity('');
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
          + Add floor / hall
        </button>
      )}
    </div>
  );
}
