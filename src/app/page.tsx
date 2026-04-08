import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PipelineBoard } from '@/components/pipeline-board';
import { LeadCaptureForm } from '@/components/lead-capture-form';
import { Users, UserPlus, TrendingUp, CalendarDays } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/client';

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
    new: [],
    contacted: [],
    nurturing: [],
    qualified: [],
    scheduled: [],
    closed_won: [],
    closed_lost: [],
  };

  leads.forEach((lead: any) => {
    if (leadsByStatus[lead.status]) {
      leadsByStatus[lead.status].push(lead);
    }
  });

  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0
    ? Math.round(((leadsByStatus.closed_won?.length || 0) / totalLeads) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Real Estate Lead Pipeline</h1>
        <div className="text-sm text-muted-foreground">
          {totalLeads} total leads
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">{leadsByStatus.new.length} new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Nurture</CardTitle>
            <UserPlus className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEnrollments}</div>
            <p className="text-xs text-muted-foreground">in drip sequences</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">{leadsByStatus.closed_won.length} closed won</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">appointments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="capture">Lead Capture</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <PipelineBoard leadsByStatus={leadsByStatus} />
        </TabsContent>

        <TabsContent value="capture" className="space-y-4">
          <LeadCaptureForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}