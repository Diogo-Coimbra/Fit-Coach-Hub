import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { BackButton, Button, Field, Screen, showAlert, Title } from '../components/ui';
import { space } from '../theme';

export default function EditExerciseScreen({ route, navigation }: any) {
  const { exercise } = route.params;
  const [name, setName] = useState(exercise.name);
  const [sets, setSets] = useState(exercise.sets.toString());
  const [reps, setReps] = useState(exercise.reps.toString());
  const [weight, setWeight] = useState(exercise.weight ? exercise.weight.toString() : '');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim() || !sets.trim() || !reps.trim()) {
      showAlert('Missing fields', 'Name, sets, and reps are required.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`http://192.168.1.80:3000/api/exercises/${exercise.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight: weight ? parseFloat(weight) : null,
        }),
      });

      if (response.ok) {
        navigation.goBack();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Failed to update exercise:', error);
      showAlert('Error', 'Could not save your changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <BackButton onPress={() => navigation.goBack()} label="Cancel" />
          <Title>Edit exercise</Title>

          <Field label="Exercise" value={name} onChangeText={setName} placeholder="Bench press" />

          <View style={styles.row}>
            <View style={styles.half}>
              <Field label="Sets" value={sets} onChangeText={setSets} placeholder="4" keyboardType="numeric" />
            </View>
            <View style={styles.half}>
              <Field label="Reps" value={reps} onChangeText={setReps} placeholder="10" keyboardType="numeric" />
            </View>
          </View>

          <Field
            label="Weight (kg), optional"
            value={weight}
            onChangeText={setWeight}
            placeholder="60"
            keyboardType="numeric"
          />

          <Button title="Save changes" onPress={handleUpdate} loading={isSaving} />
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
