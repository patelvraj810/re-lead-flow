import { createSupabaseServerClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, CalendarDays, Clock, MapPin } from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; dot: string; bg: string; border: string }> = {
  scheduled: { color: 'text-blue-400', dot: 'bg-blue-400', bg: 'bg-blue-500/[0.06]', border: 'border-blue-500/20' },
  confirmed: { color: 'text-green-400', dot: 'bg-green-400', bg: 'bg-green-500/[0.06]', border: 'border-green-500/20' },
  completed: { color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/20' },
  cancelled: { color: 'text-red-400', dot: 'bg-red-400', bg: 'bg-red-500/[0.06]', border: 'border-red-500/20' },
  no_show:   { color: 'text-gray-400', dot: 'bg-gray-400', bg: 'bg-gray-500/[0.06]', border: 'border-gray-500/20' },
};

export default async function SchedulePage() {
  const supabase = createSupabaseServerClient();
  let appointments: any[] = [];

  try {
    const { data } = await supabase
      .from('appointments')
      .select('*, leads(first_name, last_name, email)')
      .order('scheduled_at', { ascending: true });
    appointments = Array.isArray(data) ? data : [];
  } catch {}

  const upcoming = appointments.filter((a: any) => new Date(a.scheduled_at) >= new Date() && a.status !== 'cancelled');
  const completed = appointments.filter((a: any) => a.status === 'completed');
  const confirmed = appointments.filter((a: any) => a.status === 'confirmed');

  const metrics = [
    { label: 'Total', value: appointments.length, accent: '#c9a84c' },
    { label: 'Upcoming', value: upcoming.length, accent: '#3b82f6' },
    { label: 'Confirmed', value: confirmed.length, accent: '#22c55e' },
    { label: 'Completed', value: completed.length, accent: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Appointment <span className="text-gold-gradient">Scheduler</span>
          </h1>
          <p className="text-sm text-[#5a5e6a] mt-1">Manage property tours, consultations, and closings</p>
        </div>
        <Link href="/schedule/new">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#c9a84c] text-[#07080a] text-sm font-semibold hover:bg-[#dbb85c] transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Schedule Appointment
          </button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {metrics.map(m => (
          <div key={m.label} className="metric-card glass rounded-xl p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4a4e5a]">{m.label}</span>
            <div className="text-2xl font-bold tabular-nums mt-1" style={{ color: m.accent }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Appointments list */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1e2028] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#8a8e9a]">All Appointments</h2>
          <span className="text-[11px] text-[#4a4e5a] tabular-nums">{appointments.length} total</span>
        </div>
        <div className="divide-y divide-[#1e2028]/50">
          {appointments.length > 0 ? appointments.map((appt: any) => {
            const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.scheduled;
            const isPast = new Date(appt.scheduled_at) < new Date();
            return (
              <Link key={appt.id} href={`/leads/${appt.lead_id}`} className="block p-4 hover:bg-[#14161a] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Date badge */}
                    <div className="shrink-0 w-12 text-center">
                      <div className="text-[10px] uppercase font-bold text-[#5a5e6a]">
                        {new Date(appt.scheduled_at).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-xl font-bold tabular-nums text-[#e0e0e4]">
                        {new Date(appt.scheduled_at).getDate()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[13px] text-[#e0e0e4]">{appt.title}</div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[#5a5e6a]">
                        <span className="capitalize">{appt.type?.replace('_', ' ')}</span>
                        <span className="text-[#2a2d38]">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(appt.scheduled_at).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <span className="text-[#2a2d38]">·</span>
                        <span>{appt.duration_minutes} min</span>
                        {appt.location && (
                          <>
                            <span className="text-[#2a2d38]">·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {appt.location}
                            </span>
                          </>
                        )}
                      </div>
                      {appt.leads && (
                        <div className="text-[11px] text-[#4a4e5a] mt-1">
                          {appt.leads.first_name} {appt.leads.last_name} · {appt.leads.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.bg} ${cfg.color}`}>
                    {appt.status?.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            );
          }) : (
            <div className="py-16 text-center">
              <CalendarDays className="w-8 h-8 text-[#2a2d38] mx-auto mb-2" />
              <div className="text-[13px] text-[#3a3e4a]">No appointments yet</div>
              <div className="text-[11px] text-[#2a2d38] mt-1">Schedule one to get started</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}