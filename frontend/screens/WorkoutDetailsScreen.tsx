import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Vibration,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { BackButton, Button, Card, Screen, showAlert, Title } from '../components/ui';
import { ColorScheme, radius, space } from '../theme';
import { api } from '../services/api';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';
import { SubstituteExerciseModal } from '../components/SubstituteExerciseModal';
import { ExerciseGuideModal } from '../components/ExerciseGuideModal';
import WorkoutFeedbackModal from '../components/WorkoutFeedbackModal';

export type SetType = 'NORMAL' | 'WARMUP' | 'DROPSET' | 'FAILURE';

interface ExerciseSetLogState {
  setNumber: number;
  reps: string;
  weight: string;
  completed: boolean;
  setType: SetType;
}

interface PreviousSetData {
  setNumber: number;
  weight: number | null;
  reps: number;
  setType: string;
}

interface PreviousPerformanceData {
  date: string;
  sets: PreviousSetData[];
}

export default function WorkoutDetailsScreen({ route, navigation }: any) {
  const { workoutId } = route.params;
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [workoutDetails, setWorkoutDetails] = useState<any>(null);
  const isAssignedByCoach = !!workoutDetails?.assignedById || !!workoutDetails?.assignedBy;
  const isCoach = user?.role === 'COACH';
  const canEditStructure = isCoach || !isAssignedByCoach;

  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [exercisePRs, setExercisePRs] = useState<Record<string, number>>({});
  const [previousPerformance, setPreviousPerformance] = useState<Record<string, PreviousPerformanceData>>({});
  
  // Estrutura de séries executadas por exercício: { [exerciseId]: ExerciseSetLogState[] }
  const [exerciseSets, setExerciseSets] = useState<Record<string, ExerciseSetLogState[]>>({});
  const [workoutNotes, setWorkoutNotes] = useState('');

  // Modais de Substituição de Exercício e Guia de Execução Técnica
  const [substituteModalVisible, setSubstituteModalVisible] = useState(false);
  const [substituteTarget, setSubstituteTarget] = useState<any>(null);
  const [guideModalVisible, setGuideModalVisible] = useState(false);
  const [guideTarget, setGuideTarget] = useState<any>(null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [cardioLogs, setCardioLogs] = useState<Record<string, { durationMinutes: string; intensity: string; completed: boolean }>>({});

  const getCardioState = (item: any) => {
    return cardioLogs[item.id] || {
      durationMinutes: item.durationMinutes ? String(item.durationMinutes) : '20',
      intensity: item.intensity || 'Moderada',
      completed: false,
    };
  };

  const updateCardioState = (exerciseId: string, updates: Partial<{ durationMinutes: string; intensity: string; completed: boolean }>) => {
    setCardioLogs((prev) => ({
      ...prev,
      [exerciseId]: {
        ...(prev[exerciseId] || {}),
        ...updates,
      },
    }));
  };

  const handleSubstitute = async (newExerciseName: string) => {
    if (!substituteTarget?.id) return;
    await api.put(`/api/exercises/${substituteTarget.id}`, {
      name: newExerciseName,
    });
    setWorkoutDetails((prev: any) => ({
      ...prev,
      exercises: prev.exercises.map((ex: any) =>
        ex.id === substituteTarget.id ? { ...ex, name: newExerciseName } : ex
      ),
    }));
  };

  const handleSaveVideoUrl = async (exerciseId: string, url: string) => {
    await api.put(`/api/exercises/${exerciseId}`, {
      videoUrl: url,
    });
    setWorkoutDetails((prev: any) => ({
      ...prev,
      exercises: prev.exercises.map((ex: any) =>
        ex.id === exerciseId ? { ...ex, videoUrl: url } : ex
      ),
    }));
  };

  // Temporizador de descanso
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'finished'>('idle');

  useEffect(() => {
    let interval: any;
    if (timerState === 'running' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timerState === 'running' && timeLeft === 0) {
      setTimerState('finished');
      // Vibração tátil ao terminar o descanso
      if (Platform.OS !== 'web') {
        try {
          Vibration.vibrate([0, 500, 200, 500]);
        } catch (vErr) {
          console.warn('Vibração não suportada:', vErr);
        }
      }
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
          const data = await api.get(`/api/exercises/${user.id}/pr/${encodeURIComponent(ex.name)}`);
          if (data && data.pr > 0) prData[ex.name] = data.pr;
        } catch (error) {
          console.error(`Falha ao obter recorde de ${ex.name}:`, error);
        }
      })
    );
    setExercisePRs(prData);
  };

  const fetchPreviousPerformance = async (exercises: any[]) => {
    if (!user?.id || !exercises || exercises.length === 0) return;
    try {
      const exerciseNames = exercises.map((e) => e.name);
      const perfData = await api.post('/api/exercises/previous-performance', { exerciseNames });
      if (perfData && typeof perfData === 'object') {
        setPreviousPerformance(perfData);
      }
    } catch (error) {
      console.error('Falha ao obter desempenho anterior:', error);
    }
  };

  const initExerciseSets = (exercises: any[], prevData?: Record<string, PreviousPerformanceData>) => {
    setExerciseSets((prev) => {
      const updated = { ...prev };
      exercises.forEach((ex) => {
        if (!updated[ex.id]) {
          const totalSets = Math.max(1, ex.sets || 3);
          const defaultReps = String(ex.reps || 10);
          const defaultWeight = ex.weight !== null && ex.weight !== undefined ? String(ex.weight) : '';
          
          const pastSets = prevData?.[ex.name]?.sets || [];

          updated[ex.id] = Array.from({ length: totalSets }, (_, idx) => {
            const past = pastSets[idx];
            return {
              setNumber: idx + 1,
              reps: past?.reps ? String(past.reps) : defaultReps,
              weight: past?.weight !== null && past?.weight !== undefined ? String(past.weight) : defaultWeight,
              completed: false,
              setType: (past?.setType as SetType) || 'NORMAL',
            };
          });
        }
      });
      return updated;
    });
  };

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const data = await api.get(`/api/workouts/detail/${workoutId}`);
      setWorkoutDetails(data);

      if (data?.exercises && data.exercises.length > 0) {
        // Obter PRs e desempenho anterior em paralelo
        const exerciseNames = data.exercises.map((e: any) => e.name);
        let pastPerfMap: Record<string, PreviousPerformanceData> = {};
        
        try {
          const pastData = await api.post('/api/exercises/previous-performance', { exerciseNames });
          if (pastData) {
            pastPerfMap = pastData;
            setPreviousPerformance(pastData);
          }
        } catch (pErr) {
          console.warn('Histórico prévio indisponível:', pErr);
        }

        initExerciseSets(data.exercises, pastPerfMap);
        await fetchPRs(data.exercises);
      }
    } catch (error) {
      console.error('Falha ao carregar treino:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [workoutId])
  );

  const toggleSetCompletion = (exerciseId: string, setIndex: number, restSeconds?: number) => {
    setExerciseSets((prev) => {
      const list = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (!list[setIndex]) return prev;

      const willComplete = !list[setIndex].completed;
      list[setIndex] = {
        ...list[setIndex],
        completed: willComplete,
      };

      // Dispara o descanso recomendado se a série for marcada como concluída
      if (willComplete) {
        startTimer(restSeconds || 90);
      }

      return {
        ...prev,
        [exerciseId]: list,
      };
    });
  };

  const updateSetValue = (
    exerciseId: string,
    setIndex: number,
    field: 'weight' | 'reps',
    val: string
  ) => {
    setExerciseSets((prev) => {
      const list = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (!list[setIndex]) return prev;

      list[setIndex] = {
        ...list[setIndex],
        [field]: val,
      };

      return {
        ...prev,
        [exerciseId]: list,
      };
    });
  };

  // Ciclar entre Tipos de Série: NORMAL -> WARMUP (W) -> DROPSET (D) -> FAILURE (F) -> NORMAL
  const cycleSetType = (exerciseId: string, setIndex: number) => {
    setExerciseSets((prev) => {
      const list = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (!list[setIndex]) return prev;

      const types: SetType[] = ['NORMAL', 'WARMUP', 'DROPSET', 'FAILURE'];
      const currentIdx = types.indexOf(list[setIndex].setType || 'NORMAL');
      const nextType = types[(currentIdx + 1) % types.length];

      list[setIndex] = {
        ...list[setIndex],
        setType: nextType,
      };

      return {
        ...prev,
        [exerciseId]: list,
      };
    });
  };

  // Ajuste rápido de Peso com Stepper (+/-)
  const adjustWeight = (exerciseId: string, setIndex: number, delta: number) => {
    setExerciseSets((prev) => {
      const list = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (!list[setIndex]) return prev;

      const currentVal = parseFloat(list[setIndex].weight.replace(',', '.')) || 0;
      const newVal = Math.max(0, Math.round((currentVal + delta) * 10) / 10);

      list[setIndex] = {
        ...list[setIndex],
        weight: newVal === 0 ? '' : String(newVal),
      };

      return { ...prev, [exerciseId]: list };
    });
  };

  // Ajuste rápido de Repetições com Stepper (+/-)
  const adjustReps = (exerciseId: string, setIndex: number, delta: number) => {
    setExerciseSets((prev) => {
      const list = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (!list[setIndex]) return prev;

      const currentVal = parseInt(list[setIndex].reps, 10) || 0;
      const newVal = Math.max(0, currentVal + delta);

      list[setIndex] = {
        ...list[setIndex],
        reps: String(newVal),
      };

      return { ...prev, [exerciseId]: list };
    });
  };

  // Adicionar série extra no exercício
  const addSetToExercise = (exerciseId: string, defaultWeight?: number, defaultReps?: number) => {
    setExerciseSets((prev) => {
      const list = prev[exerciseId] ? [...prev[exerciseId]] : [];
      const nextNum = list.length + 1;
      const lastSet = list[list.length - 1];

      list.push({
        setNumber: nextNum,
        weight: lastSet ? lastSet.weight : (defaultWeight ? String(defaultWeight) : ''),
        reps: lastSet ? lastSet.reps : String(defaultReps || 10),
        completed: false,
        setType: 'NORMAL',
      });

      return { ...prev, [exerciseId]: list };
    });
  };

  // Remover última série do exercício
  const removeLastSetFromExercise = (exerciseId: string) => {
    setExerciseSets((prev) => {
      const list = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (list.length <= 1) return prev;
      list.pop();
      return { ...prev, [exerciseId]: list };
    });
  };

  const handleFinishWorkout = () => {
    setFeedbackModalVisible(true);
  };

  const submitWorkoutWithFeedback = async (feedback: {
    rpe: number;
    painJoints: string;
    painLevel: number;
    notes: string;
  }) => {
    if (!user?.id || !workoutDetails?.id) return;

    setIsFinishing(true);
    try {
      const endTime = new Date();
      const diffMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.max(1, Math.floor(diffMs / 60000));

      // Mapear todas as séries para envio ao backend incluindo setType
      const flatSets: any[] = [];
      (workoutDetails.exercises || []).forEach((ex: any) => {
        if (ex.isCardio) {
          const cState = cardioLogs[ex.id] || {
            durationMinutes: ex.durationMinutes ? String(ex.durationMinutes) : '20',
            intensity: ex.intensity || 'Moderada',
            completed: true,
          };
          flatSets.push({
            exerciseId: ex.id,
            exerciseName: ex.name,
            setNumber: 1,
            reps: 1,
            weight: 0,
            completed: cState.completed !== false,
            setType: 'NORMAL',
            isCardio: true,
            durationMinutes: parseInt(cState.durationMinutes) || ex.durationMinutes || 20,
            intensity: cState.intensity || ex.intensity || 'Moderada',
          });
        } else {
          const sets = exerciseSets[ex.id] || [];
          sets.forEach((s) => {
            flatSets.push({
              exerciseId: ex.id,
              exerciseName: ex.name,
              setNumber: s.setNumber,
              reps: Number(s.reps) || 0,
              weight: s.weight ? Number(s.weight.replace(',', '.')) : 0,
              completed: s.completed,
              setType: s.setType || 'NORMAL',
            });
          });
        }
      });

      const combinedNotes = [workoutNotes.trim(), feedback.notes.trim()].filter(Boolean).join(' | ');

      await api.post('/api/logs', {
        workoutId: workoutDetails.id,
        durationMinutes,
        notes: combinedNotes || undefined,
        rpe: feedback.rpe,
        painJoints: feedback.painJoints,
        painLevel: feedback.painLevel,
        sets: flatSets,
      });

      setFeedbackModalVisible(false);
      showAlert(t('workouts.workoutFinishedTitle'), t('workouts.workoutFinishedMsg', { duration: durationMinutes }));
      navigation.navigate('Dashboard');
    } catch (error: any) {
      console.error('Falha ao concluir treino:', error);
      showAlert(t('common.error'), error.message || t('common.error'));
    } finally {
      setIsFinishing(false);
    }
  };

  const handleCloneWorkout = async () => {
    setIsCloning(true);
    try {
      const cloned = await api.post(`/api/workouts/${workoutId}/clone`);
      navigation.replace('WorkoutDetails', { workoutId: cloned.id });
    } catch (error: any) {
      console.error('Falha ao duplicar plano:', error);
      showAlert(t('common.error'), error.message || t('common.error'));
    } finally {
      setIsCloning(false);
    }
  };

  const executeDeleteExercise = async (exerciseId: string) => {
    try {
      await api.delete(`/api/exercises/${exerciseId}`);
      setWorkoutDetails((prev: any) => ({
        ...prev,
        exercises: prev.exercises.filter((ex: any) => ex.id !== exerciseId),
      }));
    } catch (error: any) {
      console.error('Falha ao remover exercício:', error);
      showAlert(t('common.error'), error.message || t('common.error'));
    }
  };

  const executeDeleteWorkout = async () => {
    try {
      await api.delete(`/api/workouts/${workoutId}`);
      navigation.navigate('Dashboard');
    } catch (error: any) {
      console.error('Falha ao apagar plano:', error);
      showAlert(t('common.error'), error.message || t('common.error'));
    }
  };

  const handleDeleteExercise = (exerciseId: string, exerciseName: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('workouts.deleteExerciseConfirm', { name: exerciseName }))) executeDeleteExercise(exerciseId);
    } else {
      Alert.alert(t('workouts.removeExerciseTitle'), t('workouts.deleteExerciseConfirm', { name: exerciseName }), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.remove'), style: 'destructive', onPress: () => executeDeleteExercise(exerciseId) },
      ]);
    }
  };

  const handleDeleteWorkout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('workouts.deleteWorkoutConfirm'))) executeDeleteWorkout();
    } else {
      Alert.alert(t('workouts.deleteWorkout'), t('workouts.deleteWorkoutConfirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: executeDeleteWorkout },
      ]);
    }
  };

  // Renderizar o badge estilizado de Tipo de Série (1, W, D, F)
  const renderSetTypeBadge = (setType: SetType, setNumber: number) => {
    let badgeStyle = styles.setBadgeNormal;
    let label = String(setNumber);

    if (setType === 'WARMUP') {
      badgeStyle = styles.setBadgeWarmup;
      label = 'W';
    } else if (setType === 'DROPSET') {
      badgeStyle = styles.setBadgeDropset;
      label = 'D';
    } else if (setType === 'FAILURE') {
      badgeStyle = styles.setBadgeFailure;
      label = 'F';
    }

    return (
      <View style={[styles.setBadge, badgeStyle]}>
        <Text style={styles.setBadgeText}>{label}</Text>
      </View>
    );
  };

  const renderExercise = ({ item }: any) => {
    const sets = exerciseSets[item.id] || [];
    const pr = exercisePRs[item.name];
    const pastPerf = previousPerformance[item.name];

    return (
      <Card style={styles.exerciseBlock}>
        <View style={styles.exerciseHeader}>
          <View style={styles.headerInfo}>
            <Text style={styles.exerciseTitle}>{item.name}</Text>
            {item.isCardio ? (
              <View style={[styles.prBadge, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Ionicons name="heart-outline" size={12} color="#EF4444" style={{ marginRight: 3 }} />
                <Text style={[styles.prBadgeText, { color: '#EF4444' }]}>
                  {item.durationMinutes || 20} min • {item.intensity || 'Moderada'}
                </Text>
              </View>
            ) : pr ? (
              <View style={styles.prBadge}>
                <Ionicons name="trophy-outline" size={12} color={colors.accent} style={{ marginRight: 3 }} />
                <Text style={styles.prBadgeText}>{t('workouts.record')}: {pr} kg</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerIconBtn, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}
              onPress={() => {
                setGuideTarget(item);
                setGuideModalVisible(true);
              }}
            >
              <Ionicons name="play-circle-outline" size={18} color="#3B82F6" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerIconBtn, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}
              onPress={() => {
                setSubstituteTarget(item);
                setSubstituteModalVisible(true);
              }}
            >
              <Ionicons name="swap-horizontal-outline" size={18} color="#10B981" />
            </TouchableOpacity>

            {canEditStructure && (
              <>
                <TouchableOpacity
                  style={styles.headerIconBtn}
                  onPress={() => navigation.navigate('EditExercise', { exercise: item })}
                >
                  <Ionicons name="pencil-outline" size={17} color={colors.muted} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerIconBtn}
                  onPress={() => handleDeleteExercise(item.id, item.name)}
                >
                  <Ionicons name="trash-outline" size={17} color={colors.danger} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {item.notes ? (
          <Text style={styles.exerciseNotes}>{item.notes}</Text>
        ) : null}

        {item.isCardio ? (
          <View style={styles.cardioBox}>
            <View style={styles.cardioPrescribedRow}>
              <Ionicons name="heart" size={16} color="#EF4444" />
              <Text style={[styles.cardioPrescribedText, { color: colors.text }]}>
                {t('cardio.prescribedBadge')}: {item.durationMinutes || 20} {t('cardio.minutesUnit')} • {item.intensity || 'Moderada'}
              </Text>
            </View>

            <View style={styles.cardioInputRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardioInputLabel, { color: colors.muted }]}>{t('cardio.completedDuration')}</Text>
                <TextInput
                  style={[styles.cardioInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  keyboardType="numeric"
                  value={getCardioState(item).durationMinutes}
                  onChangeText={(val) => updateCardioState(item.id, { durationMinutes: val })}
                  placeholder={String(item.durationMinutes || 20)}
                  placeholderTextColor={colors.muted}
                />
              </View>

              <View style={{ flex: 1.5, marginLeft: 10 }}>
                <Text style={[styles.cardioInputLabel, { color: colors.muted }]}>{t('cardio.perceivedIntensity')}</Text>
                <TextInput
                  style={[styles.cardioInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={getCardioState(item).intensity}
                  onChangeText={(val) => updateCardioState(item.id, { intensity: val })}
                  placeholder={item.intensity || 'Moderada'}
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.cardioCompleteBtn,
                getCardioState(item).completed
                  ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                  : { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => updateCardioState(item.id, { completed: !getCardioState(item).completed })}
              activeOpacity={0.8}
            >
              <Ionicons
                name={getCardioState(item).completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={getCardioState(item).completed ? '#FFFFFF' : colors.muted}
              />
              <Text
                style={[
                  styles.cardioCompleteBtnText,
                  { color: getCardioState(item).completed ? '#FFFFFF' : colors.text },
                ]}
              >
                {getCardioState(item).completed ? t('cardio.completedBadge') : t('cardio.completedBtn')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cabeçalho da Tabela com Desempenho Anterior */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colHeader, { width: 38, textAlign: 'center' }]}>{t('workouts.set')}</Text>
              <Text style={[styles.colHeader, { width: 66, textAlign: 'center' }]}>{t('workouts.previous')}</Text>
              <Text style={[styles.colHeader, { flex: 1.1, textAlign: 'center' }]}>{t('workouts.weight')} (kg)</Text>
              <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>{t('workouts.reps')}</Text>
              <Text style={[styles.colHeader, { width: 38, textAlign: 'center' }]}>{t('common.status')}</Text>
            </View>

            {/* Linhas de Séries Interativas */}
            {sets.map((s, idx) => {
              const pastSet = pastPerf?.sets?.[idx];
              const pastSetDisplay = pastSet
                ? `${pastSet.weight ?? 0}kg × ${pastSet.reps}`
                : '-';

              return (
                <View key={`set-${item.id}-${idx}`} style={[styles.setRow, s.completed && styles.setRowCompleted]}>
                  {/* Botão Cíclico de Tipo de Série (1, W, D, F) */}
                  <TouchableOpacity
                    style={styles.setTypeBtn}
                    onPress={() => cycleSetType(item.id, idx)}
                  >
                    {renderSetTypeBadge(s.setType, s.setNumber)}
                  </TouchableOpacity>

                  {/* Registo Anterior */}
                  <View style={styles.previousCell}>
                    <Text style={styles.previousText} numberOfLines={1}>
                      {pastSetDisplay}
                    </Text>
                  </View>

                  {/* Stepper e Input de Carga (kg) */}
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => adjustWeight(item.id, idx, -2.5)}
                    >
                      <Text style={styles.stepperBtnText}>-</Text>
                    </TouchableOpacity>

                    <TextInput
                      style={styles.stepperInput}
                      keyboardType="numeric"
                      value={s.weight}
                      placeholder={String(pastSet?.weight ?? item.weight ?? 0)}
                      placeholderTextColor={colors.muted}
                      onChangeText={(val) => updateSetValue(item.id, idx, 'weight', val)}
                    />

                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => adjustWeight(item.id, idx, 2.5)}
                    >
                      <Text style={styles.stepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Stepper e Input de Repetições */}
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => adjustReps(item.id, idx, -1)}
                    >
                      <Text style={styles.stepperBtnText}>-</Text>
                    </TouchableOpacity>

                    <TextInput
                      style={styles.stepperInput}
                      keyboardType="numeric"
                      value={s.reps}
                      placeholder={String(pastSet?.reps ?? item.reps ?? 10)}
                      placeholderTextColor={colors.muted}
                      onChangeText={(val) => updateSetValue(item.id, idx, 'reps', val)}
                    />

                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => adjustReps(item.id, idx, 1)}
                    >
                      <Text style={styles.stepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Botão de Conclusão da Série */}
                  <TouchableOpacity
                    style={[styles.checkBtn, s.completed && styles.checkBtnActive]}
                    onPress={() => toggleSetCompletion(item.id, idx, item.restSeconds)}
                  >
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={s.completed ? colors.bg : colors.muted}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Ações Rápidas: Adicionar Série Extra ou Remover Última Série */}
            <View style={styles.setActionsRow}>
              <TouchableOpacity
                style={styles.addSetInlineBtn}
                onPress={() => addSetToExercise(item.id, item.weight, item.reps)}
              >
                <Ionicons name="add" size={14} color={colors.accent} />
                <Text style={styles.addSetInlineText}>+ {t('workouts.set')}</Text>
              </TouchableOpacity>

              {sets.length > 1 && (
                <TouchableOpacity
                  style={styles.removeSetInlineBtn}
                  onPress={() => removeLastSetFromExercise(item.id)}
                >
                  <Ionicons name="trash-outline" size={13} color={colors.danger} />
                  <Text style={styles.removeSetInlineText}>{t('common.remove')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </Card>
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topSection}>
          <BackButton onPress={() => navigation.goBack()} />
          
          {isLoading && !workoutDetails ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.workoutMeta}>
              {workoutDetails?.assignedBy ? (
                <View style={styles.prescribedBadge}>
                  <Ionicons name="shield-checkmark" size={13} color={colors.accent} />
                  <Text style={styles.prescribedBadgeText}>
                    {t('checkin.prescribedByCoach')}: {workoutDetails.assignedBy.name}
                  </Text>
                </View>
              ) : null}
              <Title>{workoutDetails?.name}</Title>
              {workoutDetails?.description ? (
                <Text style={styles.description}>{workoutDetails.description}</Text>
              ) : null}
            </View>
          )}

          {/* Card do Temporizador de Descanso com Vibração */}
          <Card style={[styles.timerCard, timerState === 'finished' && styles.timerCardFinished]}>
            <View style={styles.timerTop}>
              <View style={styles.timerLabelRow}>
                <Ionicons name="timer-outline" size={15} color={timerState === 'finished' ? colors.accent : colors.muted} />
                <Text style={[styles.timerLabel, timerState === 'finished' && { color: colors.accent }]}>
                  {timerState === 'finished' ? t('workouts.timerVibrated') : t('workouts.restBetweenSets')}
                </Text>
              </View>
              {timerState === 'running' ? (
                <TouchableOpacity onPress={stopTimer}>
                  <Text style={styles.timerStopText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {timerState === 'finished' ? (
              <View style={styles.timerFinishedBox}>
                <Text style={styles.timerFinishedText}>{t('workouts.restCompleted')}</Text>
                <TouchableOpacity style={styles.dismissBtn} onPress={stopTimer}>
                  <Text style={styles.dismissBtnText}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.timerControlRow}>
                <Text style={styles.timerDigit}>{formatTime(timeLeft)}</Text>
                <View style={styles.quickChips}>
                  <TouchableOpacity style={styles.chip} onPress={() => startTimer(45)}>
                    <Text style={styles.chipText}>45s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chip} onPress={() => startTimer(60)}>
                    <Text style={styles.chipText}>60s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chip} onPress={() => startTimer(90)}>
                    <Text style={styles.chipText}>90s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chip} onPress={() => startTimer(120)}>
                    <Text style={styles.chipText}>120s</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card>
        </View>

        <FlatList
          data={workoutDetails?.exercises || []}
          keyExtractor={(item) => item.id}
          renderItem={renderExercise}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeading}>{t('workouts.prescribedExercises')}</Text>
              {canEditStructure && (
                <Button
                  title={t('workouts.addExercise')}
                  variant="secondary"
                  icon="add"
                  onPress={() => navigation.navigate('AddExercise', { workoutId: workoutDetails?.id })}
                />
              )}
            </View>
          }
          ListEmptyComponent={
            isLoading ? null : (
              <Text style={styles.emptyText}>{t('workouts.noExercises')}</Text>
            )
          }
          ListFooterComponent={
            <View style={styles.footerContainer}>
              <Card style={styles.notesCard}>
                <Text style={styles.notesLabel}>{t('workouts.sessionNotes')}</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder={t('workouts.sessionNotesPlaceholder')}
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={3}
                  value={workoutNotes}
                  onChangeText={setWorkoutNotes}
                />
              </Card>

              <Button
                title={t('workouts.finishWorkout')}
                onPress={handleFinishWorkout}
                loading={isFinishing}
              />
              <Button
                title={t('workouts.cloneWorkout')}
                variant="secondary"
                onPress={handleCloneWorkout}
                loading={isCloning}
              />
              {canEditStructure && (
                <Button
                  title={t('common.delete')}
                  variant="danger"
                  onPress={handleDeleteWorkout}
                />
              )}
            </View>
          }
        />
      </KeyboardAvoidingView>

      <SubstituteExerciseModal
        visible={substituteModalVisible}
        currentExerciseName={substituteTarget?.name || ''}
        onClose={() => setSubstituteModalVisible(false)}
        onSubstitute={handleSubstitute}
      />

      <ExerciseGuideModal
        visible={guideModalVisible}
        exercise={guideTarget}
        onClose={() => setGuideModalVisible(false)}
        onSaveVideoUrl={handleSaveVideoUrl}
        isCoach={user?.role === 'COACH'}
      />

      <WorkoutFeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        onSubmit={submitWorkoutWithFeedback}
        isLoading={isFinishing}
      />
    </Screen>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  topSection: {
    paddingHorizontal: space.lg,
  },
  workoutMeta: {
    marginVertical: 4,
  },
  prescribedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  prescribedBadgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  timerCard: {
    marginTop: 12,
    marginBottom: 6,
    padding: 12,
  },
  timerCardFinished: {
    borderColor: colors.accent,
    backgroundColor: colors.surface2,
  },
  timerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerStopText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  timerControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerDigit: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  quickChips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  timerFinishedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  timerFinishedText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  dismissBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  dismissBtnText: {
    color: colors.bg,
    fontWeight: '700',
    fontSize: 13,
  },
  listContainer: {
    paddingHorizontal: space.lg,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginTop: 14,
    marginBottom: 12,
    gap: 10,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  exerciseBlock: {
    marginBottom: 12,
    padding: 14,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  prBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    padding: 6,
  },
  exerciseNotes: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
    gap: 6,
  },
  colHeader: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 6,
  },
  setRowCompleted: {
    opacity: 0.55,
  },
  setTypeBtn: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setBadgeNormal: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  setBadgeWarmup: {
    backgroundColor: '#F59E0B22',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  setBadgeDropset: {
    backgroundColor: '#8B5CF622',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  setBadgeFailure: {
    backgroundColor: '#EF444422',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  setBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  previousCell: {
    width: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previousText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '500',
  },
  stepperContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
    height: 34,
  },
  stepperBtn: {
    width: 24,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stepperBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  stepperInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 2,
    paddingVertical: 0,
  },
  checkBtn: {
    width: 38,
    height: 34,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  setActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addSetInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addSetInlineText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  removeSetInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeSetInlineText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    marginVertical: 24,
    fontSize: 14,
  },
  notesCard: {
    marginBottom: 14,
    padding: 12,
  },
  notesLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  notesInput: {
    color: colors.text,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  footerContainer: {
    marginTop: 10,
    gap: 10,
  },
  cardioBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  cardioPrescribedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardioPrescribedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardioInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardioInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardioInput: {
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  cardioCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginTop: 4,
  },
  cardioCompleteBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
