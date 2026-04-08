import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/client';
import { calculateLeadScore } from '@/lib/scoring';

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const source = searchParams.get('source');
  const minScore = searchParams.get('min_score');

  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }
  if (source) {
    query = query.eq('source', source);
  }
  if (minScore) {
    query = query.gte('score', parseInt(minScore));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const body = await request.json();

  // Validate required fields
  if (!body.email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Calculate lead score
  const score = calculateLeadScore(body);

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      email: body.email,
      first_name: body.first_name ?? null,
      last_name: body.last_name ?? null,
      phone: body.phone ?? null,
      source: body.source ?? 'organic',
      property_interest: body.property_interest ?? null,
      budget_range: body.budget_range ?? null,
      preferred_locations: body.preferred_locations ?? null,
      notes: body.notes ?? null,
      status: body.status ?? 'new',
      score,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log lead creation
  await supabase.from('activity_log').insert({
    lead_id: lead.id,
    event_type: 'lead_created',
    event_data: { source: body.source ?? 'organic', score },
  });

  // Auto-enroll in nurture sequences matching the lead's status
  const leadStatus = body.status ?? 'new';
  const { data: matchingSequences } = await supabase
    .from('nurture_sequences')
    .select('id')
    .eq('trigger_status', leadStatus)
    .eq('is_active', true);

  if (matchingSequences && matchingSequences.length > 0) {
    for (const seq of matchingSequences) {
      // Get first step to calculate next_step_at
      const { data: firstStep } = await supabase
        .from('nurture_steps')
        .select('delay_hours')
        .eq('sequence_id', seq.id)
        .order('step_order', { ascending: true })
        .limit(1)
        .single();

      const nextStepAt = firstStep
        ? new Date(Date.now() + firstStep.delay_hours * 3600000).toISOString()
        : new Date(Date.now() + 3600000).toISOString();

      await supabase
        .from('nurture_enrollments')
        .upsert({
          lead_id: lead.id,
          sequence_id: seq.id,
          current_step: 0,
          status: 'active',
          next_step_at: nextStepAt,
        }, { onConflict: 'lead_id,sequence_id' });

      await supabase.from('activity_log').insert({
        lead_id: lead.id,
        event_type: 'nurture_enrolled',
        event_data: { sequence_id: seq.id, auto_enrolled: true },
      });
    }
  }

  return NextResponse.json(lead, { status: 201 });
}