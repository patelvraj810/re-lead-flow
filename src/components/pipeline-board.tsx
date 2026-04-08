"use client";

import Link from 'next/link';
import { Lead } from '@/lib/types';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { ArrowRight, Mail, Phone, Star, TrendingUp, Clock } from 'lucide-react';
import type { LeadStatus } from './status-advancer';

const STATUS_FLOW: Record<string, string[]> = {
  new: ['contacted'],
  contacted: ['nurturing', 'qualified'],
  nurturing: ['qualified', 'closed_lost'],
  qualified: ['scheduled', 'closed_lost'],
  scheduled: ['closed_won', 'closed_lost'],
  closed_won: [],
  closed_lost: ['new'],
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  nurturing: 'Nurturing',
  qualified: 'Qualified',
  scheduled: 'Scheduled',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

const STATUS_CONFIG: Record<string, { color: string; dot: string; bg: string; border: string }> = {
  new:         { color: 'text-blue-400', dot: 'bg-blue-400', bg: 'bg-blue-500/[0.04]', border: 'border-blue-500/20' },
  contacted:   { color: 'text-amber-400', dot: 'bg-amber-400', bg: 'bg-amber-500/[0.04]', border: 'border-amber-500/20' },
  nurturing:   { color: 'text-purple-400', dot: 'bg-purple-400', bg: 'bg-purple-500/[0.04]', border: 'border-purple-500/20' },
  qualified:   { color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/[0.04]', border: 'border-emerald-500/20' },
  scheduled:   { color: 'text-indigo-400', dot: 'bg-indigo-400', bg: 'bg-indigo-500/[0.04]', border: 'border-indigo-500/20' },
  closed_won:  { color: 'text-green-400', dot: 'bg-green-400', bg: 'bg-green-500/[0.04]', border: 'border-green-500/20' },
  closed_lost: { color: 'text-red-400', dot: 'bg-red-400', bg: 'bg-red-500/[0.04]', border: 'border-red-500/20' },
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#6b7280';
  return (
    <div className="flex items-center gap-1">
      <Star className={`w-3 h-3 ${score >= 60 ? 'text-[#c9a84c] fill-[#c9a84c]' : 'text-[#3a3e4a]'}`} />
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}</span>
    </div>
  );
}

export function PipelineBoard({ leadsByStatus }: { leadsByStatus: Record<string, Lead[]> }) {
  const statusOrder = ['new', 'contacted', 'nurturing', 'qualified', 'scheduled', 'closed_won', 'closed_lost'];

  const handleAdvance = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Lead moved to ${STATUS_LABELS[newStatus]}`);
      window.location.reload();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-3">
      {statusOrder.map((status, idx) => {
        const leads = leadsByStatus[status] || [];
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
        return (
          <div
            key={status}
            className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden animate-fade-in-up`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Lane header */}
            <div className="px-3 py-2.5 border-b border-[#1e2028]/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#8a8e9a]">
                  {STATUS_LABELS[status]}
                </h3>
              </div>
              <span className="text-[11px] font-bold tabular-nums bg-[#14161a] px-2 py-0.5 rounded-full text-[#8a8e9a] border border-[#1e2028]">
                {leads.length}
              </span>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 pipeline-lane overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
              {leads.length === 0 ? (
                <div className="text-[12px] text-[#3a3e4a] text-center py-10 border border-dashed border-[#1e2028] rounded-lg">
                  No leads
                </div>
              ) : (
                leads.slice(0, 10).map((lead) => {
                  const nextStatuses = STATUS_FLOW[lead.status] || [];
                  return (
                    <div
                      key={lead.id}
                      className="group p-3 rounded-lg bg-[#0e1013]/80 border border-[#1e2028] hover:border-[#2a2d38] hover:bg-[#12141a] transition-all duration-150 cursor-pointer"
                    >
                      <Link href={`/leads/${lead.id}`} className="block">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold truncate text-[#e0e0e4]">
                              {lead.first_name} {lead.last_name}
                            </div>
                            <div className="text-[11px] text-[#5a5e6a] truncate mt-0.5">{lead.email}</div>
                          </div>
                          <ScoreBadge score={lead.score} />
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          {lead.property_interest && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#14161a] text-[#6b7280] capitalize">
                              {lead.property_interest}
                            </span>
                          )}
                          {lead.source && (
                            <span className="text-[10px] text-[#4a4e5a] capitalize">{lead.source}</span>
                          )}
                        </div>
                      </Link>
                      {/* Advance buttons */}
                      {nextStatuses.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {nextStatuses.map(ns => {
                            const nsCfg = STATUS_CONFIG[ns] || STATUS_CONFIG.new;
                            return (
                              <button
                                key={ns}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdvance(lead.id, ns);
                                }}
                                className={`text-[9px] font-medium px-2 py-0.5 rounded-md border ${nsCfg.border} ${nsCfg.color} ${nsCfg.bg} hover:opacity-80 transition-opacity`}
                              >
                                → {STATUS_LABELS[ns]}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              {leads.length > 10 && (
                <div className="text-[11px] text-[#3a3e4a] text-center py-2">
                  +{leads.length - 10} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}