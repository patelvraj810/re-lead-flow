"use client";

import { useState } from 'react';
import { LeadFormData } from '@/lib/types';
import { calculateLeadScore } from '@/lib/scoring';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

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

export function LeadCaptureForm({ onSuccess }: { onSuccess?: (lead: any) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    source: string;
    property_interest: string;
    budget_range: string;
    preferred_locations: string[];
    notes: string;
  }>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    source: 'organic',
    property_interest: '',
    budget_range: '',
    preferred_locations: [],
    notes: '',
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

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to capture lead');
      }

      const lead = await res.json();
      toast.success(`Lead captured! ${formData.first_name} ${formData.last_name} added to the pipeline.`);

      // Reset form
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        source: 'organic',
        property_interest: '',
        budget_range: '',
        preferred_locations: [],
        notes: '',
      });

      onSuccess?.(lead);
    } catch (error: any) {
      toast.error(error.message || 'Failed to capture lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">New Lead</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))}
                  required
                  placeholder="Jane"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  required
                  placeholder="jane@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Lead Source</Label>
                <select
                  id="source"
                  value={formData.source}
                  onChange={e => setFormData(p => ({ ...p, source: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {SOURCES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_interest">Property Interest</Label>
                <select
                  id="property_interest"
                  value={formData.property_interest}
                  onChange={e => setFormData(p => ({ ...p, property_interest: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select interest...</option>
                  {INTERESTS.map(i => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_range">Budget Range</Label>
                <select
                  id="budget_range"
                  value={formData.budget_range}
                  onChange={e => setFormData(p => ({ ...p, budget_range: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select budget...</option>
                  {BUDGETS.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Preferred Locations */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Preferred Locations</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {LOCATIONS.map(location => (
                <label key={location} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preferred_locations.includes(location)}
                    onChange={() => handleLocationToggle(location)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{location}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              className="min-h-[100px]"
              placeholder="Any additional information about this lead..."
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Estimated score: <span className="font-semibold">{calculateLeadScore(formData)}</span>/100
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Capturing...' : 'Capture Lead'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}