"use client";

import { useState } from 'react';
import { toast } from 'sonner';

type LeadStatus = 'new' | 'contacted' | 'nurturing' | 'qualified' | 'scheduled' | 'closed_won' | 'closed_lost';

const STATUS_FLOW: Record<LeadStatus, LeadStatus[]> = {
  new: ['contacted'],
  contacted: ['nurturing', 'qualified'],
  nurturing: ['qualified', 'closed_lost'],
  qualified: ['scheduled', 'closed_lost'],
  scheduled: ['closed_won', 'closed_lost'],
  closed_won: [],
  closed_lost: ['new'],
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New', contacted: 'Contacted', nurturing: 'Nurturing', qualified: 'Qualified',
  scheduled: 'Scheduled', closed_won: 'Closed Won', closed_lost: 'Closed Lost',
};

const STATUS_CFG: Record<LeadStatus, { color: string; dot: string; bg: string; border: string }> = {
  new:         { color: 'text-blue-400', dot: 'bg-blue-400', bg: 'bg-blue-500/[0.06]', border: 'border-blue-500/20' },
  contacted:   { color: 'text-amber-400', dot: 'bg-amber-400', bg: 'bg-amber-500/[0.06]', border: 'border-amber-500/20' },
  nurturing:   { color: 'text-purple-400', dot: 'bg-purple-400', bg: 'bg-purple-500/[0.06]', border: 'border-purple-500/20' },
  qualified:   { color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/20' },
  scheduled:   { color: 'text-indigo-400', dot: 'bg-indigo-400', bg: 'bg-indigo-500/[0.06]', border: 'border-indigo-500/20' },
  closed_won:  { color: 'text-green-400', dot: 'bg-green-400', bg: 'bg-green-500/[0.06]', border: 'border-green-500/20' },
  closed_lost: { color: 'text-red-400', dot: 'bg-red-400', bg: 'bg-red-500/[0.06]', border: 'border-red-500/20' },
};

interface StatusAdvancerProps {
  leadId: string;
  currentStatus: LeadStatus;
  onStatusChange?: (newStatus: LeadStatus) => void;
}

export function StatusAdvancer({ leadId, currentStatus, onStatusChange }: StatusAdvancerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const availableTransitions = STATUS_FLOW[currentStatus];
  const cfg = STATUS_CFG[currentStatus];

  const handleAdvance = async (newStatus: LeadStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      toast.success(`Lead moved to ${STATUS_LABELS[newStatus]}`);
      onStatusChange?.(newStatus);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-[#5a5e6a]">Current:</span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${cfg.border} ${cfg.bg} ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {STATUS_LABELS[currentStatus]}
        </span>
      </div>

      {availableTransitions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] text-[#4a4e5a] self-center">Advance to:</span>
          {availableTransitions.map(status => {
            const sCfg = STATUS_CFG[status];
            return (
              <button
                key={status}
                disabled={isUpdating}
                onClick={() => handleAdvance(status)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${sCfg.border} ${sCfg.bg} ${sCfg.color} hover:opacity-80 transition-opacity disabled:opacity-50`}
              >
                → {STATUS_LABELS[status]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { STATUS_LABELS, STATUS_CFG, STATUS_FLOW };
export type { LeadStatus };