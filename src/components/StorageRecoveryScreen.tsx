import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { downloadCherryBrainBackup } from '@/backup';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { Card } from '@/components/Card';
import { ScreenBackground } from '@/components/ScreenBackground';
import { dataStore } from '@/storage/FileServerDataStore';
import type { CorruptStorageRecord } from '@/storage/StorageIntegrity';
import { colors, spacing, typography } from '@/theme';

export function StorageRecoveryScreen({ records, onRecovered }: { records: CorruptStorageRecord[]; onRecovered: () => void }) {
  const [details, setDetails] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const exportReadable = async () => {
    setBusy(true);
    try {
      await downloadCherryBrainBackup({ readableOnly: true });
      setMessage('Readable Cherry Brain data was exported. Corrupted raw data was included in the warning section.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The readable data export failed. Nothing was changed.');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    const perform = async () => {
      setBusy(true);
      try {
        await Promise.all(records.map((record) => dataStore.removeItem(record.key)));
        onRecovered();
      } finally {
        setBusy(false);
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Delete the corrupted local records? This cannot be undone unless you exported them first.')) void perform();
    } else {
      Alert.alert('Reset corrupted local data?', 'This deletes the affected local records. Export readable data first.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => void perform() },
      ]);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={typography.title}>Cherry Brain couldn’t safely read some of your saved data.</Text>
          <Text style={typography.body}>Your storage has not been erased or replaced.</Text>
          <PrimaryButton onPress={exportReadable} disabled={busy}>Export readable data</PrimaryButton>
          <SecondaryButton onPress={() => setDetails((value) => !value)} disabled={busy}>View details</SecondaryButton>
          {details && records.map((record) => (
            <View key={record.key} style={styles.detail}>
              <Text style={typography.label}>{record.key}</Text>
              <Text style={typography.caption}>{record.message}</Text>
            </View>
          ))}
          <SecondaryButton onPress={reset} disabled={busy}>Reset corrupted local data</SecondaryButton>
          {message && <Text style={[typography.caption, styles.message]}>{message}</Text>}
        </Card>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, flexGrow: 1, justifyContent: 'center' },
  card: { gap: spacing.md },
  detail: { borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: spacing.sm, gap: spacing.xs },
  message: { color: colors.darkCherry },
});
