import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useAppData } from '@/state';
import { colors, spacing, typography } from '@/theme';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { entries, patterns, updateEntry, deleteEntry } = useAppData();
  const entry = entries.find((e) => e.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(entry?.title ?? '');
  const [text, setText] = useState(entry?.text ?? '');
  const [isImportant, setIsImportant] = useState(entry?.isImportant ?? false);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title ?? '');
      setText(entry.text);
      setIsImportant(entry.isImportant);
      setIsEditing(false);
    }
  }, [entry?.id]);

  if (!entry) {
    return (
      <ScreenBackground>
        <View style={styles.missing}>
          <Text style={typography.body}>This entry is gone.</Text>
        </View>
      </ScreenBackground>
    );
  }

  const connectedPatterns = patterns.filter((p) => entry.connectedPatternIds.includes(p.id));

  const resetDraft = () => {
    setTitle(entry.title ?? '');
    setText(entry.text);
    setIsImportant(entry.isImportant);
  };

  const handleSave = async () => {
    await updateEntry(entry.id, { title, text, isImportant });
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetDraft();
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete this entry?', 'This can\'t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(entry.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={typography.caption}>
            {new Date(entry.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </Text>

          {isEditing ? (
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title (optional)"
              placeholderTextColor={colors.inkSoft}
              style={[typography.title, styles.titleInput]}
            />
          ) : (
            <Text style={[typography.title, styles.readTitle]}>{entry.title || 'Untitled entry'}</Text>
          )}

          <Card style={styles.textCard}>
            {isEditing ? (
              <TextInput
                value={text}
                onChangeText={setText}
                multiline
                textAlignVertical="top"
                style={[typography.body, styles.textInput]}
              />
            ) : (
              <Text style={[typography.body, styles.readText]} selectable>{entry.text}</Text>
            )}
          </Card>

          <View style={styles.importantRow}>
            <Text style={typography.body}>This matters</Text>
            {isEditing ? (
              <Switch
                value={isImportant}
                onValueChange={setIsImportant}
                trackColor={{ true: colors.dustyRose, false: colors.hairline }}
                thumbColor={colors.white}
              />
            ) : (
              <Text style={typography.bodySoft}>{entry.isImportant ? 'Yes' : 'No'}</Text>
            )}
          </View>

          {(entry.suggestedSubjects.length > 0 || entry.userTags.length > 0) && (
            <View style={styles.tagRow}>
              {entry.suggestedSubjects.map((s) => (
                <Chip key={s.key} label={s.label} tone="cherry" />
              ))}
              {entry.userTags
                .filter((t) => !entry.suggestedSubjects.some((s) => s.key === t))
                .map((t) => <Chip key={t} label={t} />)}
            </View>
          )}

          {connectedPatterns.length > 0 && (
            <Card style={styles.patternsCard}>
              <Text style={typography.label}>CONNECTED PATTERNS</Text>
              {connectedPatterns.map((p) => (
                <Chip key={p.id} label={p.title} onPress={() => router.push(`/pattern/${p.id}`)} />
              ))}
            </Card>
          )}

          {isEditing ? (
            <>
              <View style={styles.buttonRow}>
                <PrimaryButton onPress={handleSave} style={styles.flexButton}>Save changes</PrimaryButton>
                <SecondaryButton onPress={handleCancel} style={styles.flexButton}>Cancel</SecondaryButton>
              </View>
              <SecondaryButton onPress={handleDelete}>Delete entry</SecondaryButton>
            </>
          ) : (
            <View style={styles.buttonRow}>
              <PrimaryButton onPress={() => setIsEditing(true)} style={styles.flexButton}>Edit entry</PrimaryButton>
              <SecondaryButton onPress={() => router.back()} style={styles.flexButton}>Back</SecondaryButton>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  missing: { padding: spacing.lg },
  titleInput: { borderBottomWidth: 1, borderBottomColor: colors.hairline, paddingVertical: spacing.sm },
  readTitle: { borderBottomWidth: 1, borderBottomColor: colors.hairline, paddingVertical: spacing.sm },
  textCard: { minHeight: 200, padding: spacing.md },
  textInput: { flex: 1, minHeight: 170 },
  readText: { lineHeight: 26 },
  importantRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  patternsCard: { gap: spacing.xs },
  buttonRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  flexButton: { flex: 1 },
});
