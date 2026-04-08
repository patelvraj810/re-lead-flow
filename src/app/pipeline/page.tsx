import { createSupabaseServerClient } from '@/lib/supabase/client';
import { PipelineBoard } from '@/components/pipeline-board';

export default async function PipelinePage() {
  const supabase = createSupabaseServerClient();
  let leads: any[] = [];

  try {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    leads = Array.isArray(data) ? data : [];
  } catch {
    // Gracefully handle missing Supabase connection
  }

  const leadsByStatus: Record<string, any[]> = {
    new: [],
    contacted: [],
    nurturing: [],
    qualified: [],
    scheduled: [],
    closed_won: [],
    closed_lost: [],
  };

  leads.forEach((lead: any) => {
    if (leadsByStatus[lead.status]) {
      leadsByStatus[lead.status].push(lead);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pipeline Board</h1>
        <div className="text-sm text-muted-foreground">
          {leads.length} total leads
        </div>
      </div>

      <PipelineBoard leadsByStatus={leadsByStatus} />
    </div>
  );
}