import type { AnalysisCategory } from './AnalysisCategory';

export type AnalysisBoundary = Record<AnalysisCategory, boolean>;

export interface AppSettings {
  boundaries: AnalysisBoundary;
  /** Specific subjects the user has asked Cherry Brain to stop analyzing, via "Don't analyze this subject". */
  suppressedSubjects: string[];
  seedDataLoaded: boolean;
  updatedAt: string;
}

export const DEFAULT_BOUNDARIES: AnalysisBoundary = {
  mood_emotional: true,
  medication: true,
  physical_body: true,
  family_dynamics: true,
  creative_interests: true,
  work_business: true,
  spending_shopping: true,
  household_patterns: true,
};

export function createDefaultSettings(): AppSettings {
  return {
    boundaries: { ...DEFAULT_BOUNDARIES },
    suppressedSubjects: [],
    seedDataLoaded: false,
    updatedAt: new Date().toISOString(),
  };
}
