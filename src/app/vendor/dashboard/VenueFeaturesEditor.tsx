'use client';

import { useState } from 'react';
import { addVenueFeature, addVenueFeaturesBulk, removeVenueFeature } from '@/app/actions/venue';
import { COMMON_FEATURES } from '@/utils/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FeatureRow {
  id: string;
  feature_name: string;
}

export function VenueFeaturesEditor({ venueId, features }: { venueId: string; features: FeatureRow[] }) {
  const [list, setList] = useState(features);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customFeature, setCustomFeature] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const alreadyAdded = new Set(list.map((f) => f.feature_name));
  const availableCommon = COMMON_FEATURES.filter((c) => !alreadyAdded.has(c));

  function selectAll() {
    setSelected(new Set(availableCommon));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function addSelected() {
    if (selected.size === 0) return;
    setError('');
    setAdding(true);
    const names = Array.from(selected);
    const result = await addVenueFeaturesBulk(venueId, names);
    setAdding(false);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    if (result.data?.length) {
      toast.success('Feature added');
      setList((prev) => [...prev, ...result.data!]);
      setSelected(new Set());
    }
  }

  async function addCustom() {
    const name = customFeature.trim();
    if (!name) return;
    if (alreadyAdded.has(name)) {
      setCustomFeature('');
      return;
    }
    setError('');
    setAdding(true);
    const result = await addVenueFeature(venueId, name);
    setAdding(false);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else if (result.id) {
      toast.success('Feature added');
      setList((prev) => [...prev, { id: result.id!, feature_name: name }]);
      setCustomFeature('');
    }
  }

  async function remove(featureId: string) {
    setError('');
    const err = await removeVenueFeature(featureId, venueId);
    if (err.error) {
      setError(err.error);
      toast.error(err.error);
    } else {
      toast.success('Feature removed');
      setList((prev) => prev.filter((f) => f.id !== featureId));
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded p-3 border border-destructive/20">
          {error}
        </p>
      )}

      {list.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Current features</p>
          <div className="flex flex-wrap gap-2">
            {list.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-section-alt border border-border px-4 py-2 text-sm text-foreground"
              >
                {f.feature_name}
                <button
                  type="button"
                  onClick={() => remove(f.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${f.feature_name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {availableCommon.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Add features</p>
          <p className="text-xs text-muted-foreground mb-3">Select one or more, then click Add selected.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {availableCommon.map((name) => (
              <label
                key={name}
                className="flex items-center gap-2 cursor-pointer select-none text-sm text-foreground"
              >
                <Checkbox
                  checked={selected.has(name)}
                  onCheckedChange={(checked) => setSelected((prev) => {
                    const next = new Set(prev);
                    if (checked) next.add(name);
                    else next.delete(name);
                    return next;
                  })}
                  disabled={adding}
                />
                {name}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button
              type="button"
              size="sm"
              onClick={addSelected}
              disabled={selected.size === 0 || adding}
            >
              {adding ? 'Adding…' : `Add selected (${selected.size})`}
            </Button>
            {selected.size > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={clearSelection} disabled={adding}>
                Clear selection
              </Button>
            )}
            {availableCommon.length > 1 && selected.size < availableCommon.length && (
              <Button type="button" variant="outline" size="sm" onClick={selectAll} disabled={adding}>
                Select all
              </Button>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-foreground mb-2">Add a custom feature</p>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={customFeature}
            onChange={(e) => setCustomFeature(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder="e.g. Rooftop"
            className="min-w-[140px] flex-1 max-w-xs rounded border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-ring"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addCustom}
            disabled={!customFeature.trim() || adding}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
