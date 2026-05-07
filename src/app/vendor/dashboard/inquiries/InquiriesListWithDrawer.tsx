'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Phone,
  Calendar,
  MessageSquare,
  ExternalLink,
  X,
  Loader2,
  CalendarPlus,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getVendorInquiryById,
  updateInquiryStatus,
  updateInquiryExpectedPrice,
  updateInquirySource,
  addInquiryNote,
} from '@/app/actions/inquiries';
import type { InquiryStatus, InquirySource } from '@/types/database';
import { toast } from 'sonner';

const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'lost', label: 'Lost' },
];

const SOURCE_OPTIONS: { value: InquirySource; label: string }[] = [
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'phone', label: 'Phone' },
  { value: 'referral', label: 'Referral' },
];

function statusBadgeClass(status: InquiryStatus): string {
  switch (status) {
    case 'new':
      return 'bg-blush/80 text-ink';
    case 'contacted':
      return 'bg-champagne/80 text-ink';
    case 'negotiating':
      return 'bg-sage/80 text-ink';
    case 'confirmed':
      return 'bg-emerald-500/15 text-emerald-700';
    case 'lost':
      return 'bg-muted/80 text-muted-foreground';
    default:
      return 'bg-muted/80 text-muted-foreground';
  }
}

function sourceBadgeClass(): string {
  return 'bg-section-alt border border-border text-muted-foreground';
}

function formatTimeSince(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

/** WhatsApp link: wa.me/92 + phone digits only (no + or 0 prefix). */
function whatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('92') ? digits : digits.startsWith('0') ? '92' + digits.slice(1) : '92' + digits;
  return `https://wa.me/${normalized}`;
}

type VenueOption = { id: string; name: string; slug: string };
type InquiryRow = {
  id: string;
  venue_id: string;
  name: string;
  phone: string;
  event_date: string | null;
  message: string | null;
  created_at: string;
  event_type?: string | null;
  status: InquiryStatus;
  expected_price: number | null;
  source: InquirySource;
  venues: { name: string; slug: string } | null;
};

interface InquiriesListWithDrawerProps {
  inquiries: InquiryRow[];
  venues: VenueOption[];
}

export function InquiriesListWithDrawer({ inquiries, venues }: InquiriesListWithDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getVendorInquiryById>>['data']>(null);
  const [loading, setLoading] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [expectedPriceInput, setExpectedPriceInput] = useState<string>('');

  const handleRowClick = useCallback(
    (id: string) => {
      setSelectedId(id);
      setOpen(true);
      setLoading(true);
      setDetail(null);
      getVendorInquiryById(id).then((res) => {
        setDetail(res.data);
        setExpectedPriceInput(res.data?.expected_price != null ? String(res.data.expected_price) : '');
        setLoading(false);
      });
    },
    []
  );

  const handleStatusChange = useCallback(
    async (inquiryId: string, status: InquiryStatus) => {
      const res = await updateInquiryStatus(inquiryId, status);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Inquiry status updated');
      if (detail && detail.id === inquiryId) setDetail({ ...detail, status });
      router.refresh();
    },
    [detail, router]
  );

  const handleExpectedPriceChange = useCallback(
    async (inquiryId: string, value: number | null) => {
      const res = await updateInquiryExpectedPrice(inquiryId, value);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Expected price updated');
      setExpectedPriceInput(value != null ? String(value) : '');
      if (detail && detail.id === inquiryId) setDetail({ ...detail, expected_price: value });
      router.refresh();
    },
    [detail, router]
  );

  const handleSourceChange = useCallback(
    async (inquiryId: string, source: InquirySource) => {
      const res = await updateInquirySource(inquiryId, source);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Source updated');
      if (detail && detail.id === inquiryId) setDetail({ ...detail, source });
      router.refresh();
    },
    [detail, router]
  );

  const handleAddNote = useCallback(
    async () => {
      if (!selectedId || !noteInput.trim()) return;
      setSubmittingNote(true);
      const res = await addInquiryNote(selectedId, noteInput.trim());
      setSubmittingNote(false);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Note added');
      setNoteInput('');
      const updated = await getVendorInquiryById(selectedId);
      if (updated.data) setDetail(updated.data);
      router.refresh();
    },
    [selectedId, noteInput, router]
  );

  const statusFilter = searchParams.get('status') || '';
  const sourceFilter = searchParams.get('source') || '';
  const venueFilter = searchParams.get('venue_id') || '';

  const setFilter = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/vendor/dashboard/inquiries?${next.toString()}`);
    },
    [router, searchParams]
  );

  const activeFilterCount = [statusFilter, sourceFilter, venueFilter].filter(Boolean).length;

  const filterControls = (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">Status</span>
        <Select value={statusFilter || 'all'} onValueChange={(v) => setFilter('status', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">Source</span>
        <Select value={sourceFilter || 'all'} onValueChange={(v) => setFilter('source', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {SOURCE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">Venue</span>
        <Select value={venueFilter || 'all'} onValueChange={(v) => setFilter('venue_id', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Venue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All venues</SelectItem>
            {venues.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Desktop: inline filters */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filters:</span>
        <Select value={statusFilter || 'all'} onValueChange={(v) => setFilter('status', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter || 'all'} onValueChange={(v) => setFilter('source', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {SOURCE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={venueFilter || 'all'} onValueChange={(v) => setFilter('venue_id', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Venue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All venues</SelectItem>
            {venues.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile: Filters button + Sheet */}
      <div className="md:hidden w-full">
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="w-full min-h-[44px] gap-2 border-border"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[85vh] flex flex-col p-0 rounded-t-2xl"
          >
            <SheetHeader className="p-4 border-b border-border shrink-0">
              <SheetTitle className="text-left">Filters</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto flex-1 p-4">
              {filterControls}
            </div>
            <div className="p-4 border-t border-border shrink-0">
              <Button
                className="w-full min-h-[44px]"
                onClick={() => setFiltersOpen(false)}
              >
                Show results
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* List */}
      {inquiries.length > 0 ? (
        <ul className="space-y-2">
          {inquiries.map((inq) => {
            const venue = inq.venues ? (Array.isArray(inq.venues) ? inq.venues[0] : inq.venues) : null;
            return (
              <li
                key={inq.id}
                role="button"
                tabIndex={0}
                onClick={() => handleRowClick(inq.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleRowClick(inq.id)}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded border border-border bg-section-alt p-4 shadow-[var(--shadow-soft)] transition-colors hover:border-brand/30 cursor-pointer"
              >
                <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="font-medium text-foreground">{inq.name}</span>
                  <span className="text-muted-foreground">{inq.phone}</span>
                  {inq.event_date && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(inq.event_date).toLocaleDateString()}
                    </span>
                  )}
                  {inq.event_type && (
                    <span className="text-muted-foreground">{String(inq.event_type).charAt(0).toUpperCase() + String(inq.event_type).slice(1)}</span>
                  )}
                  {venue && (
                    <Link
                      href={`/venue/${venue.slug}`}
                      className="text-brand hover:underline flex items-center gap-1 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {venue.name}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${sourceBadgeClass()}`}>
                    {SOURCE_OPTIONS.find((o) => o.value === inq.source)?.label ?? inq.source}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadgeClass(inq.status)}`}>
                    {STATUS_OPTIONS.find((o) => o.value === inq.status)?.label ?? inq.status}
                  </span>
                  {inq.expected_price != null && (
                    <span className="font-medium text-foreground">Rs {Number(inq.expected_price).toLocaleString()}</span>
                  )}
                  <time className="text-xs text-muted-foreground">{formatTimeSince(inq.created_at)}</time>
                </div>
                <div className="flex shrink-0 items-center gap-2 border-t border-border pt-3 sm:border-t-0 sm:pt-0 sm:pl-3 sm:border-l">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-[44px] gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(inq.id);
                    }}
                    title="View inquiry"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <a
                    href={whatsAppLink(inq.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-3 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-95 min-h-[44px]"
                    onClick={(e) => e.stopPropagation()}
                    title="Chat on WhatsApp"
                  >
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded border border-dashed border-border bg-section-alt py-16 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <p className="mt-4 text-muted-foreground">No inquiries match your filters.</p>
        </div>
      )}

      {/* Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col w-full max-w-md overflow-y-auto p-6">
          <SheetHeader className="flex-shrink-0 px-0">
            <SheetTitle>Inquiry detail</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-6 top-6">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </SheetHeader>
          <div className="flex-1 space-y-6 pt-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && detail && (
              <>
                <div className="space-y-4">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    {detail.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      {detail.phone}
                    </span>
                    <a
                      href={whatsAppLink(detail.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-95 shrink-0"
                      title="Chat on WhatsApp"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat on WhatsApp
                    </a>
                  </div>
                  {detail.event_date && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Event: {new Date(detail.event_date).toLocaleDateString()}
                    </p>
                  )}
                  {detail.message && (
                    <p className="flex gap-2 text-sm text-foreground">
                      <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      {detail.message}
                    </p>
                  )}
                </div>

                {!(detail as { has_confirmed_booking?: boolean }).has_confirmed_booking && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button asChild size="sm">
                      <Link href={`/vendor/dashboard/bookings/new?inquiry_id=${(detail as { id: string }).id}`}>
                        <CalendarPlus className="h-4 w-4" />
                        Convert to booking
                      </Link>
                    </Button>
                  </div>
                )}
                <div className="space-y-3">
                  <Label className="text-muted-foreground">Status</Label>
                  <Select
                    value={detail.status}
                    onValueChange={(v) => handleStatusChange(detail.id, v as InquiryStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-muted-foreground">Expected price (Rs)</Label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={expectedPriceInput}
                    onChange={(e) => setExpectedPriceInput(e.target.value)}
                    onBlur={() => {
                      const v = expectedPriceInput.trim();
                      const num = v === '' ? null : Number(v);
                      if (v === '' || !Number.isNaN(num)) handleExpectedPriceChange(detail.id, num);
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-muted-foreground">Source</Label>
                  <Select
                    value={detail.source}
                    onValueChange={(v) => handleSourceChange(detail.id, v as InquirySource)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t border-border pt-4">
                  <Label className="text-muted-foreground">Notes</Label>
                  <ul className="mt-2 space-y-2">
                    {(detail as { inquiry_notes?: { id: string; note: string; created_at: string }[] }).inquiry_notes?.map(
                      (n) => (
                        <li key={n.id} className="rounded bg-section-alt px-3 py-2 text-sm text-foreground">
                          {n.note}
                          <span className="block text-xs text-muted-foreground mt-1">
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <Input
                      placeholder="Add a note..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNote())}
                    />
                    <Button onClick={handleAddNote} disabled={submittingNote || !noteInput.trim()}>
                      {submittingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
