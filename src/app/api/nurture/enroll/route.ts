import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/client';

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const body = await request.json();
  const { lead_id, sequence_id } = body;

  if (!lead_id || !sequence_id) {
    return NextResponse.json(
      { error: 'lead_id and sequence_id are required' },
      { status: 400 }
    );
  }

  // Verify lead exists
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('id, status')
    .eq('id', lead_id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  // Verify sequence exists and get first step delay
  const { data: sequence, error: seqError } = await supabase
    .from('nurture_sequences')
    .select('*, nurture_steps(*)')
    .eq('id', sequence_id)
    .single();

  if (seqError || !sequence) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
  }

  // Calculate next step time based on first step delay
  const firstStep = sequence.nurture_steps?.[0];
  const nextStepAt = firstStep
    ? new Date(Date.now() + firstStep.delay_hours * 3600000).toISOString()
    : new Date(Date.now() + 3600000).toISOString();

  // Upsert enrollment
  const { data, error } = await supabase
    .from('nurture_enrollments')
    .upsert({
      lead_id,
      sequence_id,
      current_step: 0,
      status: 'active',
      next_step_at: nextStepAt,
    }, { onConflict: 'lead_id,sequence_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update lead status to nurturing if not already
  if (lead.status !== 'nurturing' && lead.status !== 'qualified' && lead.status !== 'scheduled') {
    await supabase
      .from('leads')
      .update({ status: 'nurturing' })
      .eq('id', lead_id);
  }

  // Log enrollment
  await supabase.from('activity_log').insert({
    lead_id,
    event_type: 'nurture_enrolled',
    event_data: { sequence_id, sequence_name: sequence.name },
  });

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const enrollment_id = searchParams.get('enrollment_id');

  if (!enrollment_id) {
    return NextResponse.json(
      { error: 'enrollment_id is required' },
      { status: 400 }
    );
  }

  // Mark as opted out instead of deleting
  const { data, error } = await supabase
    .from('nurture_enrollments')
    .update({ status: 'opted_out' })
    .eq('id', enrollment_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}