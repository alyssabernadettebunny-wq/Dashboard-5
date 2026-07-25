import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { ScreenBackground } from '@/components/ScreenBackground';
import { contextReviewService, eventTimelineService } from '@/contextEngine';
import { ContextEngineDevPanel } from '@/contextEngine/DevPanel';
import { StorageSafetyPanel } from '@/components/StorageSafetyPanel';
import { ANALYSIS_CATEGORIES, ANALYSIS_CATEGORY_LABELS } from '@/models';
import { useAppData } from '@/state';
import { colors, spacing, typography } from '@/theme';

function ContextReviewEntryPoint() {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      contextReviewService.getInboxGroups().then((groups) => {
        setPendingCount(groups.reduce((sum, g) => sum + g.pendingCount, 0));
      });
    }, []),
  );

  return (
    <Card style={styles.card}>
      <Text style={typography.label}>CONTEXT REVIEW</Text>
      <Text style={typography.bodySoft}>
        {pendingCount === 0
          ? "Nothing needs your attention right now."
          : `${pendingCount} ${pendingCount === 1 ? 'detail' : 'details'} to review, whenever you'd like.`}
      </Text>
      <PrimaryButton onPress={() => router.push('/review')} style={styles.reviewEntryButton}>
        Open Context Review
      </PrimaryButton>
    </Card>
  );
}

function EventTimelineEntryPoint() {
  const router = useRouter();
  const [eventCount, setEventCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      eventTimelineService.getVisibleTimeline().then((groups) => {
        setEventCount(groups.reduce((sum, g) => sum + g.events.length, 0));
      });
    }, []),
  );

  return (
    <Card style={styles.card}>
      <Text style={typography.label}>WHAT HAPPENED</Text>
      <Text style={typography.bodySoft}>
        {eventCount === 0
          ? 'Nothing has been reconstructed from your entries yet.'
          : `${eventCount} reconstructed ${eventCount === 1 ? 'event' : 'events'}, in order.`}
      </Text>
      <PrimaryButton onPress={() => router.push('/timeline')} style={styles.reviewEntryButton}>
        Open Timeline
      </PrimaryButton>
    </Card>
  );
}

const PRODUCT_RULES = [
  'Never infer or assign a diagnosis',
  'Never present an interpretation as objective fact',
  'Never shame the user',
  'Never use streaks',
  'Never create artificial urgency',
  'Never hide the evidence behind a pattern',
  "Never overwrite the user's correction",
  'Never analyze a disabled category',
  'Never imply that low activity is failure',
];

export default function SettingsScreen() {
  const { settings, setBoundary, unsuppressSubject, loadSeedData, removeSeedData } = useAppData();

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>Settings & Boundaries</Text>
        <Text style={typography.subtitle}>You decide what Cherry Brain is allowed to notice.</Text>

        <Card style={styles.card}>
          <Text style={typography.label}>WHAT I MAY ANALYZE</Text>
          {ANALYSIS_CATEGORIES.map((category) => (
            <View key={category} style={styles.boundaryRow}>
              <Text style={[typography.body, styles.boundaryLabel]}>{ANALYSIS_CATEGORY_LABELS[category]}</Text>
              <Switch
                value={settings.boundaries[category]}
                onValueChange={(value) => setBoundary(category, value)}
                trackColor={{ true: colors.dustyRose, false: colors.hairline }}
                thumbColor={colors.white}
              />
            </View>
          ))}
        </Card>

        {settings.suppressedSubjects.length > 0 && (
          <Card style={styles.card}>
            <Text style={typography.label}>SUBJECTS YOU'VE ASKED ME TO LEAVE ALONE</Text>
            <View style={styles.tagRow}>
              {settings.suppressedSubjects.map((s) => (
                <Chip key={s} label={s.replace(/_/g, ' ')} onPress={() => unsuppressSubject(s)} />
              ))}
            </View>
            <Text style={typography.caption}>Tap one to let me analyze it again.</Text>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={typography.label}>HOW CHERRY BRAIN WORKS</Text>
          {PRODUCT_RULES.map((rule) => (
            <Text key={rule} style={[typography.bodySoft, styles.ruleLine]}>
              · {rule}
            </Text>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={typography.label}>WHERE YOUR DATA LIVES</Text>
          <Text style={typography.bodySoft}>
            Everything you write is stored only on this device ({Platform.OS}), in a permanent file outside your browser. Nothing
            is sent anywhere or shared with anyone. Encrypted cloud sync and an AI-assisted analysis option are planned for later,
            and will always be something you turn on, not something that happens by default.
          </Text>
        </Card>

        <StorageSafetyPanel />

        {__DEV__ && (
          <Card style={styles.card}>
            <Text style={typography.label}>DEVELOPMENT SEED DATA</Text>
            <Text style={typography.bodySoft}>Developer-only sample data controls.</Text>
            <View style={styles.tagRow}>
              <SecondaryButton onPress={loadSeedData}>Add sample entries</SecondaryButton>
              <SecondaryButton onPress={removeSeedData}>Remove sample entries</SecondaryButton>
            </View>
          </Card>
        )}

        <ContextReviewEntryPoint />

        <EventTimelineEntryPoint />

        {__DEV__ && (
          <Card style={styles.card}>
            <Text style={typography.label}>CONTEXT ENGINE (DEV TEST)</Text>
            <ContextEngineDevPanel />
          </Card>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  card: { gap: spacing.sm },
  reviewEntryButton: { alignSelf: 'flex-start' },
  boundaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boundaryLabel: { flex: 1, paddingRight: spacing.md },
  ruleLine: {},
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
