-- Real Estate Lead-Flow Pipeline Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LEADS TABLE (Capture layer)
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  source TEXT NOT NULL DEFAULT 'organic', -- organic, zillow, referral, paid_ad, open_house
  property_interest TEXT, -- buying, selling, renting, investing
  budget_range TEXT,
  preferred_locations TEXT[],
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'nurturing', 'qualified', 'scheduled', 'closed_won', 'closed_lost')),
  score INTEGER NOT NULL DEFAULT 0, -- lead score 0-100
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- NURTURE SEQUENCES (Nurture layer)
-- ============================================
CREATE TABLE nurture_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  trigger_status TEXT NOT NULL, -- which lead status triggers this sequence
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE nurture_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequence_id UUID NOT NULL REFERENCES nurture_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_hours INTEGER NOT NULL DEFAULT 24, -- hours after previous step
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'call')),
  subject TEXT, -- email subject (null for sms/call)
  body_template TEXT NOT NULL, -- template with {{first_name}}, {{property_interest}}, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- NURTURE ENROLLMENT (which leads are in which sequences)
-- ============================================
CREATE TABLE nurture_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES nurture_sequences(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'opted_out')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_step_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(lead_id, sequence_id)
);

-- ============================================
-- NURTURE LOG (track all outreach events)
-- ============================================
CREATE TABLE nurture_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES nurture_enrollments(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES nurture_steps(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_text TEXT
);

-- ============================================
-- APPOINTMENTS (Scheduler layer)
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  agent_id UUID, -- FK to future agents table
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('property_tour', 'consultation', 'pricing_review', 'closing', 'follow_up')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOG (unified timeline per lead)
-- ============================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- lead_created, nurture_sent, appointment_scheduled, status_changed, note_added
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_enrollments_lead ON nurture_enrollments(lead_id);
CREATE INDEX idx_enrollments_next_step ON nurture_enrollments(next_step_at) WHERE status = 'active';
CREATE INDEX idx_appointments_lead ON appointments(lead_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_activity_lead ON activity_log(lead_id, created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED: Default nurture sequences
-- ============================================
INSERT INTO nurture_sequences (name, trigger_status, description) VALUES
  ('New Lead Warm-Up', 'new', '3-step email sequence to engage new leads within 48 hours'),
  ('Buyer Nurture', 'nurturing', 'Ongoing drip for buyers with property interest'),
  ('Re-Engagement', 'contacted', 'Re-engage leads that went cold after first contact');

-- New Lead Warm-Up steps
INSERT INTO nurture_steps (sequence_id, step_order, delay_hours, channel, subject, body_template) VALUES
  ((SELECT id FROM nurture_sequences WHERE name = 'New Lead Warm-Up'), 1, 1, 'email',
    'Welcome, {{first_name}}! Let''s find your perfect home',
    'Hi {{first_name}},\n\nThanks for reaching out! I''d love to help you find the perfect property in {{preferred_locations}}.\n\nAre you available for a quick 15-minute call this week to discuss what you''re looking for?\n\nBest,\nYour Agent Team'),

  ((SELECT id FROM nurture_sequences WHERE name = 'New Lead Warm-Up'), 2, 24, 'email',
    '{{first_name}}, here are some properties you might love',
    'Hi {{first_name}},\n\nI''ve been thinking about your search. Based on your interest in {{property_interest}} with a budget around {{budget_range}}, here are some options worth exploring.\n\nWould you like to schedule a tour?\n\nBest,\nYour Agent Team'),

  ((SELECT id FROM nurture_sequences WHERE name = 'New Lead Warm-Up'), 3, 48, 'sms',
    NULL,
    'Hi {{first_name}}! Still looking for your dream home? Reply YES to schedule a free consultation call. 🏠');

-- Buyer Nurture steps
INSERT INTO nurture_steps (sequence_id, step_order, delay_hours, channel, subject, body_template) VALUES
  ((SELECT id FROM nurture_sequences WHERE name = 'Buyer Nurture'), 1, 24, 'email',
    'Market update for {{first_name}}',
    'Hi {{first_name}},\n\nHere''s your weekly market update for {{preferred_locations}}. New listings, price changes, and insider tips.\n\nLet me know if anything catches your eye!\n\nBest,\nYour Agent Team'),

  ((SELECT id FROM nurture_sequences WHERE name = 'Buyer Nurture'), 2, 168, 'email',
    '{{first_name}}, ready for a property tour?',
    'Hi {{first_name}},\n\nIt''s been a week since our last check-in. Have you had a chance to browse new listings? I''d love to take you on a tour of properties that match your criteria.\n\nSchedule a time here: [Booking Link]\n\nBest,\nYour Agent Team');

-- Re-Engagement steps
INSERT INTO nurture_steps (sequence_id, step_order, delay_hours, channel, subject, body_template) VALUES
  ((SELECT id FROM nurture_sequences WHERE name = 'Re-Engagement'), 1, 72, 'email',
    'We miss you, {{first_name}}!',
    'Hi {{first_name}},\n\nIt''s been a while since we connected. The market in {{preferred_locations}} has changed significantly — there are some exciting new opportunities.\n\nWould you like an updated market snapshot?\n\nBest,\nYour Agent Team');
