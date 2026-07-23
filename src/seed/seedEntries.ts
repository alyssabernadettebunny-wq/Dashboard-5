import type { JournalEntry } from '@/models';
import { tagEntrySubjects } from '@/patternEngine/tagging';

const SEED_ID_PREFIX = 'seed-entry-';

function daysAgo(days: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

interface SeedDraft {
  daysAgo: number;
  hour: number;
  text: string;
  title?: string;
  isImportant?: boolean;
}

const SEED_DRAFTS: SeedDraft[] = [
  { daysAgo: 9, hour: 8, text: 'Missed my Vyvanse dose this morning — totally forgot until it was almost noon.' },
  { daysAgo: 9, hour: 15, text: 'Felt severely groggy most of the day, like wading through fog. Could barely focus.' },
  { daysAgo: 8, hour: 21, text: 'Increasing guanfacine from 2mg to 3mg starting tonight, per the doctor.', title: 'Guanfacine change' },
  { daysAgo: 7, hour: 9, text: 'Woke up groggy again, foggy for a few hours after the guanfacine increase yesterday.' },
  { daysAgo: 7, hour: 18, text: 'Really did not want to leave my cozy spot on the couch for an appointment across town, ugh.' },
  { daysAgo: 6, hour: 20, text: 'Increasing Rexulti from 1mg to 2mg as of today.', title: 'Rexulti change' },
  { daysAgo: 6, hour: 9, text: 'So sluggish this morning, hard to get going, probably the Rexulti change kicking in.' },
  {
    daysAgo: 5,
    hour: 19,
    text: 'My in-laws expect us to drop everything for their schedule again and I feel so irritated by these family demands.',
    isImportant: true,
  },
  { daysAgo: 5, hour: 21, text: 'Even so, watching the kids and dogs curl up together tonight — I feel so warm and grateful for them.' },
  { daysAgo: 4, hour: 14, text: 'Waiting at the pharmacy line for 40 minutes, I felt real resistance to even being there, wanted to be home on the couch.' },
  { daysAgo: 3, hour: 22, text: "Talking through a new software idea for an hour tonight and I got so animated and energized, didn't want to stop building it." },
  { daysAgo: 2, hour: 8, text: 'Another software project idea hit me in the shower, got so excited sketching out the app on paper.' },
  {
    daysAgo: 1,
    hour: 17,
    text: 'My sister called about the holiday plans again, more family obligations dumped on me, and I felt myself getting annoyed.',
  },
  { daysAgo: 1, hour: 21, text: 'Later, snuggled with the dogs and felt nothing but love for them — a completely different feeling than earlier.' },
];

export function buildSeedEntries(): JournalEntry[] {
  return SEED_DRAFTS.map((draft, index) => {
    const createdAt = daysAgo(draft.daysAgo, draft.hour);
    return {
      id: `${SEED_ID_PREFIX}${index}`,
      createdAt,
      updatedAt: createdAt,
      title: draft.title,
      text: draft.text,
      isImportant: draft.isImportant ?? false,
      entryType: 'text',
      suggestedSubjects: tagEntrySubjects({ text: draft.text }),
      userTags: [],
      connectedPatternIds: [],
    };
  });
}

export function isSeedEntryId(id: string): boolean {
  return id.startsWith(SEED_ID_PREFIX);
}
