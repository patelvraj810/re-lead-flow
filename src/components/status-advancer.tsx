"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';

type LeadStatus = 'new' | 'contacted' | 'nurturing' | 'qualified' | 'scheduled' | 'closed_won' | 'closed_lost';

const STATUS_FLOW: Record<LeadStatus, LeadStatus[]> = {
  new: ['contacted'],
  contacted: ['nurturing', 'qualified'],
  nurturing: ['qualified', 'closed_lost'],
  qualified: ['scheduled', 'closed_lost'],
  scheduled: ['closed_won', 'closed_lost'],
  closed_won: [],
  closed_lost: ['new'], // re-activate
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  nurturing: 'Nurturing',
  qualified: 'Qualified',
  scheduled: 'Scheduled',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  nurturing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  qualified: 'bg-green-500/10 text-green-400 border-green-500/20',
  scheduled: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  closed_won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  closed_lost: 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface StatusAdvancerProps {
  leadId: string;
  currentStatus: LeadStatus;
  onStatusChange?: (newStatus: LeadStatus) => void;
}

export function StatusAdvancer({ leadId, currentStatus, onStatusChange }: StatusAdvancerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const availableTransitions = STATUS_FLOW[currentStatus];

  const handleAdvance = async (newStatus: LeadStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }

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
        <span className="text-sm text-muted-foreground">Current:</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[currentStatus]}`}>
          {STATUS_LABELS[currentStatus]}
        </span>
      </div>

      {availableTransitions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">Advance to:</span>
          {availableTransitions.map(status => (
            <Button
              key={status}
              size="sm"
              variant="outline"
              disabled={isUpdating}
              onClick={() => handleAdvance(status)}
              className="text-xs h-7"
            >
              → {STATUS_LABELS[status]}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export { STATUS_LABELS, STATUS_COLORS, STATUS_FLOW };
export type { LeadStatus };