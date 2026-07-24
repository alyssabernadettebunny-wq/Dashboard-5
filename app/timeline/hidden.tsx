import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
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

export default function HiddenEventsScreen() {
  const [groups, setGroups] = useState<TimelineDayGroup[] | null>(null);
  const [sourceContext, setSourceContext] = useState<EventSourceContext | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const load = useCallback(async () => {
    setGroups(await eventTimelineService.getHiddenEvents());
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

  const handleRestore = useCallback(
    async (eventId: string) => {
      await eventTimelineService.restoreEvent(eventId);
      await load();
    },
    [load],
  );

  const rows = groups ? flattenRows(groups) : [];

  return (
    <ScreenBackground>
      <FlatList
        data={rows}
        keyExtractor={(row) => (row.kind === 'day-header' ? `day-${row.dateKey}` : row.item.event.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={typography.display}>Hidden Events</Text>
            <Text style={typography.subtitle}>
              Events you've hidden from the timeline. Nothing here was deleted — restore any of them at any time.
            </Text>
          </View>
        }
        renderItem={({ item: row }) =>
          row.kind === 'day-header' ? (
            <Text style={styles.dayHeader}>{row.displayDate}</Text>
          ) : (
            <EventCard item={row.item} onPressSource={() => openSource(row.item.event.id)} onRestore={() => handleRestore(row.item.event.id)} />
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          groups !== null ? (
            <Card style={styles.emptyCard}>
              <Text style={typography.body}>No events are hidden.</Text>
            </Card>
          ) : null
        }
      />

      <EventSourceSheet visible={sheetVisible} context={sourceContext} onClose={closeSource} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg, gap: spacing.xs },
  dayHeader: { ...typography.label, marginTop: spacing.md, marginBottom: spacing.xs },
  emptyCard: { marginTop: spacing.lg },
});
