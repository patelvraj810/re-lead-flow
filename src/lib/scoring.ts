// Lead Scoring Logic

export function calculateLeadScore(lead: {
  source: string;
  property_interest?: string | null;
  budget_range?: string | null;
  preferred_locations?: string[] | null;
  email: string;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}): number {
  let score = 0;

  // Source scoring
  switch (lead.source) {
    case 'referral':
      score += 30;
      break;
    case 'zillow':
      score += 20;
      break;
    case 'open_house':
      score += 25;
      break;
    case 'paid_ad':
      score += 15;
      break;
    case 'organic':
    default:
      score += 10;
  }

  // Contact info completeness
  if (lead.phone) score += 10;
  if (lead.first_name) score += 5;
  if (lead.last_name) score += 5;

  // Property interest specificity
  if (lead.property_interest) {
    const interest = lead.property_interest.toLowerCase();
    if (interest.includes('buying')) score += 15;
    if (interest.includes('selling')) score += 20;
    if (interest.includes('investing')) score += 25;
  }

  // Budget range (higher budgets = higher score)
  if (lead.budget_range) {
    const budget = lead.budget_range.toLowerCase();
    if (budget.includes('$1m') || budget.includes('1000000')) score += 20;
    else if (budget.includes('$750k') || budget.includes('750000')) score += 18;
    else if (budget.includes('$500k') || budget.includes('500000')) score += 15;
    else if (budget.includes('$250k') || budget.includes('250000')) score += 10;
    else score += 5;
  }

  // Location specificity (more locations = more serious)
  if (lead.preferred_locations && lead.preferred_locations.length > 0) {
    score += Math.min(lead.preferred_locations.length * 3, 15);
  }

  // Cap score at 100
  return Math.min(Math.max(score, 0), 100);
}
