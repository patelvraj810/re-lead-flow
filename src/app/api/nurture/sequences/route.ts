import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/client';

export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('nurture_sequences')
    .select('*, nurture_steps(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('nurture_sequences')
    .insert({
      name: body.name,
      trigger_status: body.trigger_status,
      description: body.description,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert steps if provided
  if (body.steps && body.steps.length > 0) {
    const steps = body.steps.map((step: any, index: number) => ({
      sequence_id: data.id,
      step_order: step.step_order ?? index + 1,
      delay_hours: step.delay_hours ?? 24,
      channel: step.channel,
      subject: step.subject ?? null,
      body_template: step.body_template,
    }));

    const { error: stepsError } = await supabase
      .from('nurture_steps')
      .insert(steps);

    if (stepsError) {
      return NextResponse.json({ error: stepsError.message }, { status: 500 });
    }
  }

  return NextResponse.json(data, { status: 201 });
}