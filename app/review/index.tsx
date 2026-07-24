import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { SecondaryButton } from '@/components/Buttons';
import { ScreenBackground } from '@/components/ScreenBackground';
import { contextReviewService } from '@/contextEngine';
import type { ContextReviewGroup } from '@/contextEngine';
import { spacing, typography } from '@/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

function GroupCard({ group }: { group: ContextReviewGroup }) {
  const router = useRouter();
  return (
    <Card style={styles.card}>
      <Text style={typography.title}>{formatDate(group.journalCreatedAt)} journal</Text>
      <Text style={typography.bodySoft} numberOfLines={2}>
        "{group.journalExcerpt}"
      </Text>
      <Text style={typography.caption}>
        {group.pendingCount} {group.pendingCount === 1 ? 'detail' : 'details'} to review
      </Text>
      <SecondaryButton onPress={() => router.push(`/review/${group.journalEntryId}`)} style={styles.reviewButton}>
        Review
      </SecondaryButton>
    </Card>
  );
}

export default function ContextReviewInboxScreen() {
  const [groups, setGroups] = useState<ContextReviewGroup[] | null>(null);

  const load = useCallback(async () => {
    setGroups(await contextReviewService.getInboxGroups());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ScreenBackground>
      <FlatList
        data={groups ?? []}
        keyExtractor={(item) => item.journalEntryId}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={typography.display}>Context Review</Text>
            <Text style={typography.subtitle}>
              A few details Cherry Brain wasn't sure about. Review them whenever you'd like — nothing here is urgent.
            </Text>
          </View>
        }
        renderItem={({ item }) => <GroupCard group={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          groups !== null ? (
            <Card style={styles.emptyCard}>
              <Text style={typography.body}>Nothing needs your attention right now.</Text>
              <Text style={[typography.bodySoft, { marginTop: spacing.xs }]}>
                Cherry Brain will place questions here only when missing context changes what happened.
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
  header: { marginBottom: spacing.lg, gap: spacing.xs },
  card: { gap: spacing.xs },
  reviewButton: { alignSelf: 'flex-start', marginTop: spacing.sm },
  emptyCard: { marginTop: spacing.lg },
});
