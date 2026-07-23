import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CherrySprig } from '@/components/CherrySprig';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { PrimaryButton, GhostButton, SecondaryButton } from '@/components/Buttons';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useResponsive } from '@/hooks/useResponsive';
import type { JournalEntry, PatternObservation } from '@/models';
import { derivePatternStatus } from '@/patternEngine';
import { useAppData } from '@/state';
import { colors, spacing, typography } from '@/theme';

const HOME_DESKTOP_MAX_WIDTH = 1180;

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

function HomeHeader({ onDrop }: { onDrop: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <CherrySprig />
        <Text style={[typography.display, styles.headerTitle]}>I've Been Thinking…</Text>
      </View>
      <Text style={[typography.subtitle, styles.headerSubtitle]}>
        Quiet observations from what you've shared, never a scoreboard.
      </Text>
      <PrimaryButton onPress={onDrop} style={styles.dropButton}>
        Drop Something In
      </PrimaryButton>
    </View>
  );
}

function QuickCatchCard() {
  const { createEntry } = useAppData();
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    await createEntry({ text, isImportant: false });
    setText('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card style={styles.railCard}>
      <Text style={typography.label}>QUICK CATCH</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Something small to jot down…"
        placeholderTextColor={colors.inkSoft}
        multiline
        style={[typography.bodySoft, styles.quickInput]}
      />
      <SecondaryButton onPress={handleSave} disabled={!text.trim()} style={styles.quickSaveButton}>
        Save
      </SecondaryButton>
      {saved && <Text style={[typography.caption, styles.noted]}>Saved. It's safe with me.</Text>}
    </Card>
  );
}

function RecentEntriesRail({ entries }: { entries: JournalEntry[] }) {
  const router = useRouter();
  const recent = useMemo(
    () => [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4),
    [entries],
  );

  return (
    <Card style={styles.railCard}>
      <Text style={typography.label}>RECENTLY DROPPED IN</Text>
      {recent.length === 0 ? (
        <Text style={typography.bodySoft}>Nothing yet.</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {recent.map((entry) => (
            <Pressable key={entry.id} onPress={() => router.push(`/entry/${entry.id}`)}>
              <Text style={typography.caption}>{formatDate(entry.createdAt)}</Text>
              <Text style={typography.bodySoft} numberOfLines={2}>
                {entry.title || entry.text}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </Card>
  );
}

function ActivePatternsRail({ patterns }: { patterns: PatternObservation[] }) {
  const router = useRouter();
  return (
    <Card style={styles.railCard}>
      <Text style={typography.label}>ACTIVE PATTERNS</Text>
      {patterns.length === 0 ? (
        <Text style={typography.bodySoft}>Nothing active yet.</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {patterns.map((p) => (
            <Pressable key={p.id} style={styles.activePatternRow} onPress={() => router.push(`/pattern/${p.id}`)}>
              <ConfidenceBadge status={derivePatternStatus(p)} />
              <Text style={[typography.bodySoft, styles.activePatternTitle]} numberOfLines={1}>
                {p.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </Card>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { patterns, entries, loading } = useAppData();
  const { isDesktop } = useResponsive();

  const visiblePatterns = useMemo(() => {
    return patterns
      .filter((p) => !p.isPaused && !p.mergedIntoId)
      .filter((p) => ['emerging', 'recurring', 'strong_signal'].includes(derivePatternStatus(p)))
      .sort((a, b) => new Date(b.lastSupportingAt).getTime() - new Date(a.lastSupportingAt).getTime());
  }, [patterns]);

  if (isDesktop) {
    return (
      <ScreenBackground maxWidth={HOME_DESKTOP_MAX_WIDTH}>
        <ScrollView contentContainerStyle={styles.desktopScroll}>
          <HomeHeader onDrop={() => router.push('/drop')} />
          <View style={styles.desktopColumns}>
            <View style={styles.mainColumn}>
              {visiblePatterns.length === 0 && !loading ? (
                <Card style={styles.emptyCard}>
                  <Text style={typography.body}>
                    Nothing to share yet. Drop a few things in and I'll start noticing quietly, in the background.
                  </Text>
                </Card>
              ) : (
                visiblePatterns.map((p) => <PatternCard key={p.id} pattern={p} />)
              )}
            </View>
            <View style={styles.sideColumn}>
              <QuickCatchCard />
              <RecentEntriesRail entries={entries} />
              <ActivePatternsRail patterns={visiblePatterns} />
            </View>
          </View>
        </ScrollView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <FlatList
        data={visiblePatterns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<HomeHeader onDrop={() => router.push('/drop')} />}
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
  desktopScroll: { padding: spacing.xl, paddingBottom: spacing.xxl },
  desktopColumns: { flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-start' },
  mainColumn: { flex: 2, gap: spacing.md },
  sideColumn: { flex: 1, gap: spacing.md, maxWidth: 320 },
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
  railCard: { gap: spacing.sm },
  quickInput: { minHeight: 70, textAlignVertical: 'top' },
  quickSaveButton: { alignSelf: 'flex-start' },
  activePatternRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  activePatternTitle: { flex: 1 },
});
