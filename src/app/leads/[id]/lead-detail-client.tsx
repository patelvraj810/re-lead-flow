"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusAdvancer } from '@/components/status-advancer';
import { AppointmentForm } from '@/components/appointment-form';
import { NurtureEnrollmentCard } from '@/components/nurture-enrollment-card';
import { ActivityTimeline } from '@/components/activity-timeline';
import { ChevronLeft, Mail, Phone, MapPin, DollarSign, Building2, CalendarDays, Star, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { LeadStatus } from '@/components/status-advancer';

const STATUS_LABELS: Record<string, string> = {
  new: 'New', contacted: 'Contacted', nurturing: 'Nurturing', qualified: 'Qualified',
  scheduled: 'Scheduled', closed_won: 'Closed Won', closed_lost: 'Closed Lost',
};

const STATUS_CONFIG: Record<string, { color: string; dot: string; bg: string; border: string }> = {
  new:         { color: 'text-blue-400', dot: 'bg-blue-400', bg: 'bg-blue-500/[0.06]', border: 'border-blue-500/20' },
  contacted:   { color: 'text-amber-400', dot: 'bg-amber-400', bg: 'bg-amber-500/[0.06]', border: 'border-amber-500/20' },
  nurturing:   { color: 'text-purple-400', dot: 'bg-purple-400', bg: 'bg-purple-500/[0.06]', border: 'border-purple-500/20' },
  qualified:   { color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/20' },
  scheduled:   { color: 'text-indigo-400', dot: 'bg-indigo-400', bg: 'bg-indigo-500/[0.06]', border: 'border-indigo-500/20' },
  closed_won:  { color: 'text-green-400', dot: 'bg-green-400', bg: 'bg-green-500/[0.06]', border: 'border-green-500/20' },
  closed_lost: { color: 'text-red-400', dot: 'bg-red-400', bg: 'bg-red-500/[0.06]', border: 'border-red-500/20' },
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#6b7280';
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#1e2028" strokeWidth="5" />
        <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold tabular-nums" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

export function LeadDetailClient({
  lead, appointments, nurtureEnrollments, activityLog,
}: {
  lead: any; appointments: any[]; nurtureEnrollments: any[]; activityLog: any[];
}) {
  const [currentStatus, setCurrentStatus] = useState<string>(lead.status);
  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.new;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link href="/leads" className="inline-flex items-center gap-1.5 text-[13px] text-[#5a5e6a] hover:text-[#c9a84c] transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Leads
      </Link>

      {/* Lead header card */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row md:items-start gap-6">
          {/* Score ring */}
          <div className="shrink-0">
            <ScoreRing score={lead.score} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#e0e0e4] tracking-tight">
                  {lead.first_name} {lead.last_name}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${cfg.border} ${cfg.bg} ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {STATUS_LABELS[currentStatus]}
                  </span>
                  <span className="text-[12px] text-[#5a5e6a]">
                    Source: <span className="text-[#8a8e9a] capitalize">{lead.source}</span>
                  </span>
                  <span className="text-[12px] text-[#5a5e6a]">
                    Created: <span className="text-[#8a8e9a]">{new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Contact grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#14161a] border border-[#1e2028] flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5 text-[#5a5e6a]" />
                </div>
                <span className="text-[12px] text-[#8a8e9a] truncate">{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#14161a] border border-[#1e2028] flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-[#5a5e6a]" />
                  </div>
                  <span className="text-[12px] text-[#8a8e9a]">{lead.phone}</span>
                </div>
              )}
              {lead.property_interest && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#14161a] border border-[#1e2028] flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-[#5a5e6a]" />
                  </div>
                  <span className="text-[12px] text-[#8a8e9a] capitalize">{lead.property_interest}</span>
                </div>
              )}
              {lead.budget_range && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#14161a] border border-[#1e2028] flex items-center justify-center">
                    <DollarSign className="w-3.5 h-3.5 text-[#5a5e6a]" />
                  </div>
                  <span className="text-[12px] text-[#8a8e9a]">{lead.budget_range}</span>
                </div>
              )}
            </div>

            {/* Status advancer */}
            <div className="mt-5">
              <StatusAdvancer
                leadId={lead.id}
                currentStatus={currentStatus as LeadStatus}
                onStatusChange={setCurrentStatus}
              />
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="mt-4 p-3 rounded-lg bg-[#0e1013] border border-[#1e2028]">
                <p className="text-[12px] text-[#6b7280] italic">&ldquo;{lead.notes}&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <ActivityTimeline activities={activityLog} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <NurtureEnrollmentCard leadId={lead.id} currentEnrollments={nurtureEnrollments} onEnrolled={() => window.location.reload()} />
          <AppointmentForm leadId={lead.id} leadName={`${lead.first_name} ${lead.last_name}`} onSuccess={() => window.location.reload()} />

          {/* Existing Appointments */}
          {appointments.length > 0 && (
            <div className="glass rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#1e2028]">
                <h3 className="text-[13px] font-semibold text-[#8a8e9a]">Appointments</h3>
              </div>
              <div className="p-3 space-y-2">
                {appointments.map((appt: any) => (
                  <div key={appt.id} className="p-3 rounded-lg bg-[#0e1013] border border-[#1e2028]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-[13px] text-[#e0e0e4]">{appt.title}</div>
                        <div className="text-[11px] text-[#5a5e6a] mt-0.5">
                          {appt.type?.replace('_', ' ')} · {appt.duration_minutes} min
                        </div>
                        <div className="text-[11px] text-[#4a4e5a] mt-1">
                          {new Date(appt.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{appt.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}