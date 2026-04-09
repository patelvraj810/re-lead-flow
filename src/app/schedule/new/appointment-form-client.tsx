"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft, CalendarDays, User, Clock, MapPin, FileText } from 'lucide-react';

const APPOINTMENT_TYPES = [
  { value: 'property_tour', label: 'Property Tour' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'pricing_review', label: 'Pricing Review' },
  { value: 'closing', label: 'Closing' },
  { value: 'follow_up', label: 'Follow-Up' },
] as const;

const selectClass = "flex h-10 w-full rounded-lg border border-[#1e2028] bg-[#0e1013] px-3 py-2 text-sm text-[#e0e0e4] transition-all focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30";
const inputClass = "h-10 rounded-lg border-[#1e2028] bg-[#0e1013] text-[#e0e0e4] placeholder:text-[#3a3e4a] focus-visible:ring-[#c9a84c]/30 focus-visible:border-[#c9a84c]/50";

export function AppointmentFormClient({ leads }: { leads: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    lead_id: '', title: '', type: 'consultation',
    scheduled_at: '', duration_minutes: 60, location: '', notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lead_id) { toast.error('Please select a lead'); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
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
        <Link href="/schedule" className="inline-flex items-center gap-1.5 text-[13px] text-[#5a5e6a] hover:text-[#c9a84c] transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Schedule <span className="text-gold-gradient">Appointment</span>
        </h1>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#1e2028]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-[#c9a84c]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#e0e0e4]">New Appointment</h3>
              <p className="text-[11px] text-[#4a4e5a]">Schedule a property tour, consultation, or closing</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Lead selection */}
          <div className="space-y-1.5">
            <label className="text-[12px] text-[#6b7280] flex items-center gap-1.5">
              <User className="w-3 h-3" /> Lead *
            </label>
            <select
              id="lead_id"
              value={formData.lead_id}
              onChange={e => setFormData(p => ({ ...p, lead_id: e.target.value }))}
              required
              className={selectClass}
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
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-[12px] text-[#6b7280]">Title *</label>
              <input id="title" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required placeholder="Initial consultation" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="type" className="text-[12px] text-[#6b7280]">Type *</label>
              <select id="type" value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} className={selectClass}>
                {APPOINTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="scheduled_at" className="text-[12px] text-[#6b7280] flex items-center gap-1.5"><Clock className="w-3 h-3" /> Date & Time *</label>
              <input id="scheduled_at" type="datetime-local" value={formData.scheduled_at} onChange={e => setFormData(p => ({ ...p, scheduled_at: e.target.value }))} required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="duration" className="text-[12px] text-[#6b7280]">Duration (min)</label>
              <input id="duration" type="number" value={formData.duration_minutes} onChange={e => setFormData(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 60 }))} min={15} max={480} className={inputClass} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="location" className="text-[12px] text-[#6b7280] flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Location</label>
              <input id="location" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="123 Main St, City, State" className={inputClass} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="notes" className="text-[12px] text-[#6b7280] flex items-center gap-1.5"><FileText className="w-3 h-3" /> Notes</label>
              <textarea id="notes" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                className="flex min-h-[72px] w-full rounded-lg border border-[#1e2028] bg-[#0e1013] px-3 py-2 text-sm text-[#e0e0e4] placeholder:text-[#3a3e4a] focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30"
                placeholder="Any notes about this appointment..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#1e2028]">
            <Link href="/schedule" className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[#1e2028] text-[13px] text-[#5a5e6a] hover:text-[#8a8e9a] hover:border-[#2a2d38] transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting}
              className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-[#c9a84c] text-[#07080a] text-sm font-semibold hover:bg-[#dbb85c] disabled:opacity-50 transition-colors">
              {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}