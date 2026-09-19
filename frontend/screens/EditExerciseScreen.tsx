import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { BackButton, Button, Field, Screen, showAlert, Title } from '../components/ui';
import { space } from '../theme';
import { api } from '../services/api';
import { useLanguage } from '../store/useLanguageStore';

export default function EditExerciseScreen({ route, navigation }: any) {
  const { exercise } = route.params;
  const { t } = useLanguage();
  const [name, setName] = useState(exercise.name);
  const [sets, setSets] = useState(exercise.sets.toString());
  const [reps, setReps] = useState(exercise.reps.toString());
  const [weight, setWeight] = useState(exercise.weight ? exercise.weight.toString() : '');
  const [restSeconds, setRestSeconds] = useState(exercise.restSeconds ? exercise.restSeconds.toString() : '90');
  const [notes, setNotes] = useState(exercise.notes || '');
  const [videoUrl, setVideoUrl] = useState(exercise.videoUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim() || !sets.trim() || !reps.trim()) {
      showAlert(t('workouts.requiredFieldsTitle'), t('workouts.requiredFieldsAlert'));
      return;
    }

    setIsSaving(true);

    try {
      await api.put(`/api/exercises/${exercise.id}`, {
        name: name.trim(),
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight.replace(',', '.')) : null,
        restSeconds: parseInt(restSeconds) || 90,
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
});
