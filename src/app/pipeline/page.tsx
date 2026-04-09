import { createSupabaseServerClient } from '@/lib/supabase/client';
import { PipelineBoard } from '@/components/pipeline-board';
import Link from 'next/link';

export default async function PipelinePage() {
  const supabase = createSupabaseServerClient();
  let leads: any[] = [];

  try {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    leads = Array.isArray(data) ? data : [];
  } catch {}

  const leadsByStatus: Record<string, any[]> = {
    new: [], contacted: [], nurturing: [], qualified: [], scheduled: [], closed_won: [], closed_lost: [],
  };
  leads.forEach((lead: any) => {
    if (leadsByStatus[lead.status]) leadsByStatus[lead.status].push(lead);
  });

  const totalLeads = leads.length;
  const hotLeads = leads.filter((l: any) => l.score >= 60).length;
  const avgScore = totalLeads > 0 ? Math.round(leads.reduce((a: number, l: any) => a + l.score, 0) / totalLeads) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pipeline <span className="text-gold-gradient">Board</span>
          </h1>
          <p className="text-sm text-[#5a5e6a] mt-1">
            Visualize and advance leads through every stage
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-[#4a4e5a]">{totalLeads} leads</span>
            <span className="text-[#2a2d38]">·</span>
            <span className="text-[#f59e0b]">{hotLeads} hot</span>
            <span className="text-[#2a2d38]">·</span>
            <span className="text-[#5a5e6a]">avg {avgScore}</span>
          </div>
          <Link
            href="/leads/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#c9a84c] text-[#07080a] text-sm font-semibold hover:bg-[#dbb85c] transition-colors"
          >
            Add Lead
          </Link>
        </div>
      </div>

      <PipelineBoard leadsByStatus={leadsByStatus} />
    </div>
  );
}