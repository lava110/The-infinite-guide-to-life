export interface AdvisorConstraints {
  dailyHome: boolean;
  freeBoard: boolean;
  protectWaist: boolean;
  colorBlindSafe: boolean;
  noNightShift: boolean;
}

export interface AdvisorDiagnoseRequest {
  situationText: string;
  age?: number | null;
  education?: string;
  budgetCny: number;
  monthlyFamilyBurn: number;
  constraints: AdvisorConstraints;
}

export interface HydratedRecommendedPath {
  path_id: string;
  fit_tier: 'PRIMARY' | 'ALTERNATIVE' | 'BACKUP';
  fit_score: number;
  why_it_fits: string;
  hard_cost_and_runway_check: string;
  top_deal_breaker_warning: string;
  first_step_today: string;
  // Server-hydrated canonical facts from VERIFIED_PATHS (never trusted from LLM output)
  canonical: {
    title: string;
    short_name: string;
    pk_arena: 'STUDENT_PK' | 'ADULT_PK';
    domain: string;
    official_cost_min: number;
    official_cost_max: number;
    agency_quote_min: number;
    agency_quote_max: number;
    prep_days_min: number;
    prep_days_max: number;
    prep_months: number;
    regular_monthly_net_range: [number, number];
    official_portal_name: string;
    official_portal_url: string;
    portal_tier: 'STATUTORY_GOV' | 'COMMERCIAL_FIRST_PARTY';
    window_label: string;
    is_active_window: boolean;
    effective_light: 'GREEN' | 'YELLOW' | 'AMBER';
    degraded: boolean;
    degrade_reason?: string;
    last_verified_date: string;
    total_prep_and_family_burn: number;
    cash_gap_cny: number;
  };
}

export interface HydratedExcludedPath {
  path_id: string;
  title: string;
  reason: string;
}

export interface AdvisorDiagnoseResponse {
  model: string;
  generated_at: string;
  library_size: number;
  situation_summary: string;
  cashflow_pressure_note: string;
  recommended_paths: HydratedRecommendedPath[];
  excluded_or_caution_paths: HydratedExcludedPath[];
  anti_scam_reminder: string;
  out_of_library_disclaimer: string;
  suggested_followups: string[];
}

export interface AdvisorFollowUpRequest {
  question: string;
  situationText: string;
  budgetCny: number;
  monthlyFamilyBurn: number;
  recommendedPathIds: string[];
  history: Array<{ role: 'user' | 'assistant'; text: string }>;
}

export interface AdvisorFollowUpResponse {
  model: string;
  generated_at: string;
  answer: string;
  cited_paths: Array<{
    path_id: string;
    title: string;
    short_name: string;
    official_portal_url: string;
  }>;
}
