import React, { useState } from 'react';
import { StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { BackButton, Button, Field, Screen, Subtitle, Title } from '../components/ui';
import { space } from '../theme';

export default function CreateWorkoutScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateWorkout = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a workout name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://192.168.1.80:3000/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          userId: user?.id,
        }),
      });

      if (response.ok) {
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Could not save this workout.');
      }
    } catch (error) {
      console.error('Failed to create workout:', error);
      Alert.alert('Error', 'Could not reach the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <BackButton onPress={() => navigation.goBack()} />
          <Title>New workout</Title>
          <Subtitle>Give it a name. You can add exercises next.</Subtitle>

          <Field
            label="Name"
            placeholder="Push day, legs, full body..."
            value={name}
            onChangeText={setName}
          />
          <Field
            label="Description (optional)"
            placeholder="Focus, duration, notes..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />

          <Button title="Save workout" onPress={handleCreateWorkout} loading={isSubmitting} />
          <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.lg, paddingBottom: 40, paddingTop: 4 },
});
