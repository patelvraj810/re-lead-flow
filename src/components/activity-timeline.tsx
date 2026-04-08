"use client";

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  UserPlus,
  Mail,
  Phone,
  CalendarDays,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  lead_created: <UserPlus className="w-4 h-4 text-blue-500" />,
  status_changed: <ArrowRight className="w-4 h-4 text-yellow-500" />,
  nurture_enrolled: <Mail className="w-4 h-4 text-purple-500" />,
  nurture_sent: <MessageSquare className="w-4 h-4 text-purple-500" />,
  nurture_completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  appointment_scheduled: <CalendarDays className="w-4 h-4 text-indigo-500" />,
  appointment_completed: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  appointment_cancelled: <XCircle className="w-4 h-4 text-red-500" />,
};

const EVENT_LABELS: Record<string, string> = {
  lead_created: 'Lead Created',
  status_changed: 'Status Changed',
  nurture_enrolled: 'Enrolled in Nurture',
  nurture_sent: 'Nurture Step Sent',
  nurture_completed: 'Nurture Completed',
  appointment_scheduled: 'Appointment Scheduled',
  appointment_completed: 'Appointment Completed',
  appointment_cancelled: 'Appointment Cancelled',
};

function formatEventData(eventType: string, data: any): string {
  switch (eventType) {
    case 'status_changed':
      return `Changed to "${(data.new_status || '').replace('_', ' ')}"`;
    case 'nurture_enrolled':
      return data.auto_enrolled ? 'Auto-enrolled' : 'Manually enrolled';
    case 'nurture_sent':
      return `${(data.channel || '').toUpperCase()}${data.subject ? `: ${data.subject}` : ''}`;
    case 'appointment_scheduled':
      return data.title || '';
    default:
      return '';
  }
}

export function ActivityTimeline({ activities }: { activities: ActivityItem[] }) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="relative pl-10">
                {/* Icon dot */}
                <div className="absolute left-[7px] top-1 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-background border border-border">
                  {EVENT_ICONS[activity.event_type] || <MessageSquare className="w-3 h-3 text-muted-foreground" />}
                </div>

                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {EVENT_LABELS[activity.event_type] || activity.event_type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                  {formatEventData(activity.event_type, activity.event_data) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatEventData(activity.event_type, activity.event_data)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}