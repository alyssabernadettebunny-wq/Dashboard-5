import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '@/components/Card';
import { GhostButton, PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { ScreenBackground } from '@/components/ScreenBackground';
import { contextReviewService, ContextReviewError } from '@/contextEngine';
import type { ContextReviewGroup, ContextReviewItem, CorrectionCategory } from '@/contextEngine';
import { colors, radius, spacing, typography } from '@/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

const PLACEHOLDER_BY_CATEGORY: Record<CorrectionCategory, string> = {
  participant: 'Type the correct person',
  action: 'Describe what actually happened',
  outcome: 'Describe what actually happened',
  time: 'Enter the correct time',
  sequence: '',
};

export default function ContextReviewActiveScreen() {
  const { journalEntryId } = useLocalSearchParams<{ journalEntryId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [journalCreatedAt, setJournalCreatedAt] = useState<string | null>(null);
  const [originalEntryText, setOriginalEntryText] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);
  const [items, setItems] = useState<ContextReviewItem[]>([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [dismissedCount, setDismissedCount] = useState(0);
  const [hasOtherGroups, setHasOtherGroups] = useState(false);

  const [answerText, setAnswerText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const group: ContextReviewGroup | null = await contextReviewService.getReviewGroup(journalEntryId);
    if (group) {
      setJournalCreatedAt(group.journalCreatedAt);
      setOriginalEntryText(group.questions[0]?.originalEntryText ?? '');
      setTotalCount(group.pendingCount);
      setItems(group.questions);
    } else {
      setItems([]);
      setTotalCount(0);
    }
    setLoading(false);
  }, [journalEntryId]);

  useEffect(() => {
    load();
  }, [load]);

  const current = items[0] ?? null;
  const groupComplete = !loading && items.length === 0 && (answeredCount > 0 || dismissedCount > 0);
  const nothingToReview = !loading && items.length === 0 && answeredCount === 0 && dismissedCount === 0;

  useEffect(() => {
    if (!groupComplete) return;
    (async () => {
      const groups = await contextReviewService.getInboxGroups();
      setHasOtherGroups(groups.some((g) => g.journalEntryId !== journalEntryId));
    })();
  }, [groupComplete, journalEntryId]);

  useEffect(() => {
    setAnswerText('');
    setError(null);
    setShowOriginal(false);
  }, [current?.question.id]);

  const advanceAfter = () => {
    setItems((prev) => prev.slice(1));
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  const handleSave = useCallback(
    async (selectedOptionId?: string) => {
      if (!current) return;
      const isChoice = current.question.options != null;
      if (!isChoice && answerText.trim().length === 0) return;

      setSaving(true);
      setError(null);
      try {
        await contextReviewService.answerQuestion({
          questionId: current.question.id,
          answer: answerText,
          selectedOptionId,
        });
        setAnsweredCount((n) => n + 1);
        advanceAfter();
      } catch (err) {
        if (err instanceof ContextReviewError) {
          setError("That correction wasn't saved. Your answer is still here.");
        } else {
          setError("That correction wasn't saved. Your answer is still here.");
        }
      } finally {
        setSaving(false);
      }
    },
    [current, answerText],
  );

  const handleDismiss = useCallback(async () => {
    if (!current) return;
    setSaving(true);
    setError(null);
    try {
      await contextReviewService.dismissQuestion(current.question.id);
      setDismissedCount((n) => n + 1);
      advanceAfter();
    } catch {
      setError("That couldn't be dismissed. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [current]);

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.content} />
      </ScreenBackground>
    );
  }

  if (nothingToReview) {
    return (
      <ScreenBackground>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={typography.body}>Nothing needs your attention right now.</Text>
          </Card>
        </View>
      </ScreenBackground>
    );
  }

  if (groupComplete) {
    const parts: string[] = [];
    if (answeredCount > 0) parts.push(`${answeredCount} ${answeredCount === 1 ? 'fact' : 'facts'} updated`);
    if (dismissedCount > 0) parts.push(`${dismissedCount} ${dismissedCount === 1 ? 'question' : 'questions'} dismissed`);

    return (
      <ScreenBackground>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={typography.title}>That entry is clear now.</Text>
            {parts.length > 0 && <Text style={typography.bodySoft}>{parts.join(' · ')}</Text>}
            <View style={styles.actionRow}>
              <SecondaryButton onPress={() => router.push('/review')} style={styles.flexButton}>
                Back to inbox
              </SecondaryButton>
              {hasOtherGroups && (
                <PrimaryButton onPress={() => router.push('/review')} style={styles.flexButton}>
                  Review next entry
                </PrimaryButton>
              )}
            </View>
          </Card>
        </View>
      </ScreenBackground>
    );
  }

  if (!current) return null;

  const questionNumber = totalCount - items.length + 1;
  const isChoice = current.question.options != null;

  return (
    <ScreenBackground>
      <View style={styles.content}>
        <Text style={typography.caption}>{journalCreatedAt ? formatDate(journalCreatedAt) : ''}</Text>
        <Text style={[typography.label, styles.progress]}>
          Question {questionNumber} of {totalCount}
        </Text>

        <Card style={styles.card}>
          <Text style={typography.title}>{current.question.question}</Text>

          <View style={styles.reconstructionBlock}>
            <Text style={typography.label}>CHERRY BRAIN UNDERSTOOD:</Text>
            <Text style={typography.body}>{current.event.summary}</Text>
          </View>

          <View style={styles.sourceBlock}>
            <Text style={typography.label}>FROM YOUR ENTRY:</Text>
            <Text style={[typography.bodySoft, styles.sourceText]} selectable>
              "{current.sourcePassage.text}"
            </Text>
          </View>

          {isChoice ? (
            <View style={{ gap: spacing.sm }}>
              {current.question.options!.map((option) => (
                <SecondaryButton
                  key={option.id}
                  onPress={() => handleSave(option.id)}
                  disabled={saving}
                  style={styles.optionButton}
                >
                  {option.label}
                </SecondaryButton>
              ))}
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <TextInput
                value={answerText}
                onChangeText={setAnswerText}
                placeholder={PLACEHOLDER_BY_CATEGORY[current.question.category]}
                placeholderTextColor={colors.inkSoft}
                style={[typography.body, styles.input]}
                autoFocus={false}
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
              {saved && <Text style={styles.savedText}>Saved.</Text>}
              <View style={styles.actionRow}>
                <PrimaryButton onPress={() => handleSave()} disabled={saving || answerText.trim().length === 0} style={styles.flexButton}>
                  {saving ? 'Saving…' : 'Save correction'}
                </PrimaryButton>
              </View>
            </View>
          )}

          <View style={styles.footerRow}>
            <GhostButton onPress={handleDismiss} disabled={saving}>
              Dismiss
            </GhostButton>
            <GhostButton onPress={() => setShowOriginal((v) => !v)}>
              {showOriginal ? 'Hide original entry' : 'View original entry'}
            </GhostButton>
          </View>

          {showOriginal && (
            <View style={styles.originalBlock}>
              <Text style={typography.label}>ORIGINAL ENTRY (READ-ONLY)</Text>
              <Text style={typography.bodySoft} selectable>
                {originalEntryText}
              </Text>
            </View>
          )}
        </Card>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.sm },
  progress: { marginBottom: spacing.xs },
  card: { gap: spacing.md },
  reconstructionBlock: { gap: 4 },
  sourceBlock: {
    gap: 4,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.creamDeep,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  sourceText: { fontStyle: 'italic' },
  input: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.white,
  },
  optionButton: { alignSelf: 'stretch' },
  errorText: { color: colors.darkCherry },
  savedText: { color: colors.mauve, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  flexButton: { flex: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  originalBlock: {
    gap: 4,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
});
