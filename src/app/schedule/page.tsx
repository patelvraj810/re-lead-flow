import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/client';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  no_show: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default async function SchedulePage() {
  const supabase = createSupabaseServerClient();
  let appointments: any[] = [];
  let leads: any[] = [];

  try {
    const { data: apptData } = await supabase
      .from('appointments')
      .select('*, leads(first_name, last_name, email)')
      .order('scheduled_at', { ascending: true });
    appointments = Array.isArray(apptData) ? apptData : [];

    const { data: leadsData } = await supabase
      .from('leads')
      .select('id, first_name, last_name, email, status')
      .in('status', ['qualified', 'nurturing', 'contacted', 'scheduled'])
      .order('score', { ascending: false });
    leads = Array.isArray(leadsData) ? leadsData : [];
  } catch {
    // Gracefully handle missing Supabase connection
  }

  const upcoming = appointments.filter((a: any) => {
    const d = new Date(a.scheduled_at);
    return d >= new Date() && a.status !== 'cancelled';
  });
  const completed = appointments.filter((a: any) => a.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Appointment Scheduler</h1>
        <Link href="/schedule/new">
          <Button size="sm">
            + Schedule Appointment
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter((a: any) => a.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length > 0 ? (
                appointments.map((appointment: any) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <Link href={`/leads/${appointment.lead_id}`} className="font-medium hover:underline">
                        {appointment.leads?.first_name} {appointment.leads?.last_name}
                      </Link>
                      {appointment.leads?.email && (
                        <div className="text-xs text-muted-foreground">{appointment.leads.email}</div>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{appointment.type?.replace('_', ' ') || 'Unknown'}</TableCell>
                    <TableCell>{appointment.title}</TableCell>
                    <TableCell className="text-sm">
                      {appointment.scheduled_at ? new Date(appointment.scheduled_at).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell>{appointment.duration_minutes} min</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[appointment.status] || 'bg-gray-100 text-gray-800'}>
                        {appointment.status?.replace('_', ' ') || 'Unknown'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No appointments yet. Schedule one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}