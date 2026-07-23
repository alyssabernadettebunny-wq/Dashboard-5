import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { GhostButton, SecondaryButton } from '@/components/Buttons';
import { ScreenBackground } from '@/components/ScreenBackground';
import type { PatternFeedbackType } from '@/models';
import { derivePatternStatus } from '@/patternEngine';
import { useAppData } from '@/state';
import { spacing, typography } from '@/theme';

const FEEDBACK_LABELS: Record<PatternFeedbackType, string> = {
  confirmed: "That's true",
  maybe: 'Maybe',
  rejected: "That's wrong",
  tell_me_more: 'Tell me more',
  suppressed_subject: "Don't analyze this subject",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PatternDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { patterns, entries, addPatternFeedback, setPatternPaused, mergePatterns } = useAppData();
  const [showMergePicker, setShowMergePicker] = useState(false);

  const pattern = patterns.find((p) => p.id === id);

  const otherPatterns = useMemo(
    () => patterns.filter((p) => p.id !== id && !p.mergedIntoId),
    [patterns, id],
  );

  if (!pattern) {
    return (
      <ScreenBackground>
        <View style={styles.missing}>
          <Text style={typography.body}>This pattern is no longer here.</Text>
        </View>
      </ScreenBackground>
    );
  }

  const status = derivePatternStatus(pattern);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <ConfidenceBadge status={status} />
        <Text style={typography.display}>{pattern.title}</Text>
        <Text style={typography.body}>{pattern.description}</Text>

        <View style={styles.tagRow}>
          {pattern.relatedSubjects.map((s) => (
            <Chip key={s} label={s.replace(/_/g, ' ')} tone="cherry" />
          ))}
        </View>

        <Card style={styles.metaCard}>
          <Text style={typography.caption}>First noticed {formatDate(pattern.firstObservedAt)}</Text>
          <Text style={typography.caption}>Most recent support {formatDate(pattern.lastSupportingAt)}</Text>
          <Text style={typography.caption}>{pattern.evidence.length} supporting entries</Text>
        </Card>

        <Text style={typography.label}>SUPPORTING EVIDENCE</Text>
        <View style={{ gap: spacing.sm }}>
          {pattern.evidence.map((ev) => {
            const stillExists = entries.some((e) => e.id === ev.entryId);
            return (
              <Card key={ev.id} style={styles.evidenceCard}>
                <Text style={typography.caption}>{formatDate(ev.entryCreatedAt)}</Text>
                <Text style={typography.bodySoft}>{ev.entrySnippet}</Text>
                {stillExists && (
                  <GhostButton onPress={() => router.push(`/entry/${ev.entryId}`)} style={styles.viewEntryButton}>
                    View entry
                  </GhostButton>
                )}
              </Card>
            );
          })}
        </View>

        <Text style={typography.label}>YOUR FEEDBACK, HOW THIS HAS CHANGED</Text>
        {pattern.feedbackHistory.length === 0 ? (
          <Text style={typography.bodySoft}>No feedback yet — the controls below are always here when you're ready.</Text>
        ) : (
          <View style={{ gap: spacing.xs }}>
            {pattern.feedbackHistory
              .slice()
              .reverse()
              .map((f) => (
                <Text key={f.id} style={typography.bodySoft}>
                  {formatDate(f.createdAt)} · {FEEDBACK_LABELS[f.type]}
                </Text>
              ))}
          </View>
        )}

        <View style={styles.feedbackRow}>
          <Chip label="That's true" onPress={() => addPatternFeedback(pattern.id, 'confirmed')} />
          <Chip label="Maybe" onPress={() => addPatternFeedback(pattern.id, 'maybe')} />
          <Chip label="That's wrong" onPress={() => addPatternFeedback(pattern.id, 'rejected')} />
          <Chip label="Tell me more" onPress={() => addPatternFeedback(pattern.id, 'tell_me_more')} />
          <Chip label="Don't analyze this subject" onPress={() => addPatternFeedback(pattern.id, 'suppressed_subject')} />
        </View>

        <Text style={typography.label}>MANAGE THIS PATTERN</Text>
        <View style={styles.manageRow}>
          <SecondaryButton onPress={() => setPatternPaused(pattern.id, !pattern.isPaused)} style={styles.manageButton}>
            {pattern.isPaused ? 'Resume analysis' : 'Pause analysis'}
          </SecondaryButton>
          <SecondaryButton onPress={() => addPatternFeedback(pattern.id, 'rejected')} style={styles.manageButton}>
            Mark interpretation incorrect
          </SecondaryButton>
        </View>

        <SecondaryButton onPress={() => setShowMergePicker((v) => !v)} style={styles.manageButton}>
          {showMergePicker ? 'Hide merge options' : 'Merge with a related pattern'}
        </SecondaryButton>

        {showMergePicker && (
          <View style={styles.tagRow}>
            {otherPatterns.length === 0 ? (
              <Text style={typography.bodySoft}>No other patterns to merge with yet.</Text>
            ) : (
              otherPatterns.map((p) => (
                <Chip
                  key={p.id}
                  label={p.title}
                  onPress={async () => {
                    await mergePatterns(p.id, pattern.id);
                    setShowMergePicker(false);
                  }}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  missing: { padding: spacing.lg },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  metaCard: { gap: 4 },
  evidenceCard: { gap: 4 },
  viewEntryButton: { alignSelf: 'flex-start', paddingLeft: 0 },
  feedbackRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  manageRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  manageButton: { flexGrow: 1 },
});
