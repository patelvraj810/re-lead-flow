"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Play, Users, Mail, MessageSquare, Phone, Clock } from 'lucide-react';
import { toast } from 'sonner';

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
  call: <Phone className="w-4 h-4" />,
};

const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  paused: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  opted_out: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function NurturePageClient({
  sequences,
  enrollments,
  nurtureLog,
}: {
  sequences: any[];
  enrollments: any[];
  nurtureLog: any[];
}) {
  const handleProcessNurture = async () => {
    try {
      const res = await fetch('/api/nurture/process', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to process nurture steps');
      const result = await res.json();
      toast.success(`Processed ${result.processed} nurture steps`);
      window.location.reload();
    } catch {
      toast.error('Failed to process nurture steps');
    }
  };

  const activeEnrollments = enrollments.filter((e: any) => e.status === 'active');
  const completedEnrollments = enrollments.filter((e: any) => e.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nurture Management</h1>
        <Button onClick={handleProcessNurture} variant="outline" size="sm">
          <Play className="w-4 h-4 mr-2" />
          Process Due Steps
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sequences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sequences.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEnrollments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedEnrollments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Messages Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nurtureLog.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sequences */}
      <Card>
        <CardHeader>
          <CardTitle>Nurture Sequences</CardTitle>
        </CardHeader>
        <CardContent>
          {sequences.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No sequences configured yet.</p>
          ) : (
            <div className="space-y-4">
              {sequences.map((seq: any) => (
                <div key={seq.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{seq.name}</h3>
                      <p className="text-sm text-muted-foreground">{seq.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          Trigger: {seq.trigger_status}
                        </Badge>
                        <Badge variant={seq.is_active ? 'default' : 'secondary'} className="text-xs">
                          {seq.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  {seq.nurture_steps && seq.nurture_steps.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {seq.nurture_steps
                        .sort((a: any, b: any) => a.step_order - b.step_order)
                        .map((step: any) => (
                          <div key={step.id} className="flex items-center gap-3 text-sm bg-muted/30 rounded-md px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              {CHANNEL_ICONS[step.channel] || <Mail className="w-4 h-4" />}
                              <span className="capitalize">{step.channel}</span>
                            </div>
                            <div className="flex-1 truncate">
                              {step.subject && <span className="font-medium">{step.subject}</span>}
                              <span className="text-muted-foreground">
                                {step.subject ? ' — ' : ''}{step.body_template.substring(0, 80)}...
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{step.delay_hours}h</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No enrollments yet. Leads auto-enroll when created.</p>
          ) : (
            <div className="space-y-2">
              {enrollments.map((enrollment: any) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/leads/${enrollment.lead_id}`} className="font-medium hover:underline">
                        {enrollment.leads?.first_name} {enrollment.leads?.last_name}
                      </Link>
                      <span className="text-sm text-muted-foreground">({enrollment.leads?.email})</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {enrollment.nurture_sequences?.name || 'Unknown'} • Step {enrollment.current_step + 1}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={ENROLLMENT_STATUS_COLORS[enrollment.status] || ''}>
                      {enrollment.status}
                    </Badge>
                    {enrollment.next_step_at && enrollment.status === 'active' && (
                      <span className="text-xs text-muted-foreground">
                        Next: {new Date(enrollment.next_step_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Nurture Log */}
      {nurtureLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nurtureLog.slice(0, 20).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      {CHANNEL_ICONS[log.channel] || <Mail className="w-4 h-4" />}
                    </div>
                    <div>
                      <Link href={`/leads/${log.lead_id}`} className="font-medium hover:underline text-sm">
                        {log.leads?.first_name} {log.leads?.last_name}
                      </Link>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(log.sent_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}