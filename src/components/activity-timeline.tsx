"use client";

import {
  UserPlus, Mail, Phone, CalendarDays, ArrowRight,
  MessageSquare, CheckCircle2, XCircle,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

const EVENT_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  lead_created:        { icon: <UserPlus className="w-3.5 h-3.5" />, color: '#3b82f6', bg: 'bg-blue-500/[0.08]' },
  status_changed:      { icon: <ArrowRight className="w-3.5 h-3.5" />, color: '#f59e0b', bg: 'bg-amber-500/[0.08]' },
  nurture_enrolled:   { icon: <Mail className="w-3.5 h-3.5" />, color: '#a855f7', bg: 'bg-purple-500/[0.08]' },
  nurture_sent:        { icon: <MessageSquare className="w-3.5 h-3.5" />, color: '#a855f7', bg: 'bg-purple-500/[0.08]' },
  nurture_completed:  { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: '#22c55e', bg: 'bg-green-500/[0.08]' },
  appointment_scheduled: { icon: <CalendarDays className="w-3.5 h-3.5" />, color: '#6366f1', bg: 'bg-indigo-500/[0.08]' },
  appointment_completed: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: '#10b981', bg: 'bg-emerald-500/[0.08]' },
  appointment_cancelled: { icon: <XCircle className="w-3.5 h-3.5" />, color: '#ef4444', bg: 'bg-red-500/[0.08]' },
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
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1e2028]">
          <h3 className="text-[13px] font-semibold text-[#8a8e9a]">Activity Timeline</h3>
        </div>
        <div className="p-6 text-center">
          <div className="text-[12px] text-[#3a3e4a]">No activity recorded yet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#1e2028]">
        <h3 className="text-[13px] font-semibold text-[#8a8e9a]">Activity Timeline</h3>
      </div>
      <div className="p-4">
        <div className="relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#1e2028]" />
          <div className="space-y-5">
            {activities.map((activity) => {
              const config = EVENT_CONFIG[activity.event_type] || {
                icon: <MessageSquare className="w-3.5 h-3.5" />,
                color: '#6b7280',
                bg: 'bg-gray-500/[0.08]',
              };
              return (
                <div key={activity.id} className="relative pl-9">
                  <div
                    className="absolute left-0 top-0.5 flex items-center justify-center w-[22px] h-[22px] rounded-full border"
                    style={{
                      background: `${config.color}12`,
                      borderColor: `${config.color}30`,
                      color: config.color,
                    }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#e0e0e4]">
                        {EVENT_LABELS[activity.event_type] || activity.event_type}
                      </span>
                      <span className="text-[11px] text-[#4a4e5a] font-mono">
                        {new Date(activity.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {formatEventData(activity.event_type, activity.event_data) && (
                      <p className="text-[11px] text-[#5a5e6a] mt-0.5">
                        {formatEventData(activity.event_type, activity.event_data)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}