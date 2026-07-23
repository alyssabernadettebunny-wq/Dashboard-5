import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { ScreenBackground } from '@/components/ScreenBackground';
import type { JournalEntry } from '@/models';
import { useAppData } from '@/state';
import { colors, spacing, typography } from '@/theme';

type DateRangeFilter = 'all' | 'week' | 'month';
const ENTRY_TYPES: JournalEntry['entryType'][] = ['text', 'voice', 'image'];

function withinRange(iso: string, range: DateRangeFilter): boolean {
  if (range === 'all') return true;
  const days = range === 'week' ? 7 : 30;
  const ms = Date.now() - new Date(iso).getTime();
  return ms <= days * 24 * 60 * 60 * 1000;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function StreamScreen() {
  const router = useRouter();
  const { entries } = useAppData();
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<DateRangeFilter>('all');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<JournalEntry['entryType'] | null>(null);

  const allSubjects = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of entries) for (const s of e.suggestedSubjects) map.set(s.key, s.label);
    return Array.from(map.entries());
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter((e) => (q ? `${e.title ?? ''} ${e.text}`.toLowerCase().includes(q) : true))
      .filter((e) => withinRange(e.createdAt, range))
      .filter((e) => (subjectFilter ? e.suggestedSubjects.some((s) => s.key === subjectFilter) : true))
      .filter((e) => (typeFilter ? e.entryType === typeFilter : true))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [entries, query, range, subjectFilter, typeFilter]);

  return (
    <ScreenBackground>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={typography.display}>Life Stream</Text>
            <Text style={typography.subtitle}>Everything you've dropped in, in order.</Text>

            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={18} color={colors.inkSoft} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search your entries"
                placeholderTextColor={colors.inkSoft}
                style={[typography.body, styles.searchInput]}
              />
            </View>

            <View style={styles.filterRow}>
              {(['all', 'week', 'month'] as DateRangeFilter[]).map((r) => (
                <Chip
                  key={r}
                  label={r === 'all' ? 'All time' : r === 'week' ? 'Past week' : 'Past month'}
                  selected={range === r}
                  onPress={() => setRange(r)}
                />
              ))}
            </View>

            <View style={styles.filterRow}>
              {ENTRY_TYPES.map((t) => (
                <Chip key={t} label={t} selected={typeFilter === t} onPress={() => setTypeFilter(typeFilter === t ? null : t)} />
              ))}
            </View>

            {allSubjects.length > 0 && (
              <View style={styles.filterRow}>
                {allSubjects.map(([key, label]) => (
                  <Chip
                    key={key}
                    label={label}
                    selected={subjectFilter === key}
                    onPress={() => setSubjectFilter(subjectFilter === key ? null : key)}
                  />
                ))}
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/entry/${item.id}`)}>
            <Card style={styles.entryCard}>
              <View style={styles.row}>
                <Text style={typography.caption}>{formatDate(item.createdAt)}</Text>
                {item.isImportant && <Ionicons name="star" size={14} color={colors.dustyRose} />}
              </View>
              {item.title && <Text style={[typography.title, styles.entryTitle]}>{item.title}</Text>}
              <Text style={typography.bodySoft} numberOfLines={3}>{item.text}</Text>
              {item.connectedPatternIds.length > 0 && (
                <Text style={[typography.caption, styles.connected]}>
                  Connected to {item.connectedPatternIds.length} {item.connectedPatternIds.length === 1 ? 'pattern' : 'patterns'}
                </Text>
              )}
            </Card>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <Card style={{ marginTop: spacing.lg }}>
            <Text style={typography.body}>Nothing matches yet.</Text>
          </Card>
        }
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.md, gap: spacing.sm },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  searchInput: { flex: 1, paddingVertical: spacing.sm },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  entryCard: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryTitle: { fontSize: 18 },
  connected: { color: colors.mauve },
});
