import React, { useState } from 'react';
import { StyleSheet, View, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { BackButton, Button, Field, Screen, Title } from '../components/ui';
import { space } from '../theme';

export default function AddExerciseScreen({ route, navigation }: any) {
  const { workoutId } = route.params;
  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddExercise = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter an exercise name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://192.168.1.80:3000/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sets: parseInt(sets) || 3,
          reps: parseInt(reps) || 10,
          weight: weight ? parseFloat(weight) : null,
          workoutId,
        }),
      });

      if (response.ok) {
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Could not save this exercise.');
      }
    } catch (error) {
      console.error('Failed to add exercise:', error);
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
          <Title>Add exercise</Title>

          <Field label="Exercise" placeholder="Bench press" value={name} onChangeText={setName} />

          <View style={styles.row}>
            <View style={styles.half}>
              <Field label="Sets" keyboardType="numeric" value={sets} onChangeText={setSets} />
            </View>
            <View style={styles.half}>
              <Field label="Reps" keyboardType="numeric" value={reps} onChangeText={setReps} />
            </View>
          </View>

          <Field
            label="Weight (kg), optional"
            placeholder="60"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />

          <Button title="Add to workout" onPress={handleAddExercise} loading={isSubmitting} />
          <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
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
