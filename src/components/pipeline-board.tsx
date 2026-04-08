"use client";

import Link from 'next/link';
import { Lead } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowRight, Mail, Phone, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { LeadStatus } from './status-advancer';

const STATUS_FLOW: Record<string, string[]> = {
  new: ['contacted'],
  contacted: ['nurturing', 'qualified'],
  nurturing: ['qualified', 'closed_lost'],
  qualified: ['scheduled', 'closed_lost'],
  scheduled: ['closed_won', 'closed_lost'],
  closed_won: [],
  closed_lost: ['new'],
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  nurturing: 'Nurturing',
  qualified: 'Qualified',
  scheduled: 'Scheduled',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'border-blue-500/30 bg-blue-500/5',
  contacted: 'border-yellow-500/30 bg-yellow-500/5',
  nurturing: 'border-purple-500/30 bg-purple-500/5',
  qualified: 'border-green-500/30 bg-green-500/5',
  scheduled: 'border-indigo-500/30 bg-indigo-500/5',
  closed_won: 'border-emerald-500/30 bg-emerald-500/5',
  closed_lost: 'border-red-500/30 bg-red-500/5',
};

export function PipelineBoard({ leadsByStatus }: { leadsByStatus: Record<string, Lead[]> }) {
  const statusOrder = ['new', 'contacted', 'nurturing', 'qualified', 'scheduled', 'closed_won', 'closed_lost'];

  const handleAdvance = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Lead moved to ${STATUS_LABELS[newStatus]}`);
      window.location.reload();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusOrder.map(status => {
        const leads = leadsByStatus[status] || [];
        return (
          <div key={status} className={`rounded-lg border ${STATUS_COLORS[status] || 'border-border bg-card'}`}>
            <div className="p-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{STATUS_LABELS[status]}</h3>
                <Badge variant="secondary" className="text-xs">{leads.length}</Badge>
              </div>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
              {leads.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No leads
                </div>
              ) : (
                leads.slice(0, 10).map(lead => {
                  const nextStatuses = STATUS_FLOW[lead.status] || [];
                  return (
                    <div
                      key={lead.id}
                      className="group p-3 rounded-md bg-card border border-border/50 hover:border-border transition-colors"
                    >
                      <Link href={`/leads/${lead.id}`} className="block">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {lead.first_name} {lead.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{lead.email}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {lead.phone && <Phone className="w-3 h-3 text-muted-foreground" />}
                              <span className="text-xs text-muted-foreground capitalize">{lead.property_interest}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Star className={`w-3.5 h-3.5 ${lead.score >= 60 ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                            <span className="text-xs font-medium">{lead.score}</span>
                          </div>
                        </div>
                      </Link>
                      {nextStatuses.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {nextStatuses.map(ns => (
                            <button
                              key={ns}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdvance(lead.id, ns);
                              }}
                              className="text-[10px] px-1.5 py-0.5 rounded border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              → {STATUS_LABELS[ns]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              {leads.length > 10 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{leads.length - 10} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}