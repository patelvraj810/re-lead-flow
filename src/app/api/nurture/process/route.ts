import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/client';

/**
 * Process due nurture steps.
 * Called by a cron job or manually. Finds enrollments with next_step_at <= now
 * and advances them to the next step, logging each action.
 */
export async function POST() {
  const supabase = createSupabaseServerClient();
  const now = new Date().toISOString();
  const results: any[] = [];

  // 1. Find all active enrollments due for processing
  const { data: enrollments, error: enrollmentError } = await supabase
    .from('nurture_enrollments')
    .select('*, nurture_sequences(*)')
    .eq('status', 'active')
    .lte('next_step_at', now);

  if (enrollmentError) {
    return NextResponse.json({ error: enrollmentError.message }, { status: 500 });
  }

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ processed: 0, results: [] });
  }

  // 2. Process each enrollment
  for (const enrollment of enrollments) {
    const sequenceId = enrollment.sequence_id;
    const leadId = enrollment.lead_id;
    const currentStep = enrollment.current_step;

    // Get all steps for this sequence, ordered
    const { data: steps } = await supabase
      .from('nurture_steps')
      .select('*')
      .eq('sequence_id', sequenceId)
      .order('step_order', { ascending: true });

    if (!steps || steps.length === 0) {
      continue;
    }

    // Get the current step
    const step = steps[currentStep];

    if (!step) {
      // No more steps — mark enrollment as completed
      await supabase
        .from('nurture_enrollments')
        .update({
          status: 'completed',
          completed_at: now,
          next_step_at: null,
        })
        .eq('id', enrollment.id);

      await supabase.from('activity_log').insert({
        lead_id: leadId,
        event_type: 'nurture_completed',
        event_data: { sequenceId: sequenceId, sequence_name: enrollment.nurture_sequences?.name },
      });

      results.push({ enrollment_id: enrollment.id, action: 'completed' });
      continue;
    }

    // 3. Get lead info for template rendering
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (!lead) continue;

    // 4. Render template (simple variable substitution)
    const renderTemplate = (template: string, data: Record<string, any>) => {
      return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        if (key === 'preferred_locations' && Array.isArray(data[key])) {
          return data[key].join(', ');
        }
        return data[key] ?? '';
      });
    };

    const renderedBody = renderTemplate(step.body_template, lead);
    const renderedSubject = step.subject
      ? renderTemplate(step.subject, lead)
      : null;

    // 5. Log the nurture step as sent
    await supabase.from('nurture_log').insert({
      enrollment_id: enrollment.id,
      step_id: step.id,
      lead_id: leadId,
      channel: step.channel,
      sent_at: now,
    });

    // 6. Advance to next step or mark completed
    const nextStepIndex = currentStep + 1;
    const nextStep = steps[nextStepIndex];

    if (nextStep) {
      const nextStepAt = new Date(
        Date.now() + nextStep.delay_hours * 3600000
      ).toISOString();

      await supabase
        .from('nurture_enrollments')
        .update({
          current_step: nextStepIndex,
          next_step_at: nextStepAt,
        })
        .eq('id', enrollment.id);
    } else {
      // Last step processed — mark completed
      await supabase
        .from('nurture_enrollments')
        .update({
          status: 'completed',
          completed_at: now,
          next_step_at: null,
        })
        .eq('id', enrollment.id);
    }

    // 7. Log activity
    await supabase.from('activity_log').insert({
      lead_id: leadId,
      event_type: 'nurture_sent',
      event_data: {
        sequenceId: sequenceId,
        stepId: step.id,
        channel: step.channel,
        subject: renderedSubject,
        body_preview: renderedBody.substring(0, 200),
      },
    });

    results.push({
      enrollment_id: enrollment.id,
      lead_id: leadId,
      step: currentStep + 1,
      channel: step.channel,
      subject: renderedSubject,
      action: nextStep ? 'advanced' : 'completed',
    });
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}