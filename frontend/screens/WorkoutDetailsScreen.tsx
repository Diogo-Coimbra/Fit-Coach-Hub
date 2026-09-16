import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { BackButton, Button, Card, Screen, showAlert, Title } from '../components/ui';
import { colors, radius, space } from '../theme';

export default function WorkoutDetailsScreen({ route, navigation }: any) {
  const { workoutId } = route.params;
  const { user } = useAuthStore();

  const [workoutDetails, setWorkoutDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [exercisePRs, setExercisePRs] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'finished'>('idle');

  useEffect(() => {
    let interval: any;
    if (timerState === 'running' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timerState === 'running' && timeLeft === 0) {
      setTimerState('finished');
    }
    return () => clearInterval(interval);
  }, [timerState, timeLeft]);

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setTimerState('running');
  };

  const stopTimer = () => {
    setTimerState('idle');
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const fetchPRs = async (exercises: any[]) => {
    if (!user?.id || !exercises || exercises.length === 0) return;

    const prData: Record<string, number> = {};

    await Promise.all(
      exercises.map(async (ex) => {
        try {
          const response = await fetch(
            `http://192.168.1.80:3000/api/exercises/${user.id}/pr/${encodeURIComponent(ex.name)}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.pr > 0) prData[ex.name] = data.pr;
          }
        } catch (error) {
          console.error(`Failed to load PR for ${ex.name}:`, error);
        }
      })
    );

    setExercisePRs(prData);
  };

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://192.168.1.80:3000/api/workouts/detail/${workoutId}`);
      const data = await response.json();
      setWorkoutDetails(data);
      if (data?.exercises) await fetchPRs(data.exercises);
    } catch (error) {
      console.error('Failed to load workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [workoutId])
  );

  const executeDeleteExercise = async (exerciseId: string) => {
    try {
      const response = await fetch(`http://192.168.1.80:3000/api/exercises/${exerciseId}`, { method: 'DELETE' });
      if (response.ok) {
        setWorkoutDetails((prev: any) => ({
          ...prev,
          exercises: prev.exercises.filter((ex: any) => ex.id !== exerciseId),
        }));
      } else {
        showAlert('Error', 'Could not delete this exercise.');
      }
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };

  const executeDeleteWorkout = async () => {
    try {
      const response = await fetch(`http://192.168.1.80:3000/api/workouts/${workoutId}`, { method: 'DELETE' });
      if (response.ok) navigation.navigate('Dashboard');
      else showAlert('Error', 'Could not delete this workout.');
    } catch (error) {
      console.error('Failed to delete workout:', error);
    }
  };

  const handleDeleteExercise = (exerciseId: string, exerciseName: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove "${exerciseName}"?`)) executeDeleteExercise(exerciseId);
    } else {
      Alert.alert('Remove exercise', `Remove "${exerciseName}" from this workout?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => executeDeleteExercise(exerciseId) },
      ]);
    }
  };

  const handleDeleteWorkout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this workout and all of its exercises?')) executeDeleteWorkout();
    } else {
      Alert.alert('Delete workout', 'This will remove the workout and all of its exercises.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: executeDeleteWorkout },
      ]);
    }
  };

  const toggleExerciseCompletion = (exerciseId: string) => {
    setCompletedExercises((prev) =>
      prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId]
    );
  };

  const handleFinishWorkout = async () => {
    if (!user?.id || !workoutDetails?.id) return;

    setIsFinishing(true);
    try {
      const endTime = new Date();
      const diffMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.max(1, Math.floor(diffMs / 60000));

      const response = await fetch('http://192.168.1.80:3000/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, workoutId: workoutDetails.id, durationMinutes }),
      });

      if (response.ok) {
        showAlert('Session logged', `${durationMinutes} min recorded.`);
        navigation.navigate('Dashboard');
      } else {
        throw new Error('Failed to log workout');
      }
    } catch (error) {
      console.error('Failed to finish workout:', error);
      showAlert('Error', 'Could not log this session.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleCloneWorkout = async () => {
    setIsCloning(true);
    try {
      const response = await fetch(`http://192.168.1.80:3000/api/workouts/${workoutId}/clone`, { method: 'POST' });
      if (response.ok) {
        const clonedWorkout = await response.json();
        navigation.replace('WorkoutDetails', { workoutId: clonedWorkout.id });
      } else {
        throw new Error('Clone failed');
      }
    } catch (error) {
      console.error('Failed to duplicate workout:', error);
      showAlert('Error', 'Could not duplicate this workout.');
    } finally {
      setIsCloning(false);
    }
  };

  const renderExercise = ({ item }: any) => {
    const isCompleted = completedExercises.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.exerciseCard, isCompleted && styles.exerciseDone]}
        onPress={() => toggleExerciseCompletion(item.id)}
      >
        <View style={[styles.check, isCompleted && styles.checkOn]}>
          {isCompleted ? <Ionicons name="checkmark" size={14} color={colors.bg} /> : null}
        </View>
        <View style={styles.exerciseInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.exerciseName, isCompleted && styles.doneText]}>{item.name}</Text>
            {exercisePRs[item.name] ? (
              <View style={styles.prBadge}>
                <Text style={styles.prText}>PR {exercisePRs[item.name]} kg</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.exerciseDetails, isCompleted && styles.doneText]}>
            {item.sets} sets × {item.reps} reps{item.weight ? ` · ${item.weight} kg` : ''}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('EditExercise', { exercise: item })}>
            <Ionicons name="pencil-outline" size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeleteExercise(item.id, item.name)}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <View style={styles.pad}>
        <BackButton onPress={() => navigation.goBack()} label="Home" />
        {isLoading && !workoutDetails ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <>
            <Title>{workoutDetails?.name}</Title>
            {workoutDetails?.description ? (
              <Text style={styles.description}>{workoutDetails.description}</Text>
            ) : null}
          </>
        )}

        <Card style={[styles.timer, timerState === 'finished' && styles.timerDone]}>
          <Text style={styles.timerLabel}>Rest timer</Text>
          {timerState === 'finished' ? (
            <View>
              <Text style={styles.timerDoneText}>Rest is over. Next set.</Text>
              <Button title="Dismiss" variant="secondary" onPress={stopTimer} />
            </View>
          ) : (
            <View style={styles.timerRow}>
              <Text style={styles.timerDisplay}>{formatTime(timeLeft)}</Text>
              <View style={styles.timerBtns}>
                <TouchableOpacity style={styles.chip} onPress={() => startTimer(60)}>
                  <Text style={styles.chipText}>60s</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip} onPress={() => startTimer(90)}>
                  <Text style={styles.chipText}>90s</Text>
                </TouchableOpacity>
                {timerState === 'running' ? (
                  <TouchableOpacity style={styles.chipStop} onPress={stopTimer}>
                    <Text style={styles.chipStopText}>Stop</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
        </Card>
      </View>

      <FlatList
        data={workoutDetails?.exercises || []}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <Text style={styles.hint}>Tap a set to mark it done.</Text>
            <Button
              title="Add exercise"
              variant="secondary"
              icon="add"
              onPress={() => navigation.navigate('AddExercise', { workoutId: workoutDetails?.id })}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? null : <Text style={styles.empty}>No exercises yet. Add the first one.</Text>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Button title="Finish session" onPress={handleFinishWorkout} loading={isFinishing} />
            <Button title="Duplicate workout" variant="secondary" onPress={handleCloneWorkout} loading={isCloning} />
            <Button title="Delete workout" variant="danger" onPress={handleDeleteWorkout} />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg },
  description: { color: colors.muted, fontSize: 15, marginTop: 8, marginBottom: 16, lineHeight: 22 },
  timer: { marginTop: 16, marginBottom: 8 },
  timerDone: { borderColor: colors.accent },
  timerLabel: { color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timerDisplay: { color: colors.text, fontSize: 32, fontWeight: '700', letterSpacing: -0.8, width: 90 },
  timerBtns: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 },
  timerDoneText: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  chip: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  chipText: { color: colors.text, fontWeight: '600' },
  chipStop: { backgroundColor: colors.dangerDim, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.sm },
  chipStopText: { color: colors.danger, fontWeight: '600' },
  list: { paddingHorizontal: space.lg, paddingBottom: 32 },
  listHeader: { marginTop: 12, marginBottom: 12, gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  hint: { color: colors.muted, fontSize: 13, marginBottom: 4 },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseDone: { opacity: 0.55 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  exerciseInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  prBadge: {
    backgroundColor: colors.accentDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  prText: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  exerciseName: { fontSize: 16, fontWeight: '600', color: colors.text },
  exerciseDetails: { fontSize: 13, color: colors.muted, marginTop: 4 },
  doneText: { textDecorationLine: 'line-through', color: colors.muted },
  actions: { flexDirection: 'row' },
  iconBtn: { padding: 6 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 20, lineHeight: 22 },
  footer: { marginTop: 8, gap: 10 },
});
