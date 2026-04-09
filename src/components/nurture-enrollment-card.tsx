"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Sparkles, X } from 'lucide-react';

interface NurtureEnrollmentCardProps {
  leadId: string;
  currentEnrollments: any[];
  onEnrolled?: () => void;
}

const SEQUENCE_OPTIONS = [
  { value: 'new', label: 'New Lead Warm-Up' },
  { value: 'nurturing', label: 'Buyer Nurture' },
  { value: 'contacted', label: 'Re-Engagement' },
] as const;

const STATUS_CFG: Record<string, { color: string; bg: string; border: string }> = {
  active:    { color: 'text-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/20' },
  paused:    { color: 'text-amber-400', bg: 'bg-amber-500/[0.06]', border: 'border-amber-500/20' },
  completed: { color: 'text-blue-400', bg: 'bg-blue-500/[0.06]', border: 'border-blue-500/20' },
  opted_out: { color: 'text-red-400', bg: 'bg-red-500/[0.06]', border: 'border-red-500/20' },
};

export function NurtureEnrollmentCard({ leadId, currentEnrollments, onEnrolled }: NurtureEnrollmentCardProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState('new');

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const seqRes = await fetch('/api/nurture/sequences');
      if (!seqRes.ok) throw new Error('Failed to fetch sequences');
      const sequences = await seqRes.json();
      const sequence = sequences.find((s: any) => s.trigger_status === selectedSequence);
      if (!sequence) throw new Error('Sequence not found');

      const res = await fetch('/api/nurture/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, sequence_id: sequence.id }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to enroll'); }

      toast.success('Lead enrolled in nurture sequence!');
      onEnrolled?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleOptOut = async (enrollmentId: string) => {
    try {
      const res = await fetch(`/api/nurture/enroll?enrollment_id=${enrollmentId}`, { method: 'DELETE' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to opt out'); }
      toast.success('Lead opted out of nurture sequence');
      onEnrolled?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to opt out');
    }
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#1e2028]">
        <h3 className="text-[13px] font-semibold text-[#8a8e9a]">Nurture Sequences</h3>
      </div>
      <div className="p-4 space-y-4">
        {/* Current enrollments */}
        {currentEnrollments.length > 0 && (
          <div className="space-y-2">
            {currentEnrollments.map((enrollment: any) => {
              const cfg = STATUS_CFG[enrollment.status] || STATUS_CFG.active;
              return (
                <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0e1013] border border-[#1e2028]">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[13px] text-[#e0e0e4]">
                      {enrollment.nurture_sequences?.name || 'Unknown Sequence'}
                    </div>
                    <div className="text-[11px] text-[#5a5e6a] mt-0.5">
                      Step {enrollment.current_step + 1} · Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.bg} ${cfg.color}`}>
                      {enrollment.status}
                    </span>
                    {enrollment.status === 'active' && (
                      <button
                        onClick={() => handleOptOut(enrollment.id)}
                        className="text-[#ef4444] hover:text-[#dc2626] transition-colors p-1"
                        title="Opt out"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enroll in new sequence */}
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-[12px] text-[#6b7280]">Enroll in sequence</label>
            <select
              value={selectedSequence}
              onChange={e => setSelectedSequence(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-[#1e2028] bg-[#0e1013] px-3 py-1.5 text-sm text-[#e0e0e4] focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30"
            >
              {SEQUENCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#c9a84c] text-[#07080a] text-sm font-semibold hover:bg-[#dbb85c] disabled:opacity-50 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isEnrolling ? 'Enrolling...' : 'Enroll'}
          </button>
        </div>
      </div>
    </div>
  );
}