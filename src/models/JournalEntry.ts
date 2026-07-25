export type EntryType = 'text' | 'voice' | 'image';

/** A subject the pattern engine (or the user) has associated with an entry. */
export interface SuggestedSubject {
  key: string;
  label: string;
  source: 'system' | 'user';
}

export interface JournalEntryRevision {
  title?: string;
  text: string;
  savedAt: string;
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
  /** Quiet data-protection history. Older entries may omit this field. */
  revisions?: JournalEntryRevision[];
}
