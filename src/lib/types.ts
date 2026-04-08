// Real Estate Lead-Flow Pipeline Types

export type Lead = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  source: 'organic' | 'zillow' | 'referral' | 'paid_ad' | 'open_house';
  property_interest: string | null;
  budget_range: string | null;
  preferred_locations: string[] | null;
  notes: string | null;
  status: 'new' | 'contacted' | 'nurturing' | 'qualified' | 'scheduled' | 'closed_won' | 'closed_lost';
  score: number;
  created_at: string;
  updated_at: string;
};

export type NurtureSequence = {
  id: string;
  name: string;
  trigger_status: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type NurtureStep = {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_hours: number;
  channel: 'email' | 'sms' | 'call';
  subject: string | null;
  body_template: string;
  created_at: string;
};

export type NurtureEnrollment = {
  id: string;
  lead_id: string;
  sequence_id: string;
  current_step: number;
  status: 'active' | 'paused' | 'completed' | 'opted_out';
  enrolled_at: string;
  next_step_at: string | null;
  completed_at: string | null;
};

export type Appointment = {
  id: string;
  lead_id: string;
  agent_id: string | null;
  title: string;
  type: 'property_tour' | 'consultation' | 'pricing_review' | 'closing' | 'follow_up';
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  notes: string | null;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  lead_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
};

export type LeadFormData = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  source: 'organic' | 'zillow' | 'referral' | 'paid_ad' | 'open_house';
  property_interest: string;
  budget_range: string;
  preferred_locations: string[];
  notes?: string;
};
