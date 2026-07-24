import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { GhostButton, SecondaryButton } from '@/components/Buttons';
import { ScreenBackground } from '@/components/ScreenBackground';
import { eventTimelineService } from '@/contextEngine';
import { EventCard } from '@/contextEngine/EventCard';
import { EventSourceSheet } from '@/contextEngine/EventSourceSheet';
import type { EventSourceContext, TimelineDayGroup, TimelineEventItem } from '@/contextEngine';
import { spacing, typography } from '@/theme';

type ListRow =
  | { kind: 'day-header'; dateKey: string; displayDate: string }
  | { kind: 'event'; dateKey: string; item: TimelineEventItem };

function flattenRows(groups: TimelineDayGroup[]): ListRow[] {
  const rows: ListRow[] = [];
  for (const group of groups) {
    rows.push({ kind: 'day-header', dateKey: group.dateKey, displayDate: group.displayDate });
    for (const item of group.events) {
      rows.push({ kind: 'event', dateKey: group.dateKey, item });
    }
  }
  return rows;
}

export default function EventTimelineScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<TimelineDayGroup[] | null>(null);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [sourceContext, setSourceContext] = useState<EventSourceContext | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [undoEventId, setUndoEventId] = useState<string | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const [visible, hidden] = await Promise.all([eventTimelineService.getVisibleTimeline(), eventTimelineService.getHiddenEvents()]);
    setGroups(visible);
    setHiddenCount(hidden.reduce((sum, g) => sum + g.events.length, 0));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openSource = useCallback(async (eventId: string) => {
    const context = await eventTimelineService.getSourceContext(eventId);
    setSourceContext(context);
    setSheetVisible(true);
  }, []);

  const closeSource = useCallback(() => setSheetVisible(false), []);

  const handleHide = useCallback(
    async (eventId: string) => {
      await eventTimelineService.hideEvent(eventId);
      await load();
      setUndoEventId(eventId);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setUndoEventId(null), 6000);
    },
    [load],
  );

  const handleUndo = useCallback(async () => {
    if (!undoEventId) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    const eventId = undoEventId;
    setUndoEventId(null);
    await eventTimelineService.restoreEvent(eventId);
    await load();
  }, [undoEventId, load]);

  const rows = groups ? flattenRows(groups) : [];

  return (
    <ScreenBackground>
      <FlatList
        data={rows}
        keyExtractor={(row) => (row.kind === 'day-header' ? `day-${row.dateKey}` : row.item.event.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={typography.display}>What Happened</Text>
            <Text style={typography.subtitle}>
              Reconstructed events from your entries, in order — nothing here is interpreted, just what was recorded.
            </Text>
            {hiddenCount > 0 && (
              <SecondaryButton onPress={() => router.push('/timeline/hidden')} style={styles.hiddenButton}>
                Hidden events ({hiddenCount})
              </SecondaryButton>
            )}
          </View>
        }
        renderItem={({ item: row }) =>
          row.kind === 'day-header' ? (
            <Text style={styles.dayHeader}>{row.displayDate}</Text>
          ) : (
            <EventCard item={row.item} onPressSource={() => openSource(row.item.event.id)} onHide={() => handleHide(row.item.event.id)} />
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          groups !== null ? (
            <Card style={styles.emptyCard}>
              <Text style={typography.body}>Nothing has been reconstructed yet.</Text>
              <Text style={[typography.bodySoft, { marginTop: spacing.xs }]}>
                As you write entries, what happened in them will appear here in order.
              </Text>
            </Card>
          ) : null
        }
      />

      {undoEventId && (
        <View style={styles.undoBanner}>
          <Text style={[typography.bodySoft, { color: '#fff' }]}>Event hidden.</Text>
          <GhostButton onPress={handleUndo} style={styles.undoButton}>
            Undo
          </GhostButton>
        </View>
      )}

      <EventSourceSheet visible={sheetVisible} context={sourceContext} onClose={closeSource} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg, gap: spacing.xs },
  hiddenButton: { alignSelf: 'flex-start', marginTop: spacing.sm },
  dayHeader: { ...typography.label, marginTop: spacing.md, marginBottom: spacing.xs },
  emptyCard: { marginTop: spacing.lg },
  undoBanner: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: '#2a1520',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  undoButton: { paddingHorizontal: spacing.sm },
});
