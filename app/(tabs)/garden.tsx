import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { ScreenBackground } from '@/components/ScreenBackground';
import type { PatternObservation } from '@/models';
import { derivePatternStatus } from '@/patternEngine';
import { useAppData } from '@/state';
import { colors, spacing, typography } from '@/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function GardenCard({ pattern }: { pattern: PatternObservation }) {
  const router = useRouter();
  const { setPatternPaused } = useAppData();
  const status = derivePatternStatus(pattern);

  return (
    <Pressable onPress={() => router.push(`/pattern/${pattern.id}`)}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <ConfidenceBadge status={status} />
          {pattern.isPaused && <Text style={[typography.caption, styles.pausedTag]}>Paused</Text>}
        </View>
        <Text style={[typography.title, styles.title]}>{pattern.title}</Text>
        <Text style={[typography.bodySoft]} numberOfLines={2}>{pattern.description}</Text>

        <View style={styles.metaRow}>
          <Text style={typography.caption}>First noticed {formatDate(pattern.firstObservedAt)}</Text>
          <Text style={typography.caption}>Last {formatDate(pattern.lastSupportingAt)}</Text>
        </View>
        <Text style={typography.caption}>{pattern.evidence.length} supporting entries</Text>

        <View style={styles.tagRow}>
          {pattern.relatedSubjects.map((s) => (
            <Chip key={s} label={s.replace(/_/g, ' ')} tone="cherry" />
          ))}
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            setPatternPaused(pattern.id, !pattern.isPaused);
          }}
          style={styles.pauseButton}
        >
          <Text style={[typography.label, { color: colors.darkCherry }]}>
            {pattern.isPaused ? 'Resume analysis' : 'Pause analysis'}
          </Text>
        </Pressable>
      </Card>
    </Pressable>
  );
}

export default function GardenScreen() {
  const { patterns } = useAppData();

  const activePatterns = useMemo(
    () => patterns.filter((p) => !p.mergedIntoId).sort((a, b) => new Date(b.lastSupportingAt).getTime() - new Date(a.lastSupportingAt).getTime()),
    [patterns],
  );

  return (
    <ScreenBackground>
      <FlatList
        data={activePatterns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={typography.display}>Pattern Garden</Text>
            <Text style={typography.subtitle}>Everything Cherry Brain is quietly tending to, tap any of these for the full picture.</Text>
          </View>
        }
        renderItem={({ item }) => <GardenCard pattern={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <Card style={{ marginTop: spacing.lg }}>
            <Text style={typography.body}>Nothing has taken root yet. Patterns appear once a few entries start echoing each other.</Text>
          </Card>
        }
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg, gap: spacing.xs },
  card: { gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pausedTag: { color: colors.mauve, fontStyle: 'italic' },
  title: {},
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  pauseButton: { marginTop: spacing.sm, alignSelf: 'flex-start' },
});
