"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { CalendarDays, Clock, MapPin, FileText } from 'lucide-react';

const APPOINTMENT_TYPES = [
  { value: 'property_tour', label: 'Property Tour' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'pricing_review', label: 'Pricing Review' },
  { value: 'closing', label: 'Closing' },
  { value: 'follow_up', label: 'Follow-Up' },
] as const;

const selectClass = "flex h-10 w-full rounded-lg border border-[#1e2028] bg-[#0e1013] px-3 py-2 text-sm text-[#e0e0e4] transition-all focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30";
const inputClass = "h-10 rounded-lg border-[#1e2028] bg-[#0e1013] text-[#e0e0e4] placeholder:text-[#3a3e4a] focus-visible:ring-[#c9a84c]/30 focus-visible:border-[#c9a84c]/50";

interface AppointmentFormProps {
  leadId: string;
  leadName?: string;
  onSuccess?: () => void;
}

export function AppointmentForm({ leadId, leadName, onSuccess }: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', type: 'consultation', scheduled_at: '',
    duration_minutes: 60, location: '', notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, ...formData }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      toast.success('Appointment scheduled successfully!');
      setFormData({ title: '', type: 'consultation', scheduled_at: '', duration_minutes: 60, location: '', notes: '' });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#1e2028]">
        <h3 className="text-[13px] font-semibold text-[#8a8e9a]">
          Schedule Appointment
          {leadName && <span className="text-[#5a5e6a] font-normal"> for {leadName}</span>}
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="apt-title" className="text-[12px] text-[#6b7280]">Title *</Label>
            <Input id="apt-title" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required placeholder="Initial consultation" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apt-type" className="text-[12px] text-[#6b7280]">Type *</Label>
            <select id="apt-type" value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} className={selectClass}>
              {APPOINTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apt-datetime" className="text-[12px] text-[#6b7280]">Date & Time *</Label>
            <Input id="apt-datetime" type="datetime-local" value={formData.scheduled_at} onChange={e => setFormData(p => ({ ...p, scheduled_at: e.target.value }))} required className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apt-duration" className="text-[12px] text-[#6b7280]">Duration (min)</Label>
            <Input id="apt-duration" type="number" value={formData.duration_minutes} onChange={e => setFormData(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 60 }))} min={15} max={480} className={inputClass} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="apt-location" className="text-[12px] text-[#6b7280]">Location</Label>
            <Input id="apt-location" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="123 Main St, City, State" className={inputClass} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="apt-notes" className="text-[12px] text-[#6b7280]">Notes</Label>
            <textarea id="apt-notes" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              className="flex min-h-[72px] w-full rounded-lg border border-[#1e2028] bg-[#0e1013] px-3 py-2 text-sm text-[#e0e0e4] placeholder:text-[#3a3e4a] focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30"
              placeholder="Notes about this appointment..." />
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}
          className="w-full bg-[#c9a84c] text-[#07080a] hover:bg-[#dbb85c] font-semibold rounded-lg h-9">
          {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
        </Button>
      </form>
    </div>
  );
}