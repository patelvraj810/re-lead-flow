import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/client';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  nurturing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  qualified: 'bg-green-500/10 text-green-400 border-green-500/20',
  scheduled: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  closed_won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  closed_lost: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default async function LeadsPage() {
  const supabase = createSupabaseServerClient();
  let leads: any[] = [];

  try {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    leads = Array.isArray(data) ? data : [];
  } catch {
    // Gracefully handle missing Supabase connection
  }

  const statusCounts: Record<string, number> = {};
  leads.forEach((lead: any) => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lead Management</h1>
        <Link href="/leads/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className={`px-3 py-2 rounded-lg border ${color} text-center`}>
            <div className="text-xl font-bold">{statusCounts[status] || 0}</div>
            <div className="text-xs capitalize">{status.replace('_', ' ')}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length > 0 ? (
                leads.map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                        {lead.first_name} {lead.last_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{lead.email}</TableCell>
                    <TableCell className="capitalize text-sm">{lead.property_interest || '—'}</TableCell>
                    <TableCell>
                      <Badge className={`${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-800'} border`}>
                        {lead.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${lead.score >= 60 ? 'text-yellow-500' : lead.score >= 30 ? 'text-blue-400' : 'text-muted-foreground'}`}>
                        {lead.score}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize text-sm">{lead.source}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No leads yet. Capture your first lead to get started.
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