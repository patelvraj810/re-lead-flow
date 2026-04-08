import { createSupabaseServerClient } from '@/lib/supabase/client';
import { NurturePageClient } from './nurture-client';

export default async function NurturePage() {
  const supabase = createSupabaseServerClient();
  let sequences: any[] = [];
  let enrollments: any[] = [];
  let nurtureLog: any[] = [];

  try {
    const { data: seqData } = await supabase
      .from('nurture_sequences')
      .select('*, nurture_steps(*)')
      .order('created_at', { ascending: false });
    sequences = Array.isArray(seqData) ? seqData : [];

    const { data: enrollData } = await supabase
      .from('nurture_enrollments')
      .select('*, leads(first_name, last_name, email, status), nurture_sequences(name)')
      .order('enrolled_at', { ascending: false });
    enrollments = Array.isArray(enrollData) ? enrollData : [];

    const { data: logData } = await supabase
      .from('nurture_log')
      .select('*, leads(first_name, last_name, email)')
      .order('sent_at', { ascending: false })
      .limit(50);
    nurtureLog = Array.isArray(logData) ? logData : [];
  } catch {
    // Gracefully handle missing Supabase connection
  }

  return (
    <NurturePageClient
      sequences={sequences}
      enrollments={enrollments}
      nurtureLog={nurtureLog}
    />
  );
}