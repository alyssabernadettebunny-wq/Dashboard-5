/** The subject areas the user can allow or disallow Cherry Brain from analyzing. */
export type AnalysisCategory =
  | 'mood_emotional'
  | 'medication'
  | 'physical_body'
  | 'family_dynamics'
  | 'creative_interests'
  | 'work_business'
  | 'spending_shopping'
  | 'household_patterns';

export const ANALYSIS_CATEGORIES: AnalysisCategory[] = [
  'mood_emotional',
  'medication',
  'physical_body',
  'family_dynamics',
  'creative_interests',
  'work_business',
  'spending_shopping',
  'household_patterns',
];

export const ANALYSIS_CATEGORY_LABELS: Record<AnalysisCategory, string> = {
  mood_emotional: 'Mood and emotional patterns',
  medication: 'Medication observations',
  physical_body: 'Physical or body observations',
  family_dynamics: 'Family dynamics',
  creative_interests: 'Creative interests',
  work_business: 'Work and business ideas',
  spending_shopping: 'Spending and shopping',
  household_patterns: 'Household patterns',
};
