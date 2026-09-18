import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { BackButton, Button, Field, Screen, showAlert, Subtitle, Title } from '../components/ui';
import { space } from '../theme';
import { api } from '../services/api';
import { useLanguage } from '../store/useLanguageStore';

export default function AIGeneratorScreen({ route, navigation }: any) {
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const targetClientId = route?.params?.targetClientId;

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showAlert(t('workouts.aiDescribeWorkoutTitle'), t('workouts.aiDescribeWorkoutMsg'));
      return;
    }

    if (!user?.id) {
      showAlert(t('common.error'), t('common.error'));
      return;
    }

    setIsGenerating(true);

    try {
      const generatedData = await api.post('/api/ai/generate-workout', { prompt });

      const newWorkout = await api.post('/api/workouts', {
        name: generatedData.name,
        description: generatedData.description || t('workouts.aiGeneratedDefault'),
        targetClientId: targetClientId || undefined,
      });

      if (generatedData.exercises && generatedData.exercises.length > 0) {
        const exercisePromises = generatedData.exercises.map((ex: any) =>
          api.post('/api/exercises', {
            name: ex.name,
            sets: ex.sets || 3,
            reps: ex.reps || 10,
            weight: ex.weight || null,
            workoutId: newWorkout.id,
          })
        );

        await Promise.all(exercisePromises);
      }

      showAlert(
        t('workouts.aiWorkoutCreatedTitle'),
        targetClientId ? t('workouts.aiWorkoutAssignedSuccess') : t('workouts.aiWorkoutReadySuccess')
      );
      setPrompt('');
      if (targetClientId) {
        navigation.goBack();
      } else {
        navigation.navigate('Dashboard');
      }
    } catch (error: any) {
      console.error('AI generation failed:', error);
      showAlert(t('workouts.aiFailedTitle'), error.message || t('workouts.aiFailedMsg'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <BackButton onPress={() => navigation.goBack()} />
          <Title>{t('workouts.aiWorkoutTitle')}</Title>
          <Subtitle>
            {targetClientId
              ? t('workouts.aiCoachSubtitle')
              : t('workouts.aiClientSubtitle')}
          </Subtitle>

          <Field
            label={t('workouts.aiPromptLabel')}
            placeholder={t('workouts.aiPromptPlaceholder')}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={prompt}
            onChangeText={setPrompt}
            editable={!isGenerating}
            style={{ minHeight: 140, textAlignVertical: 'top' }}
          />

          <Button
            title={isGenerating ? t('workouts.generatingWorkout') : t('workouts.generateWorkoutBtn')}
            onPress={handleGenerate}
            loading={isGenerating}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.lg, paddingBottom: 40 },
});
