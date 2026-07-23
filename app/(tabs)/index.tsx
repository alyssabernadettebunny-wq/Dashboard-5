import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CherrySprig } from '@/components/CherrySprig';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { PrimaryButton, GhostButton } from '@/components/Buttons';
import { ScreenBackground } from '@/components/ScreenBackground';
import type { PatternObservation } from '@/models';
import { derivePatternStatus } from '@/patternEngine';
import { useAppData } from '@/state';
import { colors, spacing, typography } from '@/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function PatternCard({ pattern }: { pattern: PatternObservation }) {
  const router = useRouter();
  const { addPatternFeedback } = useAppData();
  const [noted, setNoted] = useState<string | null>(null);
  const status = derivePatternStatus(pattern);

  const record = async (type: Parameters<typeof addPatternFeedback>[1], label: string) => {
    await addPatternFeedback(pattern.id, type);
    setNoted(label);
    setTimeout(() => setNoted(null), 2200);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <ConfidenceBadge status={status} />
        <Text style={typography.caption}>{formatDate(pattern.createdAt)}</Text>
      </View>
      <Text style={[typography.title, styles.cardTitle]}>{pattern.title}</Text>
      <Text style={[typography.body, styles.cardDescription]}>{pattern.description}</Text>
      <Text style={[typography.caption, styles.evidenceCount]}>
        {pattern.evidence.length} supporting {pattern.evidence.length === 1 ? 'entry' : 'entries'}
      </Text>

      <GhostButton onPress={() => router.push(`/pattern/${pattern.id}`)} style={styles.evidenceButton}>
        View supporting evidence
      </GhostButton>

      <View style={styles.feedbackRow}>
        <Chip label="That's true" onPress={() => record('confirmed', 'Noted — thank you')} />
        <Chip label="Maybe" onPress={() => record('maybe', 'Noted')} />
        <Chip label="That's wrong" onPress={() => record('rejected', "Okay, I'll rethink this")} />
        <Chip label="Tell me more" onPress={() => router.push(`/pattern/${pattern.id}`)} />
        <Chip label="Don't analyze this subject" onPress={() => record('suppressed_subject', "I'll leave this alone")} />
      </View>
      {noted && <Text style={[typography.caption, styles.noted]}>{noted}</Text>}
    </Card>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { patterns, loading } = useAppData();

  const visiblePatterns = useMemo(() => {
    return patterns
      .filter((p) => !p.isPaused && !p.mergedIntoId)
      .filter((p) => ['emerging', 'recurring', 'strong_signal'].includes(derivePatternStatus(p)))
      .sort((a, b) => new Date(b.lastSupportingAt).getTime() - new Date(a.lastSupportingAt).getTime());
  }, [patterns]);

  return (
    <ScreenBackground>
      <FlatList
        data={visiblePatterns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <CherrySprig />
              <Text style={[typography.display, styles.headerTitle]}>I've Been Thinking…</Text>
            </View>
            <Text style={[typography.subtitle, styles.headerSubtitle]}>
              Quiet observations from what you've shared, never a scoreboard.
            </Text>
            <PrimaryButton onPress={() => router.push('/drop')} style={styles.dropButton}>
              Drop Something In
            </PrimaryButton>
          </View>
        }
        renderItem={({ item }) => <PatternCard pattern={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          !loading ? (
            <Card style={styles.emptyCard}>
              <Text style={typography.body}>
                Nothing to share yet. Drop a few things in and I'll start noticing quietly, in the background.
              </Text>
            </Card>
          ) : null
        }
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  headerTitle: { flexShrink: 1 },
  headerSubtitle: { marginBottom: spacing.lg },
  dropButton: { alignSelf: 'flex-start', paddingHorizontal: spacing.xl },
  card: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: {},
  cardDescription: {},
  evidenceCount: { color: colors.inkSoft },
  evidenceButton: { alignSelf: 'flex-start', paddingLeft: 0 },
  feedbackRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  noted: { color: colors.mauve, fontStyle: 'italic' },
  emptyCard: { marginTop: spacing.lg },
});
