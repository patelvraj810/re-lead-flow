"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

const APPOINTMENT_TYPES = [
  { value: 'property_tour', label: 'Property Tour' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'pricing_review', label: 'Pricing Review' },
  { value: 'closing', label: 'Closing' },
  { value: 'follow_up', label: 'Follow-Up' },
] as const;

interface AppointmentFormProps {
  leadId: string;
  leadName?: string;
  onSuccess?: () => void;
}

export function AppointmentForm({ leadId, leadName, onSuccess }: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'consultation',
    scheduled_at: '',
    duration_minutes: 60,
    location: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          ...formData,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to schedule appointment');
      }

      toast.success('Appointment scheduled successfully!');
      setFormData({
        title: '',
        type: 'consultation',
        scheduled_at: '',
        duration_minutes: 60,
        location: '',
        notes: '',
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Schedule Appointment
          {leadName && <span className="text-muted-foreground font-normal"> for {leadName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                placeholder="123 Main St, City, State"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Any notes about this appointment..."
              />
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}