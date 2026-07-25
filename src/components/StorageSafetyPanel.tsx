import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  backUpNow,
  downloadCherryBrainBackup,
  exportCopyToFolder,
  getStorageStatus,
  listBackups,
  openCherryBrainFolder,
  restoreBackup,
  type BackupFileInfo,
  type StorageStatus,
} from '@/backup';
import { GhostButton, PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { Card } from '@/components/Card';
import { colors, spacing, typography } from '@/theme';

function formatWhen(iso: string | null): string {
  if (!iso) return 'Not yet';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function StorageSafetyPanel() {
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showBackups, setShowBackups] = useState(false);
  const [backups, setBackups] = useState<BackupFileInfo[] | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const next = await getStorageStatus();
      setStatus(next);
      setStatusError(null);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Could not reach Cherry Brain\'s local data server.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshStatus();
    }, [refreshStatus]),
  );

  const statusLabel = statusError || status?.status === 'problem' ? 'Problem' : busy ? 'Saving' : 'Safe';
  const statusColor = statusLabel === 'Problem' ? colors.darkCherry : statusLabel === 'Saving' ? colors.mauve : colors.dustyRose;

  const withBusy = async (action: () => Promise<void>) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'That could not be completed. Nothing was changed.');
    } finally {
      setBusy(false);
      await refreshStatus();
    }
  };

  const handleBackupNow = () =>
    withBusy(async () => {
      await backUpNow('manual');
      setMessage('Backup created.');
    });

  const handleExportCopy = () =>
    withBusy(async () => {
      await exportCopyToFolder();
      await downloadCherryBrainBackup().catch(() => {});
      setMessage('A copy was saved to your Exports folder, and a downloadable copy was offered by your browser.');
    });

  const handleShowBackups = () =>
    withBusy(async () => {
      const list = await listBackups();
      setBackups(list);
      setShowBackups(true);
    });

  const handleRestore = (filename: string) =>
    withBusy(async () => {
      await restoreBackup(filename);
      setMessage(`Restored from ${filename}. Your current data was backed up first.`);
      setShowBackups(false);
    });

  return (
    <Card style={styles.card}>
      <Text style={typography.label}>STORAGE SAFETY</Text>

      <View style={styles.statusRow}>
        <Text style={typography.bodySoft}>Storage status:</Text>
        <Text style={[typography.body, { color: statusColor }]}>{statusLabel}</Text>
      </View>
      {statusError && <Text style={styles.problemText}>{statusError}</Text>}
      {status?.problemMessage && <Text style={styles.problemText}>{status.problemMessage}</Text>}

      <Text style={typography.caption}>Data location: {status?.dataPath ?? '—'}</Text>
      <Text style={typography.caption}>Last saved: {formatWhen(status?.lastSavedAt ?? null)}</Text>
      <Text style={typography.caption}>Last backup: {formatWhen(status?.lastBackupAt ?? null)}</Text>
      <Text style={typography.caption}>App location: {status?.appPath ?? '—'}</Text>

      <View style={styles.buttonGrid}>
        <SecondaryButton onPress={() => withBusy(() => openCherryBrainFolder('data'))} disabled={busy} style={styles.gridButton}>
          Open data folder
        </SecondaryButton>
        <SecondaryButton onPress={handleBackupNow} disabled={busy} style={styles.gridButton}>
          Back up now
        </SecondaryButton>
        <SecondaryButton onPress={handleShowBackups} disabled={busy} style={styles.gridButton}>
          Restore backup
        </SecondaryButton>
        <SecondaryButton onPress={handleExportCopy} disabled={busy} style={styles.gridButton}>
          Export copy
        </SecondaryButton>
        <SecondaryButton onPress={() => withBusy(() => openCherryBrainFolder('backups'))} disabled={busy} style={styles.gridButton}>
          Open backups folder
        </SecondaryButton>
        <SecondaryButton onPress={() => withBusy(() => openCherryBrainFolder('recovery'))} disabled={busy} style={styles.gridButton}>
          Open recovery folder
        </SecondaryButton>
        <SecondaryButton onPress={() => withBusy(() => openCherryBrainFolder('archive'))} disabled={busy} style={styles.gridButton}>
          Open archive folder
        </SecondaryButton>
      </View>

      {message && <Text style={typography.caption}>{message}</Text>}

      {showBackups && (
        <View style={styles.backupList}>
          <Text style={typography.label}>CHOOSE A BACKUP TO RESTORE</Text>
          <Text style={typography.caption}>Your current data is backed up automatically before any restore.</Text>
          {(backups ?? []).length === 0 && <Text style={typography.bodySoft}>No backups found yet.</Text>}
          {(backups ?? []).map((b) => (
            <View key={b.filename} style={styles.backupRow}>
              <Text style={[typography.bodySoft, styles.backupName]} numberOfLines={1}>
                {b.filename}
              </Text>
              <PrimaryButton onPress={() => handleRestore(b.filename)} disabled={busy} style={styles.restoreButton}>
                Restore
              </PrimaryButton>
            </View>
          ))}
          <GhostButton onPress={() => setShowBackups(false)}>Close</GhostButton>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  statusRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  problemText: { color: colors.darkCherry },
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  gridButton: { flexGrow: 1 },
  backupList: { gap: spacing.xs, marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: spacing.sm },
  backupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  backupName: { flex: 1 },
  restoreButton: { paddingHorizontal: spacing.md },
});
