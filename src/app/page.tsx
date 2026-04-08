import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PipelineBoard } from '@/components/pipeline-board';
import { LeadCaptureForm } from '@/components/lead-capture-form';
import { Users, TrendingUp, CalendarDays, Sparkles } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  let leads: any[] = [];
  let upcomingAppointments = 0;
  let activeEnrollments = 0;

  try {
    const { data: leadsData } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    leads = Array.isArray(leadsData) ? leadsData : [];

    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select('*')
      .order('scheduled_at', { ascending: true });
    const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
    upcomingAppointments = appointments.filter((a: any) => {
      const d = new Date(a.scheduled_at);
      return d >= new Date() && a.status !== 'cancelled';
    }).length;

    const { data: enrollmentsData } = await supabase
      .from('nurture_enrollments')
      .select('*')
      .eq('status', 'active');
    activeEnrollments = Array.isArray(enrollmentsData) ? enrollmentsData.length : 0;
  } catch {
    // Gracefully handle missing Supabase connection
  }

  const leadsByStatus: Record<string, any[]> = {
    new: [], contacted: [], nurturing: [], qualified: [], scheduled: [], closed_won: [], closed_lost: [],
  };
  leads.forEach((lead: any) => {
    if (leadsByStatus[lead.status]) leadsByStatus[lead.status].push(lead);
  });

  const totalLeads = leads.length;
  const hotLeads = leads.filter((l: any) => l.score >= 60).length;
  const conversionRate = totalLeads > 0
    ? Math.round(((leadsByStatus.closed_won?.length || 0) / totalLeads) * 100)
    : 0;

  const metrics = [
    { label: 'Total Leads', value: totalLeads, icon: Users, accent: '#c9a84c', sub: `${leadsByStatus.new.length} new` },
    { label: 'Hot Leads', value: hotLeads, icon: TrendingUp, accent: '#ef4444', sub: 'score ≥ 60' },
    { label: 'Conversion', value: `${conversionRate}%`, icon: TrendingUp, accent: '#22c55e', sub: `${leadsByStatus.closed_won?.length || 0} closed won` },
    { label: 'Active Nurture', value: activeEnrollments, icon: Sparkles, accent: '#a855f7', sub: 'in sequences' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pipeline <span className="text-gold-gradient">Overview</span>
          </h1>
          <p className="text-sm text-[#5a5e6a] mt-1">
            Real-time lead flow, scoring, and conversion metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#3a3e4a] font-mono">{totalLeads} leads tracked</span>
          <Link
            href="/leads/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#c9a84c] text-[#07080a] text-sm font-semibold hover:bg-[#dbb85c] transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="metric-card glass rounded-xl p-5 hover-lift"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5a5e6a]">
                {m.label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${m.accent}12`, border: `1px solid ${m.accent}25` }}
              >
                <m.icon className="w-4 h-4" style={{ color: m.accent }} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight animate-count">{m.value}</div>
            <p className="text-[11px] text-[#3a3e4a] mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Pipeline Board</h2>
          <Link
            href="/pipeline"
            className="text-xs text-[#c9a84c] hover:text-[#dbb85c] transition-colors"
          >
            View full pipeline →
          </Link>
        </div>
        <PipelineBoard leadsByStatus={leadsByStatus} />
      </div>

      {/* Quick Capture */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Quick Lead Capture</h2>
        </div>
        <LeadCaptureForm />
      </div>
    </div>
  );
}