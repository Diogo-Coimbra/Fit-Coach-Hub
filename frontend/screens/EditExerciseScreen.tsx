import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackButton, Button, Field, Screen, showAlert, Title } from '../components/ui';
import { radius, space } from '../theme';
import { api } from '../services/api';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';

export default function EditExerciseScreen({ route, navigation }: any) {
  const { exercise } = route.params;
  const { colors, mode } = useTheme();
  const { t } = useLanguage();

  const [name, setName] = useState(exercise.name);
  const [isCardio, setIsCardio] = useState(Boolean(exercise.isCardio));
  const [durationMinutes, setDurationMinutes] = useState(exercise.durationMinutes ? exercise.durationMinutes.toString() : '20');
  const [intensity, setIntensity] = useState(exercise.intensity || 'Moderada');
  const [sets, setSets] = useState(exercise.sets ? exercise.sets.toString() : '3');
  const [reps, setReps] = useState(exercise.reps ? exercise.reps.toString() : '10');
  const [weight, setWeight] = useState(exercise.weight ? exercise.weight.toString() : '');
  const [restSeconds, setRestSeconds] = useState(exercise.restSeconds ? exercise.restSeconds.toString() : '90');
  const [notes, setNotes] = useState(exercise.notes || '');
  const [videoUrl, setVideoUrl] = useState(exercise.videoUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) {
      showAlert(t('workouts.requiredFieldsTitle'), t('workouts.nameRequiredAlert'));
      return;
    }
    if (!isCardio && (!sets.trim() || !reps.trim())) {
      showAlert(t('workouts.requiredFieldsTitle'), t('workouts.requiredFieldsAlert'));
      return;
    }

    setIsSaving(true);

    try {
      await api.put(`/api/exercises/${exercise.id}`, {
        name: name.trim(),
        isCardio,
        durationMinutes: isCardio ? (parseInt(durationMinutes) || 20) : null,
        intensity: isCardio ? (intensity.trim() || null) : null,
        sets: isCardio ? 1 : parseInt(sets),
        reps: isCardio ? 1 : parseInt(reps),
        weight: isCardio ? null : (weight ? parseFloat(weight.replace(',', '.')) : null),
        restSeconds: isCardio ? 0 : (parseInt(restSeconds) || 90),
        notes: notes.trim() || undefined,
        videoUrl: videoUrl.trim() || null,
      });

      navigation.goBack();
    } catch (error: any) {
      console.error('Falha ao atualizar exercício:', error);
      showAlert(t('common.error'), error.message || t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <BackButton onPress={() => navigation.goBack()} />
          <Title>{t('workouts.editExerciseTitle')}</Title>

          <Field
            label={t('workouts.exerciseName')}
            value={name}
            onChangeText={setName}
            placeholder={t('workouts.exerciseNamePlaceholder')}
          />

          {/* Seletor Tipo: Musculação vs Cardio */}
          <View style={styles.cardioToggleRow}>
            <TouchableOpacity
              style={[styles.typeBtn, !isCardio && { backgroundColor: colors.accent, borderColor: colors.accent }]}
              onPress={() => setIsCardio(false)}
            >
              <Ionicons name="barbell-outline" size={16} color={!isCardio ? '#FFFFFF' : colors.muted} />
              <Text style={[styles.typeBtnText, !isCardio && { color: '#FFFFFF', fontWeight: '700' }]}>
                Musculação
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, isCardio && { backgroundColor: colors.accent, borderColor: colors.accent }]}
              onPress={() => setIsCardio(true)}
            >
              <Ionicons name="heart-outline" size={16} color={isCardio ? '#FFFFFF' : colors.muted} />
              <Text style={[styles.typeBtnText, isCardio && { color: '#FFFFFF', fontWeight: '700' }]}>
                {t('cardio.isCardio')}
              </Text>
            </TouchableOpacity>
          </View>

          {isCardio ? (
            <View style={{ gap: 12, marginBottom: 12 }}>
              <Field
                label={t('cardio.durationMinutes')}
                placeholder={t('cardio.durationPlaceholder')}
                keyboardType="numeric"
                value={durationMinutes}
                onChangeText={setDurationMinutes}
              />
              <View style={styles.quickPillsRow}>
                {['15', '20', '30', '45', '60'].map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.quickPill,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      durationMinutes === mins && { backgroundColor: colors.accent + '20', borderColor: colors.accent },
                    ]}
                    onPress={() => setDurationMinutes(mins)}
                  >
                    <Text
                      style={[
                        styles.quickPillText,
                        { color: colors.muted },
                        durationMinutes === mins && { color: colors.accent, fontWeight: '700' },
                      ]}
                    >
                      {mins} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Field
                label={t('cardio.intensity')}
                placeholder={t('cardio.intensityPlaceholder')}
                value={intensity}
                onChangeText={setIntensity}
              />
              <View style={styles.quickPillsRow}>
                {[
                  t('cardio.intensityMod'),
                  t('cardio.intensityLow'),
                  t('cardio.intensityHigh'),
                  t('cardio.intensityHiit'),
                ].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.quickPill,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      intensity === level && { backgroundColor: colors.accent + '20', borderColor: colors.accent },
                    ]}
                    onPress={() => setIntensity(level)}
                  >
                    <Text
                      style={[
                        styles.quickPillText,
                        { color: colors.muted },
                        intensity === level && { color: colors.accent, fontWeight: '700' },
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <>
              <View style={styles.row}>
                <View style={styles.half}>
                  <Field
                    label={t('workouts.setsLabel')}
                    value={sets}
                    onChangeText={setSets}
                    placeholder="3"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.half}>
                  <Field
                    label={t('workouts.repsLabel')}
                    value={reps}
                    onChangeText={setReps}
                    placeholder="10"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Field
                    label={t('workouts.weightLabel')}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="60"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.half}>
                  <Field
                    label={t('workouts.restSecondsLabel')}
                    value={restSeconds}
                    onChangeText={setRestSeconds}
                    placeholder="90"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </>
          )}

          <Field
            label="Link de Vídeo / GIF Demonstrativo"
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="https://youtube.com/watch?v=... ou link direto .mp4 / .gif"
            autoCapitalize="none"
          />

          <Field
            label={t('workouts.notesLabel')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('workouts.notesPlaceholder')}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <Button title={t('common.save')} onPress={handleUpdate} loading={isSaving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.lg, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  cardioToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -4,
    marginBottom: 8,
  },
  quickPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
