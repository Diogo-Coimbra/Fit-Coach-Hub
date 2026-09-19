import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { BackButton, Button, Field, Screen, Subtitle, Title } from '../components/ui';
import { ColorScheme, radius, space } from '../theme';
import { api } from '../services/api';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';

export default function CreateWorkoutScreen({ route, navigation }: any) {
  const { user } = useAuthStore();
  const { colors, mode } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const targetClientId = route?.params?.targetClientId;
  const isTemplate = route?.params?.isTemplate || false;

  const categories = useMemo(() => [
    { id: 'Hipertrofia', label: t('workouts.catHypertrophy') },
    { id: 'Força', label: t('workouts.catStrength') },
    { id: 'Perda de Gordura', label: t('workouts.catFatLoss') },
    { id: 'Full Body', label: t('workouts.catFullBody') },
    { id: 'Condicionamento', label: t('workouts.catConditioning') },
  ], [t]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hipertrofia');
  const [routineTag, setRoutineTag] = useState<string>('A');
  const [programName, setProgramName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateWorkout = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.attention'), t('workouts.nameRequiredAlert'));
      return;
    }

    setIsSubmitting(true);

    try {
      if (isTemplate) {
        const newTemplate = await api.post('/api/coach/templates', {
          name: name.trim(),
          description: description.trim() || undefined,
          category,
          routineTag: routineTag || undefined,
          programName: programName.trim() || undefined,
        });
        navigation.replace('WorkoutDetails', { workoutId: newTemplate.id });
      } else {
        const newWorkout = await api.post('/api/workouts', {
          name: name.trim(),
          description: description.trim() || undefined,
          targetClientId: targetClientId || undefined,
          routineTag: routineTag || undefined,
          programName: programName.trim() || undefined,
        });
        navigation.replace('WorkoutDetails', { workoutId: newWorkout.id });
      }
    } catch (error: any) {
      console.error('Falha ao criar treino:', error);
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = isTemplate
    ? t('workouts.createTemplateTitle')
    : targetClientId
    ? t('clientDetails.assignWorkout')
    : t('workouts.createWorkoutTitle');

  const pageSubtitle = isTemplate
    ? t('workouts.createTemplateSubtitle')
    : targetClientId
    ? t('workouts.assignWorkoutSubtitle')
    : t('workouts.createWorkoutSubtitle');

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <BackButton onPress={() => navigation.goBack()} />

          <Title>{pageTitle}</Title>
          <Subtitle>{pageSubtitle}</Subtitle>

          {/* Divisão Semanal (A, B, C, D) */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryLabel}>Divisão da Rotina / Semana:</Text>
            <View style={styles.chipsRow}>
              {['A', 'B', 'C', 'D', 'Nenhum'].map((tag) => {
                const isSelected = (tag === 'Nenhum' && !routineTag) || routineTag === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setRoutineTag(tag === 'Nenhum' ? '' : tag)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {tag === 'Nenhum' ? 'Sem Letra' : `Treino ${tag}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Field
            label={t('workouts.workoutNameLabel')}
            placeholder={t('workouts.workoutNamePlaceholder')}
            value={name}
            onChangeText={setName}
          />

          <Field
            label="Programa ou Mesociclo (Opcional)"
            placeholder="Ex: Mesociclo 1 - Hipertrofia (Semanas 1 a 6)"
            value={programName}
            onChangeText={setProgramName}
          />

          {isTemplate && (
            <View style={styles.categorySection}>
              <Text style={styles.categoryLabel}>{t('workouts.categoryLabel')}</Text>
              <View style={styles.chipsRow}>
                {categories.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setCategory(cat.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <Field
            label={t('workouts.descriptionLabel')}
            placeholder={t('workouts.descriptionPlaceholder')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ minHeight: 90, textAlignVertical: 'top' }}
          />

          <Button
            title={isTemplate ? t('workouts.createTemplateAndAddExercises') : t('workouts.saveAndAddExercises')}
            onPress={handleCreateWorkout}
            loading={isSubmitting}
          />
          <Button title={t('common.cancel')} variant="ghost" onPress={() => navigation.goBack()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  content: { paddingHorizontal: space.lg, paddingBottom: 40, paddingTop: 4 },
  categorySection: {
    marginBottom: 16,
  },
  categoryLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.bg,
    fontWeight: '700',
  },
});
