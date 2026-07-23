import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { PrimaryButton } from '@/components/Buttons';
import { ScreenBackground } from '@/components/ScreenBackground';
import type { JournalEntry } from '@/models';
import { useAppData } from '@/state';
import { colors, radius, spacing, typography } from '@/theme';
import { draftRepository } from '@/storage';

export default function DropScreen() {
  const { createEntry } = useAppData();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(null);
  const [confirmation, setConfirmation] = useState(false);
  const draftLoaded = useRef(false);

  useEffect(() => {
    (async () => {
      const draft = await draftRepository.get();
      if (draft) {
        setTitle(draft.title);
        setText(draft.text);
        setIsImportant(draft.isImportant);
      }
      draftLoaded.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!draftLoaded.current) return;
    const handle = setTimeout(() => {
      if (text.trim() || title.trim()) {
        draftRepository.save({ title, text, isImportant, savedAt: new Date().toISOString() });
      } else {
        draftRepository.clear();
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [title, text, isImportant]);

  const now = new Date();

  const handleSave = async () => {
    if (!text.trim()) return;
    const entry = await createEntry({ title, text, isImportant });
    setSavedEntry(entry);
    setTitle('');
    setText('');
    setIsImportant(false);
    await draftRepository.clear();
    setConfirmation(true);
    setTimeout(() => setConfirmation(false), 2600);
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[typography.title, styles.heading]}>Drop Something In</Text>
          <Text style={typography.caption}>
            {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · {now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Give it a title (optional)"
            placeholderTextColor={colors.inkSoft}
            style={[typography.body, styles.titleInput]}
          />

          <Card style={styles.textCard}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="What's floating around in your brain?"
              placeholderTextColor={colors.inkSoft}
              multiline
              textAlignVertical="top"
              style={[typography.body, styles.textInput]}
            />
          </Card>

          <View style={styles.importantRow}>
            <Text style={typography.body}>This matters</Text>
            <Switch
              value={isImportant}
              onValueChange={setIsImportant}
              trackColor={{ true: colors.dustyRose, false: colors.hairline }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.laterRow}>
            <Chip label="🎙 Voice entry — coming soon" />
            <Chip label="🖼 Add image — coming soon" />
          </View>

          <PrimaryButton onPress={handleSave} disabled={!text.trim()} style={styles.saveButton}>
            Save
          </PrimaryButton>

          {confirmation && (
            <View style={styles.confirmationBanner}>
              <Ionicons name="checkmark-circle" size={16} color={colors.darkCherry} />
              <Text style={[typography.caption, { color: colors.darkCherry }]}>Saved. It's safe with me.</Text>
            </View>
          )}

          {savedEntry && savedEntry.suggestedSubjects.length > 0 && (
            <Card style={styles.suggestionsCard}>
              <Text style={typography.label}>QUICK TAGS, IF ANY FIT</Text>
              <View style={styles.tagRow}>
                {savedEntry.suggestedSubjects.map((s) => (
                  <QuickTag key={s.key} entryId={savedEntry.id} tagKey={s.key} label={s.label} />
                ))}
              </View>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

function QuickTag({ entryId, tagKey, label }: { entryId: string; tagKey: string; label: string }) {
  const { addUserTag, entries } = useAppData();
  const entry = entries.find((e) => e.id === entryId);
  const added = entry?.userTags.includes(tagKey) ?? false;
  return <Chip label={label} selected={added} onPress={() => addUserTag(entryId, tagKey)} />;
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  heading: {},
  titleInput: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingVertical: spacing.sm,
  },
  textCard: { minHeight: 220, padding: spacing.md },
  textInput: { flex: 1, minHeight: 190 },
  importantRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  laterRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  saveButton: {},
  confirmationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
  },
  suggestionsCard: { gap: spacing.sm },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
