import { createSupabaseServerClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import { LeadDetailClient } from './lead-detail-client';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  let lead: any = null;
  let appointments: any[] = [];
  let nurtureEnrollments: any[] = [];
  let activityLog: any[] = [];

  try {
    const { data: leadData } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    lead = leadData;

    if (!lead) {
      return notFound();
    }

    const { data: apptData } = await supabase
      .from('appointments')
      .select('*')
      .eq('lead_id', id)
      .order('scheduled_at', { ascending: false });
    appointments = Array.isArray(apptData) ? apptData : [];

    const { data: enrollData } = await supabase
      .from('nurture_enrollments')
      .select('*, nurture_sequences(*)')
      .eq('lead_id', id);
    nurtureEnrollments = Array.isArray(enrollData) ? enrollData : [];

    const { data: logData } = await supabase
      .from('activity_log')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(20);
    activityLog = Array.isArray(logData) ? logData : [];
  } catch {
    return notFound();
  }

  if (!lead) {
    return notFound();
  }

  return (
    <LeadDetailClient
      lead={lead}
      appointments={appointments}
      nurtureEnrollments={nurtureEnrollments}
      activityLog={activityLog}
    />
  );
}