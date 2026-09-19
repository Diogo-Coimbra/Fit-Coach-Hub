import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackButton, Button, Field, Screen, Title, Card } from '../components/ui';
import { ColorScheme, radius, space } from '../theme';
import { api } from '../services/api';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';
import {
  EXERCISE_LIBRARY,
  MUSCLE_CATEGORIES,
  LibraryExercise,
} from '../data/exerciseLibrary';

export default function AddExerciseScreen({ route, navigation }: any) {
  const { workoutId } = route.params;
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [isCardio, setIsCardio] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState('20');
  const [intensity, setIntensity] = useState('Moderada');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');
  const [restSeconds, setRestSeconds] = useState('90');
  const [notes, setNotes] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedExerciseMeta, setSelectedExerciseMeta] = useState<LibraryExercise | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered exercises from library
  const filteredExercises = useMemo(() => {
    return EXERCISE_LIBRARY.filter((ex) => {
      const matchesCategory =
        selectedCategory === 'all' || ex.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.instructions.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectFromLibrary = (exercise: LibraryExercise) => {
    setSelectedExerciseMeta(exercise);
    setName(exercise.name);
    const isCardioEx = Boolean(exercise.isCardio || exercise.category === 'cardio');
    setIsCardio(isCardioEx);
    if (isCardioEx) {
      setDurationMinutes((exercise.defaultDurationMinutes || 20).toString());
      setIntensity(exercise.defaultIntensity || 'Moderada');
    } else {
      setSets(exercise.defaultSets.toString());
      setReps(exercise.defaultReps.toString());
      setRestSeconds(exercise.defaultRestSeconds.toString());
    }
    setNotes(exercise.instructions);
    setIsLibraryExpanded(false);
  };

  const handleClearSelection = () => {
    setSelectedExerciseMeta(null);
    setIsCardio(false);
  };

  const handleAddExercise = async () => {
    if (!name.trim()) {
      Alert.alert(t('workouts.requiredFieldsTitle'), t('workouts.nameRequiredAlert'));
      return;
    }
    if (!isCardio && (!sets.trim() || !reps.trim())) {
      Alert.alert(t('workouts.requiredFieldsTitle'), t('workouts.requiredFieldsAlert'));
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/api/exercises', {
        name: name.trim(),
        isCardio,
        durationMinutes: isCardio ? (parseInt(durationMinutes) || 20) : null,
        intensity: isCardio ? (intensity.trim() || null) : null,
        sets: isCardio ? 1 : (parseInt(sets) || 3),
        reps: isCardio ? 1 : (parseInt(reps) || 10),
        weight: isCardio ? null : (weight ? parseFloat(weight.replace(',', '.')) : null),
        restSeconds: isCardio ? 0 : (parseInt(restSeconds) || 90),
        notes: notes.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        workoutId,
      });

      navigation.goBack();
    } catch (error: any) {
      console.error('Falha ao adicionar exercício:', error);
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (catId: string) => {
    switch (catId) {
      case 'cardio':
        return 'Cardio';
      case 'chest':
        return t('workouts.catChest');
      case 'back':
        return t('workouts.catBack');
      case 'legs':
        return t('workouts.catLegs');
      case 'shoulders':
        return t('workouts.catShoulders');
        return t('workouts.catShoulders');
      case 'arms':
        return t('workouts.catArms');
      case 'core':
        return t('workouts.catCore');
      default:
        return t('workouts.catAll');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <BackButton onPress={() => navigation.goBack()} />
          <Title>{t('workouts.addExerciseTitle')}</Title>

          {/* Secção da Biblioteca de Exercícios */}
          <Card style={styles.libraryCard}>
            <TouchableOpacity
              style={styles.libraryHeader}
              onPress={() => setIsLibraryExpanded((prev) => !prev)}
            >
              <View style={styles.libraryHeaderLeft}>
                <Ionicons name="barbell-outline" size={20} color={colors.accent} />
                <Text style={styles.libraryTitle}>{t('workouts.selectFromLibrary')}</Text>
              </View>
              <Ionicons
                name={isLibraryExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.muted}
              />
            </TouchableOpacity>

            {isLibraryExpanded && (
              <View style={styles.libraryBody}>
                {/* Barra de Pesquisa */}
                <View style={styles.searchBar}>
                  <Ionicons name="search-outline" size={17} color={colors.muted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={t('workouts.searchExercise')}
                    placeholderTextColor={colors.muted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={17} color={colors.muted} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Filtro de Categorias Musculares */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesRow}
                >
                  {MUSCLE_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                        onPress={() => setSelectedCategory(cat.id)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            isSelected && styles.categoryChipTextActive,
                          ]}
                        >
                          {getCategoryLabel(cat.id)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Lista de Exercícios Filtrados */}
                <View style={styles.exerciseList}>
                  {filteredExercises.slice(0, 6).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.exerciseItem}
                      onPress={() => handleSelectFromLibrary(item)}
                    >
                      <View style={styles.exerciseItemInfo}>
                        <Text style={styles.exerciseItemName}>{item.name}</Text>
                        <View style={styles.exerciseItemMeta}>
                          <Text style={styles.exerciseItemBadge}>{item.equipmentLabel}</Text>
                          <Text style={styles.exerciseItemDetail}>
                            {item.defaultSets} {t('workouts.sets').toLowerCase()} • {item.defaultReps} {t('workouts.repShort')}
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
                    </TouchableOpacity>
                  ))}
                  {filteredExercises.length > 6 && (
                    <Text style={styles.moreResultsHint}>
                      +{filteredExercises.length - 6} exercícios disponíveis. Usa a pesquisa para refinar.
                    </Text>
                  )}
                </View>
              </View>
            )}
          </Card>

          {/* Tag de Exercício Selecionado da Biblioteca */}
          {selectedExerciseMeta && (
            <View style={styles.selectedBadge}>
              <View style={styles.selectedBadgeLeft}>
                <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                <Text style={styles.selectedBadgeText}>
                  Biblioteca: {getCategoryLabel(selectedExerciseMeta.category)} • {selectedExerciseMeta.equipmentLabel}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClearSelection}>
                <Ionicons name="close" size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Formulário de Configuração do Exercício */}
          <Field
            label={t('workouts.exerciseName')}
            placeholder={t('workouts.exerciseNamePlaceholder')}
            value={name}
            onChangeText={setName}
          />

          {/* Seletor Tipo: Musculação vs Cardio */}
          <View style={styles.cardioToggleRow}>
            <TouchableOpacity
              style={[styles.typeBtn, !isCardio && styles.typeBtnActive]}
              onPress={() => setIsCardio(false)}
            >
              <Ionicons name="barbell-outline" size={16} color={!isCardio ? '#FFFFFF' : colors.muted} />
              <Text style={[styles.typeBtnText, !isCardio && styles.typeBtnTextActive]}>
                Musculação
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, isCardio && styles.typeBtnActive]}
              onPress={() => setIsCardio(true)}
            >
              <Ionicons name="heart-outline" size={16} color={isCardio ? '#FFFFFF' : colors.muted} />
              <Text style={[styles.typeBtnText, isCardio && styles.typeBtnTextActive]}>
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
                    style={[styles.quickPill, durationMinutes === mins && styles.quickPillActive]}
                    onPress={() => setDurationMinutes(mins)}
                  >
                    <Text style={[styles.quickPillText, durationMinutes === mins && styles.quickPillTextActive]}>
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
                    style={[styles.quickPill, intensity === level && styles.quickPillActive]}
                    onPress={() => setIntensity(level)}
                  >
                    <Text style={[styles.quickPillText, intensity === level && styles.quickPillTextActive]}>
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
                    label={t('workouts.targetSets')}
                    keyboardType="numeric"
                    value={sets}
                    onChangeText={setSets}
                  />
                </View>
                <View style={styles.half}>
                  <Field
                    label={t('workouts.repsLabel')}
                    keyboardType="numeric"
                    value={reps}
                    onChangeText={setReps}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Field
                    label={t('workouts.suggestedWeight')}
                    placeholder="50"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
                <View style={styles.half}>
                  <Field
                    label={t('workouts.restSecondsLabel')}
                    placeholder="90"
                    keyboardType="numeric"
                    value={restSeconds}
                    onChangeText={setRestSeconds}
                  />
                </View>
              </View>
            </>
          )}

          <Field
            label="Link de Vídeo / GIF Demonstrativo"
            placeholder="https://youtube.com/... ou link direto .mp4 / .gif"
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
          />

          <Field
            label={t('workouts.executionNotes')}
            placeholder={t('workouts.executionNotesPlaceholder')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <Button
            title={t('workouts.addToPlan')}
            onPress={handleAddExercise}
            loading={isSubmitting}
          />
          <Button
            title={t('common.cancel')}
            variant="ghost"
            onPress={() => navigation.goBack()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const getStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: space.lg,
      paddingBottom: 40,
    },
    libraryCard: {
      marginBottom: space.md,
      padding: 0,
      overflow: 'hidden',
    },
    libraryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: space.md,
    },
    libraryHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
    },
    libraryTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    libraryBody: {
      paddingHorizontal: space.md,
      paddingBottom: space.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: space.sm,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface2,
      borderRadius: radius.md,
      paddingHorizontal: space.sm,
      paddingVertical: Platform.OS === 'ios' ? 8 : 4,
      marginBottom: space.sm,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      paddingVertical: 2,
    },
    categoriesRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: space.sm,
      paddingVertical: 4,
    },
    categoryChip: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: radius.full,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    categoryChipText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '600',
    },
    categoryChipTextActive: {
      color: colors.bg,
    },
    exerciseList: {
      gap: 8,
    },
    exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: colors.surface2,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exerciseItemInfo: {
      flex: 1,
      marginRight: space.sm,
    },
    exerciseItemName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 2,
    },
    exerciseItemMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    exerciseItemBadge: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: '600',
    },
    exerciseItemDetail: {
      color: colors.muted,
      fontSize: 11,
    },
    moreResultsHint: {
      color: colors.muted,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 4,
    },
    selectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface2,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: radius.md,
      marginBottom: space.sm,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
    },
    selectedBadgeLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    selectedBadgeText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '500',
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    half: {
      flex: 1,
    },
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    typeBtnActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    typeBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.muted,
    },
    typeBtnTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickPillActive: {
      backgroundColor: colors.accent + '20',
      borderColor: colors.accent,
    },
    quickPillText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.muted,
    },
    quickPillTextActive: {
      color: colors.accent,
      fontWeight: '700',
    },
  });
