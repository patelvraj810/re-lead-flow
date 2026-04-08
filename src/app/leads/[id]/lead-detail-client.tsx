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
import { ChevronLeft, Mail, Phone, MapPin, DollarSign, Building2 } from 'lucide-react';
import Link from 'next/link';
import type { LeadStatus } from '@/components/status-advancer';

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  nurturing: 'Nurturing',
  qualified: 'Qualified',
  scheduled: 'Scheduled',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  nurturing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  qualified: 'bg-green-500/10 text-green-400 border-green-500/20',
  scheduled: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  closed_won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  closed_lost: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function LeadDetailClient({
  lead,
  appointments,
  nurtureEnrollments,
  activityLog,
}: {
  lead: any;
  appointments: any[];
  nurtureEnrollments: any[];
  activityLog: any[];
}) {
  const [currentStatus, setCurrentStatus] = useState<string>(lead.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/leads">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Lead Info + Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">
                    {lead.first_name} {lead.last_name}
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[currentStatus]}`}>
                      {STATUS_LABELS[currentStatus]}
                    </span>
                    <span className="text-sm text-muted-foreground">Score: <strong>{lead.score}</strong>/100</span>
                    <span className="text-xs text-muted-foreground">Source: {lead.source}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StatusAdvancer
                leadId={lead.id}
                currentStatus={currentStatus as LeadStatus}
                onStatusChange={setCurrentStatus}
              />
              <Separator className="my-4" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{lead.email}</span>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{lead.phone}</span>
                  </div>
                )}
                {lead.property_interest && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{lead.property_interest}</span>
                  </div>
                )}
                {lead.budget_range && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{lead.budget_range}</span>
                  </div>
                )}
                {lead.preferred_locations && lead.preferred_locations.length > 0 && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{lead.preferred_locations.join(', ')}</span>
                  </div>
                )}
              </div>
              {lead.notes && (
                <>
                  <Separator className="my-4" />
                  <div className="text-sm text-muted-foreground italic">&ldquo;{lead.notes}&rdquo;</div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <ActivityTimeline activities={activityLog} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Nurture Sequences */}
          <NurtureEnrollmentCard
            leadId={lead.id}
            currentEnrollments={nurtureEnrollments}
            onEnrolled={() => window.location.reload()}
          />

          {/* Appointment Scheduling */}
          <AppointmentForm
            leadId={lead.id}
            leadName={`${lead.first_name} ${lead.last_name}`}
            onSuccess={() => window.location.reload()}
          />

          {/* Existing Appointments */}
          {appointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointments.map((appt: any) => (
                  <div key={appt.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{appt.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {appt.type?.replace('_', ' ')} • {appt.duration_minutes} min
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(appt.scheduled_at).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {appt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}