"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Play, Users, Mail, MessageSquare, Phone, Clock, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="w-3.5 h-3.5" />,
  sms: <MessageSquare className="w-3.5 h-3.5" />,
  call: <Phone className="w-3.5 h-3.5" />,
};

const ENROLLMENT_STATUS: Record<string, { color: string; bg: string; border: string }> = {
  active:    { color: 'text-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/20' },
  paused:    { color: 'text-amber-400', bg: 'bg-amber-500/[0.06]', border: 'border-amber-500/20' },
  completed: { color: 'text-blue-400', bg: 'bg-blue-500/[0.06]', border: 'border-blue-500/20' },
  opted_out: { color: 'text-red-400', bg: 'bg-red-500/[0.06]', border: 'border-red-500/20' },
};

export function NurturePageClient({
  sequences, enrollments, nurtureLog,
}: {
  sequences: any[]; enrollments: any[]; nurtureLog: any[];
}) {
  const handleProcessNurture = async () => {
    try {
      const res = await fetch('/api/nurture/process', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const result = await res.json();
      toast.success(`Processed ${result.processed} nurture steps`);
      window.location.reload();
    } catch { toast.error('Failed to process nurture steps'); }
  };

  const activeEnrollments = enrollments.filter((e: any) => e.status === 'active');
  const completedEnrollments = enrollments.filter((e: any) => e.status === 'completed');

  const metrics = [
    { label: 'Sequences', value: sequences.length, accent: '#c9a84c', icon: Sparkles },
    { label: 'Active', value: activeEnrollments.length, accent: '#22c55e', icon: Zap },
    { label: 'Completed', value: completedEnrollments.length, accent: '#3b82f6', icon: Users },
    { label: 'Sent', value: nurtureLog.length, accent: '#a855f7', icon: Mail },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nurture <span className="text-gold-gradient">Sequences</span>
          </h1>
          <p className="text-sm text-[#5a5e6a] mt-1">Automated drip campaigns to engage and convert leads</p>
        </div>
        <Button onClick={handleProcessNurture} variant="outline" size="sm"
          className="border-[#1e2028] bg-[#0e1013] text-[#8a8e9a] hover:text-[#c9a84c] hover:border-[#c9a84c]/30">
          <Play className="w-3.5 h-3.5 mr-2" />
          Process Due Steps
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {metrics.map(m => (
          <div key={m.label} className="metric-card glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4a4e5a]">{m.label}</span>
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${m.accent}12`, border: `1px solid ${m.accent}25` }}>
                <m.icon className="w-3 h-3" style={{ color: m.accent }} />
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums animate-count">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Sequences */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1e2028]">
          <h2 className="text-sm font-semibold text-[#8a8e9a]">Active Sequences</h2>
        </div>
        <div className="p-4 space-y-3">
          {sequences.length === 0 ? (
            <p className="text-[12px] text-[#3a3e4a] text-center py-8">No sequences configured yet.</p>
          ) : sequences.map((seq: any) => (
            <div key={seq.id} className="p-4 rounded-lg bg-[#0e1013] border border-[#1e2028] hover:border-[#2a2d38] transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-[14px] text-[#e0e0e4]">{seq.name}</h3>
                  <p className="text-[12px] text-[#5a5e6a] mt-0.5">{seq.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#14161a] border border-[#1e2028] text-[#5a5e6a]">
                      Trigger: {seq.trigger_status}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${seq.is_active ? 'bg-[#22c55e]/[0.06] border-[#22c55e]/20 text-[#22c55e]' : 'bg-[#14161a] border-[#1e2028] text-[#4a4e5a]'}`}>
                      {seq.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Steps */}
              {seq.nurture_steps && seq.nurture_steps.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {seq.nurture_steps.sort((a: any, b: any) => a.step_order - b.step_order).map((step: any) => (
                    <div key={step.id} className="flex items-center gap-3 text-[12px] bg-[#0a0b0e] rounded-lg px-3 py-2 border border-[#1a1c22]">
                      <div className="flex items-center gap-1.5 text-[#5a5e6a]">
                        {CHANNEL_ICONS[step.channel] || <Mail className="w-3.5 h-3.5" />}
                        <span className="capitalize text-[11px]">{step.channel}</span>
                      </div>
                      <div className="flex-1 truncate text-[#6b7280]">
                        {step.subject && <span className="text-[#8a8e9a] font-medium">{step.subject}</span>}
                        <span className="text-[#4a4e5a]">{step.subject ? ' — ' : ''}{step.body_template.substring(0, 60)}…</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#3a3e4a]">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] tabular-nums">{step.delay_hours}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Enrollments */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1e2028]">
          <h2 className="text-sm font-semibold text-[#8a8e9a]">Enrollments</h2>
        </div>
        <div className="p-4 space-y-2">
          {enrollments.length === 0 ? (
            <p className="text-[12px] text-[#3a3e4a] text-center py-8">No enrollments yet. Leads auto-enroll when created.</p>
          ) : enrollments.map((enrollment: any) => {
            const eCfg = ENROLLMENT_STATUS[enrollment.status] || ENROLLMENT_STATUS.active;
            return (
              <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0e1013] border border-[#1e2028]">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/leads/${enrollment.lead_id}`} className="font-medium text-[13px] text-[#e0e0e4] hover:text-[#c9a84c] transition-colors">
                      {enrollment.leads?.first_name} {enrollment.leads?.last_name}
                    </Link>
                    <span className="text-[11px] text-[#4a4e5a]">{enrollment.leads?.email}</span>
                  </div>
                  <div className="text-[11px] text-[#4a4e5a] mt-0.5">
                    {enrollment.nurture_sequences?.name || 'Unknown'} · Step {enrollment.current_step + 1}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${eCfg.border} ${eCfg.bg} ${eCfg.color}`}>
                    {enrollment.status}
                  </span>
                  {enrollment.next_step_at && enrollment.status === 'active' && (
                    <span className="text-[10px] text-[#3a3e4a]">
                      {new Date(enrollment.next_step_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}