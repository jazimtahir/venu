import { createClient } from '@/lib/supabase/server';
import { verifyVendorAction } from './actions';
import { AdminPendingButton } from '@/components/admin/AdminPendingButton';
import { Users, CheckCircle } from 'lucide-react';

export default async function AdminVendorsPage() {
  const supabase = await createClient();
  const { data: vendors } = await supabase
    .from('vendors')
    .select(`
      id,
      business_name,
      city,
      vendor_type,
      is_verified,
      profiles ( full_name )
    `)
    .order('created_at', { ascending: false });

  const list = vendors ?? [];

  return (
    <div>
      <h2 className="text-h2 text-foreground font-normal mb-6">Vendors</h2>
      {list.length > 0 ? (
        <div className="overflow-x-auto rounded border border-border shadow-[var(--shadow-soft)]">
          <p className="sm:hidden px-4 pt-2 text-xs text-muted-foreground">Scroll horizontally to see all columns</p>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-section-alt/80">
                <th className="p-4 font-semibold text-foreground">Business</th>
                <th className="p-4 font-semibold text-foreground">Contact</th>
                <th className="p-4 font-semibold text-foreground">City</th>
                <th className="p-4 font-semibold text-foreground">Verified</th>
              </tr>
            </thead>
            <tbody>
              {list.map((v) => {
                const profile = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles;
                return (
                  <tr key={v.id} className="border-b border-border last:border-0 transition-colors duration-200 hover:bg-section-alt/60">
                    <td className="p-4 font-medium text-foreground">{v.business_name}</td>
                    <td className="p-4 text-muted-foreground">{profile?.full_name ?? '—'}</td>
                    <td className="p-4 text-foreground">{v.city}</td>
                    <td className="p-4">
                      <form action={verifyVendorAction} className="inline">
                        <input type="hidden" name="vendorId" value={v.id} />
                        <input type="hidden" name="verified" value={v.is_verified ? 'false' : 'true'} />
                        <AdminPendingButton
                          className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${v.is_verified ? 'bg-brand/15 text-brand hover:bg-brand/25' : 'bg-section-alt text-muted-foreground hover:bg-section-alt/80'}`}
                        >
                          <CheckCircle className={`h-3.5 w-3.5 ${v.is_verified ? 'text-brand' : ''}`} aria-hidden />
                          {v.is_verified ? 'Verified' : 'Verify'}
                        </AdminPendingButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded border border-dashed border-border bg-section-alt py-16 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <p className="mt-4 text-muted-foreground">No vendors yet.</p>
        </div>
      )}
    </div>
  );
}
