import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { BackButton, Button, Field, Screen, showAlert, Subtitle, Title } from '../components/ui';
import { space } from '../theme';

export default function AIGeneratorScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showAlert('Describe your workout', 'Tell the AI what you want, then generate a plan.');
      return;
    }

    if (!user?.id) {
      showAlert('Error', 'User not found.');
      return;
    }

    setIsGenerating(true);

    try {
      const aiResponse = await fetch('http://192.168.1.80:3000/api/ai/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!aiResponse.ok) throw new Error('AI request failed');
      const generatedData = await aiResponse.json();

      const workoutResponse = await fetch('http://192.168.1.80:3000/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generatedData.name,
          description: generatedData.description || 'Generated with AI',
          userId: user.id,
        }),
      });

      if (!workoutResponse.ok) throw new Error('Failed to save workout');
      const newWorkout = await workoutResponse.json();

      if (generatedData.exercises && generatedData.exercises.length > 0) {
        const exercisePromises = generatedData.exercises.map((ex: any) =>
          fetch('http://192.168.1.80:3000/api/exercises', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: ex.name,
              sets: ex.sets || 3,
              reps: ex.reps || 10,
              weight: ex.weight || null,
              workoutId: newWorkout.id,
            }),
          })
        );

        await Promise.all(exercisePromises);
      }

      showAlert('Workout created', 'Your plan is ready on the home screen.');
      setPrompt('');
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('AI generation failed:', error);
      showAlert('Could not generate', 'Try a shorter or more specific request.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <BackButton onPress={() => navigation.goBack()} label="Home" />
          <Title>AI workout</Title>
          <Subtitle>
            Describe the session you want. Example: a 45-minute hypertrophy leg workout with 4 exercises.
          </Subtitle>

          <Field
            label="Your request"
            placeholder="Chest and triceps, strength focus..."
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={prompt}
            onChangeText={setPrompt}
            editable={!isGenerating}
            style={{ minHeight: 140, textAlignVertical: 'top' }}
          />

          <Button
            title={isGenerating ? 'Creating your plan...' : 'Generate workout'}
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
