'use client';

import { useState } from 'react';
import { addVenueCateringPackage, removeVenueCateringPackage } from '@/app/actions/venue';
import type { VenueCateringPackage } from '@/types/database';
import { toast } from 'sonner';

interface PackageRow extends VenueCateringPackage {}

export function VenueCateringPackagesEditor({
  venueId,
  packages: initialPackages,
}: {
  venueId: string;
  packages: PackageRow[];
}) {
  const [list, setList] = useState(initialPackages);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPerHead, setNewPerHead] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMenuText, setNewMenuText] = useState('');

  const inputClass =
    'w-full rounded border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-ring transition-all duration-200';

  async function add() {
    const name = newName.trim();
    const perHead = newPerHead ? Number(newPerHead) : 0;
    if (!name || perHead <= 0) {
      setError('Name and per-head price (PKR) are required.');
      return;
    }
    setError('');
    const result = await addVenueCateringPackage(venueId, {
      name,
      perHeadPrice: perHead,
      description: newDescription.trim() || undefined,
      menuText: newMenuText.trim() || undefined,
      displayOrder: list.length,
    });
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else if (result.id) {
      toast.success('Package added');
      setList((prev) => [
        ...prev,
        {
          id: result.id!,
          venue_id: venueId,
          name,
          per_head_price: perHead,
          description: newDescription.trim() || null,
          menu_text: newMenuText.trim() || null,
          display_order: list.length,
        },
      ]);
      setAdding(false);
      setNewName('');
      setNewPerHead('');
      setNewDescription('');
      setNewMenuText('');
    }
  }

  async function remove(pkg: PackageRow) {
    setError('');
    const err = await removeVenueCateringPackage(pkg.id, venueId);
    if (err.error) {
      setError(err.error);
      toast.error(err.error);
    } else {
      toast.success('Package removed');
      setList((prev) => prev.filter((p) => p.id !== pkg.id));
    }
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded p-3 border border-destructive/20 mb-4">{error}</p>
      )}
      <div className="space-y-4">
        {list.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded border border-border bg-section-alt p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground">{pkg.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">Rs {pkg.per_head_price.toLocaleString()} per head</p>
              {pkg.description && (
                <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
              )}
              {pkg.menu_text && (
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{pkg.menu_text}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(pkg)}
              className="shrink-0 rounded bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Package name *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Silver Package"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Per head price (PKR) *</label>
            <input
              type="number"
              min={1}
              value={newPerHead}
              onChange={(e) => setNewPerHead(e.target.value)}
              placeholder="e.g. 1500"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description (optional)</label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Short blurb"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Menu / dishes (optional)</label>
            <textarea
              rows={3}
              value={newMenuText}
              onChange={(e) => setNewMenuText(e.target.value)}
              placeholder="Biryani, Qorma, Salad, Raita..."
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={add}
              className="rounded bg-brand px-4 py-2.5 text-sm font-medium text-[var(--page-bg)] hover:bg-brand-hover transition-colors duration-200"
            >
              Add package
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setNewName('');
                setNewPerHead('');
                setNewDescription('');
                setNewMenuText('');
                setError('');
              }}
              className="rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-section-alt transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 rounded border-2 border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:border-brand hover:text-brand transition-colors duration-200"
        >
          + Add catering package
        </button>
      )}
    </div>
  );
}
