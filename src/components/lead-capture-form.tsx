"use client";

import { useState } from 'react';
import { calculateLeadScore } from '@/lib/scoring';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { User, Building2, DollarSign, MapPin, StickyNote, Sparkles, Send } from 'lucide-react';

const SOURCES = [
  { value: 'organic', label: 'Organic' },
  { value: 'zillow', label: 'Zillow' },
  { value: 'referral', label: 'Referral' },
  { value: 'paid_ad', label: 'Paid Ad' },
  { value: 'open_house', label: 'Open House' },
] as const;

const INTERESTS = [
  { value: 'buying', label: 'Buying' },
  { value: 'selling', label: 'Selling' },
  { value: 'renting', label: 'Renting' },
  { value: 'investing', label: 'Investing' },
] as const;

const BUDGETS = [
  { value: 'Under $250k', label: 'Under $250k' },
  { value: '$250k-$500k', label: '$250k-$500k' },
  { value: '$500k-$750k', label: '$500k-$750k' },
  { value: '$750k-$1M', label: '$750k-$1M' },
  { value: '$1M+', label: '$1M+' },
] as const;

const LOCATIONS = [
  'Downtown', 'Midtown', 'Uptown', 'East Side', 'West Side',
  'North District', 'South District', 'Waterfront', 'Suburbs',
];

const selectClass = "flex h-10 w-full rounded-lg border border-[#1e2028] bg-[#0e1013] px-3 py-2 text-sm text-[#e0e0e4] transition-all placeholder:text-[#3a3e4a] focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30";
const inputClass = "h-10 rounded-lg border-[#1e2028] bg-[#0e1013] text-[#e0e0e4] placeholder:text-[#3a3e4a] focus-visible:ring-[#c9a84c]/30 focus-visible:border-[#c9a84c]/50";

export function LeadCaptureForm({ onSuccess }: { onSuccess?: (lead: any) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '', first_name: '', last_name: '', phone: '',
    source: 'organic', property_interest: '', budget_range: '',
    preferred_locations: [] as string[], notes: '',
  });

  const handleLocationToggle = (location: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.includes(location)
        ? prev.preferred_locations.filter(l => l !== location)
        : [...prev.preferred_locations, location],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const score = calculateLeadScore(formData);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, score }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to capture lead'); }
      const lead = await res.json();
      toast.success(`Lead captured! ${formData.first_name} ${formData.last_name} added to the pipeline.`);
      setFormData({ email: '', first_name: '', last_name: '', phone: '', source: 'organic', property_interest: '', budget_range: '', preferred_locations: [], notes: '' });
      onSuccess?.(lead);
    } catch (error: any) {
      toast.error(error.message || 'Failed to capture lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const score = calculateLeadScore(formData);
  const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#6b7280';

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-5 border-b border-[#1e2028]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
              <User className="w-4 h-4 text-[#c9a84c]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#e0e0e4]">New Lead</h3>
              <p className="text-[11px] text-[#4a4e5a]">Capture contact details and property preferences</p>
            </div>
          </div>
          {/* Live score */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14161a] border border-[#1e2028]">
            <Sparkles className="w-3 h-3" style={{ color: scoreColor }} />
            <span className="text-[11px] text-[#5a5e6a]">Score</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor }}>{score}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-6">
        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-3.5 h-3.5 text-[#c9a84c]" />
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#5a5e6a]">Contact</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="first_name" className="text-[12px] text-[#6b7280]">First Name *</Label>
              <Input id="first_name" value={formData.first_name} onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))} required placeholder="Jane" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name" className="text-[12px] text-[#6b7280]">Last Name</Label>
              <Input id="last_name" value={formData.last_name} onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))} placeholder="Doe" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[12px] text-[#6b7280]">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required placeholder="jane@example.com" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[12px] text-[#6b7280]">Phone</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 123-4567" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-3.5 h-3.5 text-[#c9a84c]" />
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#5a5e6a]">Property</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="source" className="text-[12px] text-[#6b7280]">Lead Source</Label>
              <select id="source" value={formData.source} onChange={e => setFormData(p => ({ ...p, source: e.target.value }))} className={selectClass}>
                {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="property_interest" className="text-[12px] text-[#6b7280]">Interest</Label>
              <select id="property_interest" value={formData.property_interest} onChange={e => setFormData(p => ({ ...p, property_interest: e.target.value }))} className={selectClass}>
                <option value="">Select...</option>
                {INTERESTS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget_range" className="text-[12px] text-[#6b7280]">Budget</Label>
              <select id="budget_range" value={formData.budget_range} onChange={e => setFormData(p => ({ ...p, budget_range: e.target.value }))} className={selectClass}>
                <option value="">Select...</option>
                {BUDGETS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#c9a84c]" />
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#5a5e6a]">Preferred Locations</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map(location => {
              const selected = formData.preferred_locations.includes(location);
              return (
                <button
                  key={location}
                  type="button"
                  onClick={() => handleLocationToggle(location)}
                  className={`text-[12px] px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                    selected
                      ? 'bg-[#c9a84c]/15 border-[#c9a84c]/30 text-[#c9a84c]'
                      : 'bg-[#0e1013] border-[#1e2028] text-[#5a5e6a] hover:border-[#2a2d38] hover:text-[#8a8e9a]'
                  }`}
                >
                  {location}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <StickyNote className="w-3.5 h-3.5 text-[#c9a84c]" />
            <Label htmlFor="notes" className="text-[11px] font-semibold uppercase tracking-wider text-[#5a5e6a]">Notes</Label>
          </div>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
            className="min-h-[80px] border-[#1e2028] bg-[#0e1013] text-[#e0e0e4] placeholder:text-[#3a3e4a] focus-visible:ring-[#c9a84c]/30 focus-visible:border-[#c9a84c]/50"
            placeholder="Any additional information about this lead..."
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1e2028]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: scoreColor }} />
            <span className="text-[12px] text-[#5a5e6a]">Lead score: <span className="font-bold text-[#8a8e9a]" style={{ color: scoreColor }}>{score}</span>/100</span>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#c9a84c] text-[#07080a] hover:bg-[#dbb85c] font-semibold px-5 h-9 rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">Capturing...</span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5" />
                Capture Lead
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}