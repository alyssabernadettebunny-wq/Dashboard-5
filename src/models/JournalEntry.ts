export type EntryType = 'text' | 'voice' | 'image';

/** A subject the pattern engine (or the user) has associated with an entry. */
export interface SuggestedSubject {
  key: string;
  label: string;
  source: 'system' | 'user';
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  title?: string;
  text: string;
  isImportant: boolean;
  entryType: EntryType;
  suggestedSubjects: SuggestedSubject[];
  userTags: string[];
  connectedPatternIds: string[];
}
