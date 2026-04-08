import { createSupabaseServerClient } from '@/lib/supabase/client';
import { AppointmentFormClient } from './appointment-form-client';

export default async function NewAppointmentPage() {
  const supabase = createSupabaseServerClient();
  let leads: any[] = [];

  try {
    const { data } = await supabase
      .from('leads')
      .select('id, first_name, last_name, email, status')
      .in('status', ['qualified', 'nurturing', 'contacted', 'scheduled'])
      .order('score', { ascending: false });
    leads = Array.isArray(data) ? data : [];
  } catch {
    // Gracefully handle missing Supabase connection
  }

  return <AppointmentFormClient leads={leads} />;
}