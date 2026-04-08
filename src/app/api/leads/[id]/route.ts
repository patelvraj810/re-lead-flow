import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/client';
import { calculateLeadScore } from '@/lib/scoring';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const body = await request.json();

  // Recalculate score if relevant fields changed
  if (body.source || body.property_interest || body.budget_range || body.phone || body.first_name || body.last_name) {
    // Fetch current lead data to merge
    const { data: currentLead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (currentLead) {
      const merged = { ...currentLead, ...body };
      body.score = calculateLeadScore(merged);
    }
  }

  // Handle status advancement — auto-enroll in nurture sequences
  if (body.status) {
    const { data: sequences } = await supabase
      .from('nurture_sequences')
      .select('id')
      .eq('trigger_status', body.status)
      .eq('is_active', true);

    if (sequences && sequences.length > 0) {
      // Enroll lead in matching sequences
      for (const seq of sequences) {
        await supabase
          .from('nurture_enrollments')
          .upsert({
            lead_id: id,
            sequence_id: seq.id,
            current_step: 0,
            status: 'active',
            next_step_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          }, { onConflict: 'lead_id,sequence_id' });
      }
    }

    // Log status change
    await supabase.from('activity_log').insert({
      lead_id: id,
      event_type: 'status_changed',
      event_data: { new_status: body.status },
    });
  }

  const { data, error } = await supabase
    .from('leads')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}