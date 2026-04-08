"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface NurtureEnrollmentCardProps {
  leadId: string;
  currentEnrollments: any[];
  onEnrolled?: () => void;
}

const SEQUENCE_OPTIONS = [
  { value: 'new', label: 'New Lead Warm-Up' },
  { value: 'nurturing', label: 'Buyer Nurture' },
  { value: 'contacted', label: 'Re-Engagement' },
] as const;

export function NurtureEnrollmentCard({ leadId, currentEnrollments, onEnrolled }: NurtureEnrollmentCardProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState('new');

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      // Find the sequence ID by trigger_status
      const seqRes = await fetch(`/api/nurture/sequences`);
      if (!seqRes.ok) throw new Error('Failed to fetch sequences');
      const sequences = await seqRes.json();
      const sequence = sequences.find((s: any) => s.trigger_status === selectedSequence);
      if (!sequence) throw new Error('Sequence not found');

      const res = await fetch('/api/nurture/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          sequence_id: sequence.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to enroll');
      }

      toast.success('Lead enrolled in nurture sequence!');
      onEnrolled?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleOptOut = async (enrollmentId: string) => {
    try {
      const res = await fetch(`/api/nurture/enroll?enrollment_id=${enrollmentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to opt out');
      }

      toast.success('Lead opted out of nurture sequence');
      onEnrolled?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to opt out');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nurture Sequences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current enrollments */}
        {currentEnrollments.length > 0 && (
          <div className="space-y-3">
            {currentEnrollments.map((enrollment: any) => (
              <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {enrollment.nurture_sequences?.name || 'Unknown Sequence'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Step {enrollment.current_step + 1} • Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                    {enrollment.status}
                  </Badge>
                  {enrollment.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 h-7 text-xs"
                      onClick={() => handleOptOut(enrollment.id)}
                    >
                      Opt Out
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enroll in new sequence */}
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Enroll in sequence</label>
            <select
              value={selectedSequence}
              onChange={e => setSelectedSequence(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {SEQUENCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleEnroll} disabled={isEnrolling} size="sm">
            {isEnrolling ? 'Enrolling...' : 'Enroll'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}