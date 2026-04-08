import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/client';

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const lead_id = searchParams.get('lead_id');
  const status = searchParams.get('status');

  let query = supabase
    .from('appointments')
    .select('*, leads(first_name, last_name, email)')
    .order('scheduled_at', { ascending: true });

  if (lead_id) {
    query = query.eq('lead_id', lead_id);
  }
  if (status) {
    query = query.eq('status', status);
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

  if (!body.lead_id || !body.title || !body.type || !body.scheduled_at) {
    return NextResponse.json(
      { error: 'lead_id, title, type, and scheduled_at are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      lead_id: body.lead_id,
      agent_id: body.agent_id ?? null,
      title: body.title,
      type: body.type,
      scheduled_at: body.scheduled_at,
      duration_minutes: body.duration_minutes ?? 60,
      location: body.location ?? null,
      notes: body.notes ?? null,
      status: body.status ?? 'scheduled',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update lead status to "scheduled"
  await supabase
    .from('leads')
    .update({ status: 'scheduled' })
    .eq('id', body.lead_id);

  // Log appointment creation
  await supabase.from('activity_log').insert({
    lead_id: body.lead_id,
    event_type: 'appointment_scheduled',
    event_data: {
      appointment_id: data.id,
      title: body.title,
      type: body.type,
      scheduled_at: body.scheduled_at,
    },
  });

  return NextResponse.json(data, { status: 201 });
}