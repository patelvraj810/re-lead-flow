import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/client';

const VALID_STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('appointments')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If appointment completed, update lead status
  if (body.status === 'completed') {
    await supabase.from('activity_log').insert({
      lead_id: data.lead_id,
      event_type: 'appointment_completed',
      event_data: { appointment_id: id },
    });
  }

  if (body.status === 'cancelled') {
    await supabase.from('activity_log').insert({
      lead_id: data.lead_id,
      event_type: 'appointment_cancelled',
      event_data: { appointment_id: id },
    });
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
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}