import { buildDayGroups, formatDisplayDate, formatDisplayTime, resolveEventDate } from './timelineHelpers';
import type { EventTimelineVisibilityStore, FactCorrectionRecordStore, ReconstructedEventStore } from './storage';
import type {
  EventSourceContext,
  EventTimelineService,
  EventTimelineVisibility,
  JournalEntry,
  OriginalEntryLookup,
  TimelineDayGroup,
  TimelineEventItem,
} from './types';

export class DefaultEventTimelineService implements EventTimelineService {
  constructor(
    private eventStore: ReconstructedEventStore,
    private visibilityStore: EventTimelineVisibilityStore,
    private correctionStore: FactCorrectionRecordStore,
    private entryLookup: OriginalEntryLookup,
  ) {}

  async getVisibleTimeline(): Promise<TimelineDayGroup[]> {
    return this.buildTimeline((visibility) => !visibility?.isHidden);
  }

  async getHiddenEvents(): Promise<TimelineDayGroup[]> {
    return this.buildTimeline((visibility) => !!visibility?.isHidden);
  }

  private async buildTimeline(include: (visibility: EventTimelineVisibility | null) => boolean): Promise<TimelineDayGroup[]> {
    const events = await this.eventStore.getAll();
    const visibilityAll = await this.visibilityStore.getAll();
    const visibilityByEvent = new Map(visibilityAll.map((v) => [v.eventId, v]));
    const correctedEventIds = await this.getCorrectedEventIds();

    const journalEntryCache = new Map<string, JournalEntry | null>();
    const pairs: { item: TimelineEventItem; dateKey: string }[] = [];

    for (const event of events) {
      const visibility = visibilityByEvent.get(event.id) ?? null;
      if (!include(visibility)) continue;

      let journalEntry = journalEntryCache.get(event.journalEntryId);
      if (journalEntry === undefined) {
        journalEntry = await this.entryLookup.getOriginalEntry(event.journalEntryId);
        journalEntryCache.set(event.journalEntryId, journalEntry);
      }
      // The source entry is the only evidence for this event; without it
      // there is nothing safe to display.
      if (!journalEntry) continue;

      const { dateKey, datePrecision } = resolveEventDate(event, journalEntry);
      const item: TimelineEventItem = {
        event,
        journalEntry,
        displayDate: formatDisplayDate(dateKey),
        displayTime: formatDisplayTime(event),
        datePrecision,
        isCorrectedByUser: correctedEventIds.has(event.id),
        isHidden: !!visibility?.isHidden,
      };
      pairs.push({ item, dateKey });
    }

    return buildDayGroups(pairs);
  }

  private async getCorrectedEventIds(): Promise<Set<string>> {
    const corrections = await this.correctionStore.getAll();
    const ids = new Set<string>();
    for (const correction of corrections) {
      ids.add(correction.eventId);
      for (const change of correction.changes) ids.add(change.eventId);
    }
    return ids;
  }

  async hideEvent(eventId: string): Promise<EventTimelineVisibility> {
    const event = await this.eventStore.getById(eventId);
    if (!event) throw new Error(`No reconstructed event with id ${eventId}`);
    return this.visibilityStore.hide(eventId, new Date().toISOString());
  }

  async restoreEvent(eventId: string): Promise<EventTimelineVisibility> {
    const event = await this.eventStore.getById(eventId);
    if (!event) throw new Error(`No reconstructed event with id ${eventId}`);
    return this.visibilityStore.restore(eventId, new Date().toISOString());
  }

  async getSourceContext(eventId: string): Promise<EventSourceContext> {
    const event = await this.eventStore.getById(eventId);
    if (!event) throw new Error(`No reconstructed event with id ${eventId}`);

    const journalEntry = await this.entryLookup.getOriginalEntry(event.journalEntryId);
    if (!journalEntry) throw new Error(`No journal entry found for event ${eventId}`);

    const corrections = await this.correctionStore.getByEventId(eventId);
    return {
      event,
      journalEntry,
      sourcePassage: event.source,
      isCorrectedByUser: corrections.length > 0,
    };
  }
}
