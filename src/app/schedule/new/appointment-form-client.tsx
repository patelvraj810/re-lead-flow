"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const APPOINTMENT_TYPES = [
  { value: 'property_tour', label: 'Property Tour' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'pricing_review', label: 'Pricing Review' },
  { value: 'closing', label: 'Closing' },
  { value: 'follow_up', label: 'Follow-Up' },
] as const;

export function AppointmentFormClient({ leads }: { leads: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    lead_id: '',
    title: '',
    type: 'consultation',
    scheduled_at: '',
    duration_minutes: 60,
    location: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lead_id) {
      toast.error('Please select a lead');
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to schedule appointment');
      }

      toast.success('Appointment scheduled successfully!');
      window.location.href = '/schedule';
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/schedule">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Schedule Appointment</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lead_id">Lead *</Label>
              <select
                id="lead_id"
                value={formData.lead_id}
                onChange={e => setFormData(p => ({ ...p, lead_id: e.target.value }))}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a lead...</option>
                {leads.map((lead: any) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.first_name} {lead.last_name} ({lead.email}) — {lead.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  required
                  placeholder="Initial consultation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {APPOINTMENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Date & Time *</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={e => setFormData(p => ({ ...p, scheduled_at: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={e => setFormData(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 60 }))}
                  min={15}
                  max={480}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                placeholder="123 Main St, City, State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Any notes about this appointment..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" asChild>
                <Link href="/schedule">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}