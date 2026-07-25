import type { AnalysisCategory } from '@/models';

export interface SubjectDefinition {
  key: string;
  label: string;
  category: AnalysisCategory;
  keywords: string[];
}

/**
 * Rule-based subject vocabulary. This is intentionally small and readable so the
 * whole engine stays transparent (every match can be traced back to a keyword).
 * A future AI-backed engine can replace this file entirely without touching the
 * PatternEngine interface or any screen code.
 */
export const SUBJECT_DEFINITIONS: SubjectDefinition[] = [
  {
    key: 'medication',
    label: 'Medication',
    category: 'medication',
    keywords: ['vyvanse', 'guanfacine', 'rexulti', 'medication', 'dose', 'dosage', 'mg', 'pill', 'prescription'],
  },
  {
    key: 'family_demands',
    label: 'Family obligations',
    category: 'family_dynamics',
    keywords: [
      'family', 'in-law', 'in-laws', 'parents', 'mother', 'father', 'mom', 'dad',
      'sister', 'brother', 'demands', 'obligation', 'obligations', 'expects', 'expected',
    ],
  },
  {
    key: 'children_pets',
    label: 'Kids and pets',
    category: 'family_dynamics',
    keywords: ['kids', 'children', 'son', 'daughter', 'dog', 'dogs', 'puppy', 'pet', 'pets'],
  },
  {
    key: 'creative_work',
    label: 'Creative and software ideas',
    category: 'creative_interests',
    keywords: ['software', 'coding', 'code', 'app development', 'software project', 'design project', 'drawing project', 'music project'],
  },
  {
    key: 'comfort_place',
    label: 'Comfort place',
    category: 'household_patterns',
    keywords: ['comfort place', 'safe place', 'cozy corner', 'my bed', 'my couch'],
  },
  {
    key: 'errands_pharmacy',
    label: 'Errands and waiting',
    category: 'household_patterns',
    keywords: ['pharmacy', 'errand', 'errands', 'waiting', 'appointment', 'line', 'waiting room'],
  },
  {
    key: 'energy_alertness',
    label: 'Energy and alertness',
    category: 'physical_body',
    keywords: ['groggy', 'foggy', 'tired', 'exhausted', 'sluggish', 'drowsy', 'alertness', 'low energy', 'sleepy'],
  },
  {
    key: 'work_business',
    label: 'Work and business',
    category: 'work_business',
    keywords: ['business', 'client', 'startup', 'revenue', 'launch', 'product'],
  },
  {
    key: 'spending',
    label: 'Spending',
    category: 'spending_shopping',
    keywords: ['bought', 'spent', 'purchase', 'purchased', 'price', 'budget'],
  },
];

export type EmotionValence = 'irritation' | 'warmth' | 'resistance' | 'animated' | 'low_alertness';

export interface EmotionDefinition {
  valence: EmotionValence;
  keywords: string[];
}

export const EMOTION_DEFINITIONS: EmotionDefinition[] = [
  { valence: 'irritation', keywords: ['irritated', 'annoyed', 'frustrated', 'snapped', 'short-tempered', 'agitated', 'irritation'] },
  { valence: 'warmth', keywords: ['grateful', 'warm', 'love', 'loved', 'tender', 'affectionate', 'adore'] },
  { valence: 'resistance', keywords: ['resistance', 'reluctant', "didn't want", "don't want", 'dread', 'dreading', 'avoided'] },
  { valence: 'animated', keywords: ['animated', 'excited', 'energized', 'alive', 'inspired', 'lit up'] },
  { valence: 'low_alertness', keywords: ['groggy', 'foggy', 'sluggish', 'out of it', 'low alertness'] },
];

function containsKeyword(normalizedText: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
  return pattern.test(normalizedText);
}

export function matchKeywords(normalizedText: string, keywords: string[]): boolean {
  return keywords.some((k) => containsKeyword(normalizedText, k));
}
