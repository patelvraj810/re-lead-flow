import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/client';

const STATUS_CONFIG: Record<string, { color: string; dot: string; bg: string; border: string }> = {
  new:         { color: 'text-blue-400', dot: 'bg-blue-400', bg: 'bg-blue-500/[0.06]', border: 'border-blue-500/20' },
  contacted:   { color: 'text-amber-400', dot: 'bg-amber-400', bg: 'bg-amber-500/[0.06]', border: 'border-amber-500/20' },
  nurturing:   { color: 'text-purple-400', dot: 'bg-purple-400', bg: 'bg-purple-500/[0.06]', border: 'border-purple-500/20' },
  qualified:   { color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/20' },
  scheduled:   { color: 'text-indigo-400', dot: 'bg-indigo-400', bg: 'bg-indigo-500/[0.06]', border: 'border-indigo-500/20' },
  closed_won:  { color: 'text-green-400', dot: 'bg-green-400', bg: 'bg-green-500/[0.06]', border: 'border-green-500/20' },
  closed_lost: { color: 'text-red-400', dot: 'bg-red-400', bg: 'bg-red-500/[0.06]', border: 'border-red-500/20' },
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New', contacted: 'Contacted', nurturing: 'Nurturing', qualified: 'Qualified',
  scheduled: 'Scheduled', closed_won: 'Won', closed_lost: 'Lost',
};

export default async function LeadsPage() {
  const supabase = createSupabaseServerClient();
  let leads: any[] = [];

  try {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    leads = Array.isArray(data) ? data : [];
  } catch {}

  const statusCounts: Record<string, number> = {};
  leads.forEach((lead: any) => { statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1; });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Lead <span className="text-gold-gradient">Management</span>
          </h1>
          <p className="text-sm text-[#5a5e6a] mt-1">Track, score, and advance leads through the pipeline</p>
        </div>
        <Link href="/leads/new">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#c9a84c] text-[#07080a] text-sm font-semibold hover:bg-[#dbb85c] transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add Lead
          </button>
        </Link>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 stagger-children">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <div key={status} className={`px-3 py-3 rounded-xl border ${cfg.border} ${cfg.bg} text-center hover-lift`}>
            <div className={`text-2xl font-bold tabular-nums ${cfg.color}`}>{statusCounts[status] || 0}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#5a5e6a] mt-0.5">{STATUS_LABELS[status]}</div>
          </div>
        ))}
      </div>

      {/* Lead table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1e2028] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#8a8e9a]">All Leads</h2>
          <span className="text-[11px] text-[#4a4e5a] tabular-nums">{leads.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2028]">
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#4a4e5a] px-4 py-3">Lead</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#4a4e5a] px-4 py-3">Contact</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#4a4e5a] px-4 py-3">Interest</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#4a4e5a] px-4 py-3">Status</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#4a4e5a] px-4 py-3">Score</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#4a4e5a] px-4 py-3">Source</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#4a4e5a] px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.length > 0 ? leads.map((lead: any) => {
                const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                const scoreColor = lead.score >= 70 ? '#22c55e' : lead.score >= 40 ? '#f59e0b' : '#6b7280';
                return (
                  <tr key={lead.id} className="border-b border-[#1e2028]/50 hover:bg-[#14161a] transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead.id}`} className="font-medium text-[13px] text-[#e0e0e4] group-hover:text-[#c9a84c] transition-colors">
                        {lead.first_name} {lead.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[12px] text-[#8a8e9a]">{lead.email}</div>
                      {lead.phone && <div className="text-[11px] text-[#4a4e5a]">{lead.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#8a8e9a] capitalize">{lead.property_interest || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.border} ${cfg.bg} ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-[#14161a] overflow-hidden">
                          <div className="h-full rounded-full animate-score" style={{ width: `${lead.score}%`, background: scoreColor }} />
                        </div>
                        <span className="text-[12px] font-bold tabular-nums" style={{ color: scoreColor }}>{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#5a5e6a] capitalize">{lead.source}</td>
                    <td className="px-4 py-3 text-[12px] text-[#4a4e5a] font-mono">
                      {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[#3a3e4a]">
                    <div className="text-[13px]">No leads yet</div>
                    <div className="text-[11px] mt-1">Capture your first lead to get started</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}