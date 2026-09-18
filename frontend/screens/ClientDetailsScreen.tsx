import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Screen } from '../components/ui';
import { ColorScheme, radius, space } from '../theme';
import { api } from '../services/api';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';

export default function ClientDetailsScreen({ route, navigation }: any) {
  const { clientId } = route.params;
  const { colors, mode } = useTheme();
  const { t, language } = useLanguage();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const localeMap: Record<string, string> = { pt: 'pt-PT', en: 'en-US', es: 'es-ES', fr: 'fr-FR' };
  const currentLocale = localeMap[language] || 'pt-PT';

  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workouts' | 'history' | 'nutrition' | 'weight'>('workouts');

  // Modal: Atribuir a partir de Modelo
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isAssigningTemplate, setIsAssigningTemplate] = useState(false);

  // Modal: Ajustar Metas do Aluno
  const [isGoalsModalVisible, setIsGoalsModalVisible] = useState(false);
  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [goalCalories, setGoalCalories] = useState('');
  const [goalProtein, setGoalProtein] = useState('');
  const [goalCarbs, setGoalCarbs] = useState('');
  const [goalFat, setGoalFat] = useState('');
  const [goalWeekly, setGoalWeekly] = useState('3');

  // Modal: Nova Avaliação Corporal
  const [isAssessmentModalVisible, setIsAssessmentModalVisible] = useState(false);
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);
  const [assessmentWeight, setAssessmentWeight] = useState('');
  const [assessmentBodyFat, setAssessmentBodyFat] = useState('');
  const [assessmentChest, setAssessmentChest] = useState('');
  const [assessmentWaist, setAssessmentWaist] = useState('');
  const [assessmentArms, setAssessmentArms] = useState('');
  const [assessmentThighs, setAssessmentThighs] = useState('');
  const [assessmentNotes, setAssessmentNotes] = useState('');
  const [assessmentPhotoUri, setAssessmentPhotoUri] = useState<string | null>(null);
  const [assessmentPhotoBase64, setAssessmentPhotoBase64] = useState<string | null>(null);

  const fetchClientDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get(`/api/coach/clients/${clientId}`);
      setClient(data);
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do aluno:', error);
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  }, [clientId, t]);

  useFocusEffect(
    useCallback(() => {
      fetchClientDetails();
    }, [fetchClientDetails])
  );

  const handleRemoveClient = () => {
    Alert.alert(
      t('clientDetails.removeStudent'),
      t('clientDetails.confirmRemoveStudent', { name: client?.name || '' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/coach/clients/${clientId}`);
              Alert.alert(t('common.success'), t('clientDetails.studentRemovedSuccess'));
              navigation.goBack();
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || t('common.error'));
            }
          },
        },
      ]
    );
  };

  // Carregar e abrir modal de templates
  const handleOpenTemplatesModal = async () => {
    try {
      setIsLoadingTemplates(true);
      setIsTemplateModalVisible(true);
      const data = await api.get('/api/coach/templates');
      setTemplates(data || []);
    } catch (error: any) {
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Atribuir modelo selecionado ao aluno
  const handleAssignTemplate = (template: any) => {
    Alert.alert(
      t('clientDetails.assignTemplateTitle'),
      t('clientDetails.assignTemplateConfirm', { template: template.name, name: client?.name || '' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              setIsAssigningTemplate(true);
              await api.post('/api/coach/assign-workout', {
                clientId,
                workoutId: template.id,
              });
              setIsTemplateModalVisible(false);
              Alert.alert(t('common.success'), t('clientDetails.assignTemplateSuccess', { template: template.name }));
              fetchClientDetails();
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || t('common.error'));
            } finally {
              setIsAssigningTemplate(false);
            }
          },
        },
      ]
    );
  };

  const handleAssignWorkoutOptions = () => {
    Alert.alert(
      t('clientDetails.assignWorkout'),
      t('clientDetails.selectAssignMethod'),
      [
        {
          text: t('clientDetails.fromTemplate'),
          onPress: () => handleOpenTemplatesModal(),
        },
        {
          text: t('clientDetails.withAI'),
          onPress: () => navigation.navigate('AIGenerator', { targetClientId: clientId }),
        },
        {
          text: t('clientDetails.createManually'),
          onPress: () => navigation.navigate('CreateWorkout', { targetClientId: clientId }),
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  // Metas do Aluno
  const handleOpenGoalsModal = () => {
    setGoalCalories(client?.dailyCalories ? String(client.dailyCalories) : '');
    setGoalProtein(client?.dailyProtein ? String(client.dailyProtein) : '');
    setGoalCarbs(client?.dailyCarbs ? String(client.dailyCarbs) : '');
    setGoalFat(client?.dailyFat ? String(client.dailyFat) : '');
    setGoalWeekly(client?.weeklyGoal ? String(client.weeklyGoal) : '3');
    setIsGoalsModalVisible(true);
  };

  const handleSaveGoals = async () => {
    try {
      setIsSavingGoals(true);
      const updated = await api.put(`/api/coach/clients/${clientId}/goals`, {
        dailyCalories: goalCalories ? Number(goalCalories) : null,
        dailyProtein: goalProtein ? Number(goalProtein) : null,
        dailyCarbs: goalCarbs ? Number(goalCarbs) : null,
        dailyFat: goalFat ? Number(goalFat) : null,
        weeklyGoal: goalWeekly ? Math.max(1, Number(goalWeekly)) : 3,
      });

      setClient((prev: any) => ({
        ...prev,
        ...updated,
      }));

      setIsGoalsModalVisible(false);
      Alert.alert(t('common.success'), t('clientDetails.goalsSavedSuccess'));
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('common.error'));
    } finally {
      setIsSavingGoals(false);
    }
  };

  // Avaliação Corporal
  const handlePickAssessmentPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setAssessmentPhotoUri(asset.uri);
        let b64 = asset.base64 || null;
        if (b64 && !b64.startsWith('data:')) {
          b64 = `data:image/jpeg;base64,${b64}`;
        }
        setAssessmentPhotoBase64(b64);
      }
    } catch (error) {
      console.error('Erro ao escolher imagem:', error);
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleOpenAssessmentModal = () => {
    setAssessmentWeight('');
    setAssessmentBodyFat('');
    setAssessmentChest('');
    setAssessmentWaist('');
    setAssessmentArms('');
    setAssessmentThighs('');
    setAssessmentNotes('');
    setAssessmentPhotoUri(null);
    setAssessmentPhotoBase64(null);
    setIsAssessmentModalVisible(true);
  };

  const handleSaveAssessment = async () => {
    if (!assessmentWeight.trim()) {
      Alert.alert(t('common.attention'), t('clientDetails.weightRequiredAlert'));
      return;
    }

    try {
      setIsSavingAssessment(true);

      let photoUrl: string | null = null;
      if (assessmentPhotoBase64) {
        try {
          const uploadRes = await api.post('/api/uploads', { imageBase64: assessmentPhotoBase64 });
          if (uploadRes?.url) {
            photoUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          console.warn('Falha no upload da foto de avaliação:', uploadErr);
        }
      }

      await api.post('/api/metrics/assessment', {
        targetUserId: clientId,
        weight: Number(assessmentWeight.replace(',', '.')),
        bodyFat: assessmentBodyFat ? Number(assessmentBodyFat.replace(',', '.')) : null,
        chest: assessmentChest ? Number(assessmentChest.replace(',', '.')) : null,
        waist: assessmentWaist ? Number(assessmentWaist.replace(',', '.')) : null,
        arms: assessmentArms ? Number(assessmentArms.replace(',', '.')) : null,
        thighs: assessmentThighs ? Number(assessmentThighs.replace(',', '.')) : null,
        photoUrl,
        notes: assessmentNotes.trim() || null,
      });

      setIsAssessmentModalVisible(false);
      Alert.alert(t('common.success'), t('clientDetails.assessmentSavedSuccess'));
      fetchClientDetails();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('common.error'));
    } finally {
      setIsSavingAssessment(false);
    }
  };

  if (isLoading && !client) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </Screen>
    );
  }

  const initial = (client?.name || 'A').charAt(0).toUpperCase();
  const latestWeight = client?.bodyMetrics?.[0]?.weight || '--';

  return (
    <Screen>
      <View style={styles.container}>
        {/* Barra Superior */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{t('clientDetails.studentFile')}</Text>
          <TouchableOpacity onPress={handleRemoveClient} style={styles.backBtn}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Cartão de Perfil do Aluno */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {client?.picture ? (
              <Image source={{ uri: client.picture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetter}>{initial}</Text>
              </View>
            )}
            <View style={styles.profileText}>
              <Text style={styles.clientName}>{client?.name}</Text>
              <Text style={styles.clientEmail}>{client?.email}</Text>
            </View>
          </View>

          {/* Métricas Rápidas */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{latestWeight} kg</Text>
              <Text style={styles.metricLabel}>{t('clientDetails.currentWeight')}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{client?.currentStreak || 0} {t('clientDetails.weeksCount')}</Text>
              <Text style={styles.metricLabel}>{t('clientDetails.currentStreak')}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{client?.weeklyGoal || 3}x</Text>
              <Text style={styles.metricLabel}>{t('clientDetails.weeklyGoal')}</Text>
            </View>
          </View>
        </Card>

        {/* Separadores de Navegação */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'workouts' && styles.tabActive]}
            onPress={() => setActiveTab('workouts')}
          >
            <Text style={[styles.tabText, activeTab === 'workouts' && styles.tabTextActive]}>
              {t('clientDetails.tabWorkouts')} ({client?.workouts?.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              {t('clientDetails.tabHistory')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'nutrition' && styles.tabActive]}
            onPress={() => setActiveTab('nutrition')}
          >
            <Text style={[styles.tabText, activeTab === 'nutrition' && styles.tabTextActive]}>
              {t('clientDetails.tabNutrition')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'weight' && styles.tabActive]}
            onPress={() => setActiveTab('weight')}
          >
            <Text style={[styles.tabText, activeTab === 'weight' && styles.tabTextActive]}>
              {t('clientDetails.tabAssessment')} ({client?.bodyMetrics?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEPARADOR 1: TREINOS ATRIBUÍDOS */}
        {activeTab === 'workouts' && (
          <View style={{ flex: 1 }}>
            <View style={styles.actionHeader}>
              <Text style={styles.tabSectionTitle}>{t('clientDetails.prescribedPlans')}</Text>
              <TouchableOpacity style={styles.actionBtn} onPress={handleAssignWorkoutOptions}>
                <Ionicons name="add" size={18} color={colors.bg} />
                <Text style={styles.actionBtnText}>{t('clientDetails.assignWorkout')}</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={client?.workouts || []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 30 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.workoutCard}
                  onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id })}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.workoutName}>{item.name}</Text>
                    <Text style={styles.workoutDesc}>
                      {item.exercises?.length || 0} {t('clientDetails.exercisesCount')}
                      {item.description ? `  ·  ${item.description}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="barbell-outline" size={40} color={colors.muted} />
                  <Text style={styles.emptyText}>
                    {t('clientDetails.noWorkoutsAssigned')}
                  </Text>
                  <TouchableOpacity style={styles.emptyBtn} onPress={handleAssignWorkoutOptions}>
                    <Text style={styles.emptyBtnText}>{t('clientDetails.prescribeFirst')}</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        )}

        {/* SEPARADOR 2: HISTÓRICO DE SESSÕES */}
        {activeTab === 'history' && (
          <FlatList
            data={client?.logs || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item }) => {
              const date = new Date(item.createdAt).toLocaleDateString(currentLocale, {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              // Agrupar séries por exercício
              const setsByExercise: Record<string, any[]> = {};
              (item.setLogs || []).forEach((set: any) => {
                const name = set.exerciseName || t('workouts.exerciseName');
                if (!setsByExercise[name]) setsByExercise[name] = [];
                setsByExercise[name].push(set);
              });

              return (
                <Card style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyName}>{item.workout?.name || t('history.workoutCompletedDefault')}</Text>
                    <Text style={styles.historyDuration}>{item.durationMinutes} min</Text>
                  </View>
                  <Text style={styles.historyDate}>{date}</Text>

                  {item.notes ? (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesLabel}>{t('workouts.studentFeedback')}:</Text>
                      <Text style={styles.notesText}>{item.notes}</Text>
                    </View>
                  ) : null}

                  {Object.keys(setsByExercise).length > 0 ? (
                    <View style={styles.historySetsContainer}>
                      {Object.entries(setsByExercise).map(([exName, sets]) => (
                        <View key={exName} style={styles.historyExerciseItem}>
                          <Text style={styles.historyExTitle}>{exName}</Text>
                          <Text style={styles.historyExSets}>
                            {sets.map((s) => `${s.reps} reps × ${s.weight || 0} kg`).join('  ·  ')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </Card>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={40} color={colors.muted} />
                <Text style={styles.emptyText}>{t('clientDetails.noFinishedWorkouts')}</Text>
              </View>
            }
          />
        )}

        {/* SEPARADOR 3: NUTRIÇÃO & METAS */}
        {activeTab === 'nutrition' && (
          <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
            {/* Cartão de Metas Nutricionais e de Treino */}
            <Card style={styles.goalsCard}>
              <View style={styles.goalsHeader}>
                <View>
                  <Text style={styles.goalsTitle}>{t('clientDetails.nutritionAndGoalsTitle')}</Text>
                  <Text style={styles.goalsSub}>{t('clientDetails.nutritionAndGoalsSub')}</Text>
                </View>
                <TouchableOpacity style={styles.editGoalsBtn} onPress={handleOpenGoalsModal}>
                  <Ionicons name="options-outline" size={16} color={colors.bg} />
                  <Text style={styles.editGoalsBtnText}>{t('clientDetails.adjust')}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.macroGrid}>
                <View style={styles.macroBox}>
                  <Text style={styles.macroVal}>
                    {client?.dailyCalories ? `${client.dailyCalories}` : '--'}
                  </Text>
                  <Text style={styles.macroLabel}>{t('nutrition.calories')}</Text>
                </View>

                <View style={styles.macroBox}>
                  <Text style={styles.macroVal}>
                    {client?.dailyProtein ? `${client.dailyProtein}g` : '--'}
                  </Text>
                  <Text style={styles.macroLabel}>{t('nutrition.protein')}</Text>
                </View>

                <View style={styles.macroBox}>
                  <Text style={styles.macroVal}>
                    {client?.dailyCarbs ? `${client.dailyCarbs}g` : '--'}
                  </Text>
                  <Text style={styles.macroLabel}>{t('nutrition.carbs')}</Text>
                </View>

                <View style={styles.macroBox}>
                  <Text style={styles.macroVal}>
                    {client?.dailyFat ? `${client.dailyFat}g` : '--'}
                  </Text>
                  <Text style={styles.macroLabel}>{t('nutrition.fat')}</Text>
                </View>
              </View>
            </Card>

            <View style={styles.sectionHeader}>
              <Text style={styles.tabSectionTitle}>
                {t('nutrition.registeredMeals')} ({client?.meals?.length || 0})
              </Text>
            </View>

            {(client?.meals || []).length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={40} color={colors.muted} />
                <Text style={styles.emptyText}>{t('clientDetails.noMealsRecorded')}</Text>
              </View>
            ) : (
              client.meals.map((item: any) => {
                const date = new Date(item.createdAt).toLocaleDateString(currentLocale, {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <Card key={item.id} style={styles.mealCard}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.mealImage} />
                    ) : null}
                    <View style={styles.mealContent}>
                      <View style={styles.mealHeader}>
                        <Text style={styles.mealName}>{item.name}</Text>
                        <Text style={styles.mealCalories}>{item.calories} kcal</Text>
                      </View>
                      <Text style={styles.mealMacros}>
                        P: {item.protein}g  ·  C: {item.carbs}g  ·  G: {item.fat}g
                      </Text>
                      <Text style={styles.mealDate}>{date}</Text>
                    </View>
                  </Card>
                );
              })
            )}
          </ScrollView>
        )}

        {/* SEPARADOR 4: AVALIAÇÃO FÍSICA E FOTOS */}
        {activeTab === 'weight' && (
          <View style={{ flex: 1 }}>
            <View style={styles.actionHeader}>
              <Text style={styles.tabSectionTitle}>{t('assessment.title')}</Text>
              <TouchableOpacity style={styles.actionBtn} onPress={handleOpenAssessmentModal}>
                <Ionicons name="add" size={18} color={colors.bg} />
                <Text style={styles.actionBtnText}>{t('clientDetails.newAssessment')}</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={client?.bodyMetrics || []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 30 }}
              renderItem={({ item }) => {
                const date = new Date(item.createdAt).toLocaleDateString(currentLocale, {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });

                const hasMeasurements = item.chest || item.waist || item.arms || item.thighs;

                return (
                  <Card style={styles.assessmentCard}>
                    <View style={styles.assessmentTopRow}>
                      <View>
                        <Text style={styles.assessmentWeight}>{item.weight} kg</Text>
                        <Text style={styles.assessmentDate}>{date}</Text>
                      </View>
                      {item.bodyFat ? (
                        <View style={styles.bodyFatBadge}>
                          <Text style={styles.bodyFatText}>{item.bodyFat}% BF</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Medidas Corporais */}
                    {hasMeasurements ? (
                      <View style={styles.measurementsGrid}>
                        {item.chest ? (
                          <View style={styles.measurementItem}>
                            <Text style={styles.measurementVal}>{item.chest} cm</Text>
                            <Text style={styles.measurementLabel}>{t('assessment.chest')}</Text>
                          </View>
                        ) : null}
                        {item.waist ? (
                          <View style={styles.measurementItem}>
                            <Text style={styles.measurementVal}>{item.waist} cm</Text>
                            <Text style={styles.measurementLabel}>{t('assessment.waist')}</Text>
                          </View>
                        ) : null}
                        {item.arms ? (
                          <View style={styles.measurementItem}>
                            <Text style={styles.measurementVal}>{item.arms} cm</Text>
                            <Text style={styles.measurementLabel}>{t('assessment.arms')}</Text>
                          </View>
                        ) : null}
                        {item.thighs ? (
                          <View style={styles.measurementItem}>
                            <Text style={styles.measurementVal}>{item.thighs} cm</Text>
                            <Text style={styles.measurementLabel}>{t('assessment.thighs')}</Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}

                    {/* Fotografia de Evolução */}
                    {item.photoUrl ? (
                      <View style={styles.photoContainer}>
                        <Image source={{ uri: item.photoUrl }} style={styles.evolutionPhoto} />
                      </View>
                    ) : null}

                    {/* Observações Técnicas */}
                    {item.notes ? (
                      <View style={styles.notesBox}>
                        <Text style={styles.notesLabel}>{t('clientDetails.technicalNotes')}:</Text>
                        <Text style={styles.notesText}>{item.notes}</Text>
                      </View>
                    ) : null}
                  </Card>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="fitness-outline" size={40} color={colors.muted} />
                  <Text style={styles.emptyText}>
                    {t('assessment.noAssessments')}
                  </Text>
                  <TouchableOpacity style={styles.emptyBtn} onPress={handleOpenAssessmentModal}>
                    <Text style={styles.emptyBtnText}>{t('clientDetails.recordAssessment')}</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        )}

        {/* MODAL 1: SELECIONAR MODELO DE TREINO */}
        <Modal
          visible={isTemplateModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsTemplateModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{t('templates.title')}</Text>
                  <Text style={styles.modalSub}>{t('clientDetails.selectTemplateSub')}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsTemplateModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>

              {isLoadingTemplates ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.accent} />
                </View>
              ) : (
                <FlatList
                  data={templates}
                  keyExtractor={(t) => t.id}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.templateItem}
                      activeOpacity={0.8}
                      onPress={() => handleAssignTemplate(item)}
                      disabled={isAssigningTemplate}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.templateItemTitle}>{item.name}</Text>
                          {item.category ? (
                            <View style={styles.categoryBadge}>
                              <Text style={styles.categoryBadgeText}>{item.category}</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.templateItemDesc}>
                          {item.exercises?.length || 0} {t('clientDetails.exercisesCount')}
                          {item.description ? `  ·  ${item.description}` : ''}
                        </Text>
                      </View>
                      <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Ionicons name="document-text-outline" size={36} color={colors.muted} />
                      <Text style={styles.emptyText}>
                        {t('templates.emptyTitle')}
                      </Text>
                      <TouchableOpacity
                        style={styles.emptyBtn}
                        onPress={() => {
                          setIsTemplateModalVisible(false);
                          navigation.navigate('CreateWorkout', { isTemplate: true });
                        }}
                      >
                        <Text style={styles.emptyBtnText}>{t('templates.createTemplate')}</Text>
                      </TouchableOpacity>
                    </View>
                  }
                />
              )}
            </View>
          </View>
        </Modal>

        {/* MODAL 2: AJUSTAR METAS DO ALUNO */}
        <Modal
          visible={isGoalsModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsGoalsModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{t('clientDetails.modalGoalsTitle')}</Text>
                  <Text style={styles.modalSub}>{t('clientDetails.modalGoalsSub')}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsGoalsModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('clientDetails.dailyCalories')}</Text>
                  <TextInput
                    style={styles.input}
                    value={goalCalories}
                    onChangeText={setGoalCalories}
                    placeholder="Ex: 2400"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>{t('clientDetails.dailyProtein')}</Text>
                    <TextInput
                      style={styles.input}
                      value={goalProtein}
                      onChangeText={setGoalProtein}
                      placeholder="Ex: 160"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>{t('clientDetails.dailyCarbs')}</Text>
                    <TextInput
                      style={styles.input}
                      value={goalCarbs}
                      onChangeText={setGoalCarbs}
                      placeholder="Ex: 220"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>{t('clientDetails.dailyFat')}</Text>
                    <TextInput
                      style={styles.input}
                      value={goalFat}
                      onChangeText={setGoalFat}
                      placeholder="Ex: 65"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('clientDetails.weeklySessions')}</Text>
                  <TextInput
                    style={styles.input}
                    value={goalWeekly}
                    onChangeText={setGoalWeekly}
                    placeholder="Ex: 4"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setIsGoalsModalVisible(false)}
                    disabled={isSavingGoals}
                  >
                    <Text style={styles.modalCancelBtnText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalSubmitBtn}
                    onPress={handleSaveGoals}
                    disabled={isSavingGoals}
                  >
                    {isSavingGoals ? (
                      <ActivityIndicator size="small" color={colors.bg} />
                    ) : (
                      <Text style={styles.modalSubmitBtnText}>{t('clientDetails.saveGoals')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* MODAL 3: NOVA AVALIAÇÃO CORPORAL */}
        <Modal
          visible={isAssessmentModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsAssessmentModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{t('clientDetails.newAssessment')}</Text>
                  <Text style={styles.modalSub}>{t('clientDetails.modalAssessmentSub')}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsAssessmentModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>{t('assessment.weight')} *</Text>
                    <TextInput
                      style={styles.input}
                      value={assessmentWeight}
                      onChangeText={setAssessmentWeight}
                      placeholder="Ex: 76.5"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>{t('assessment.bodyFat')}</Text>
                    <TextInput
                      style={styles.input}
                      value={assessmentBodyFat}
                      onChangeText={setAssessmentBodyFat}
                      placeholder="Ex: 14.5"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text style={styles.sectionSubtitle}>{t('clientDetails.bodyPerimeters')}</Text>
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>{t('assessment.chest')}</Text>
                    <TextInput
                      style={styles.input}
                      value={assessmentChest}
                      onChangeText={setAssessmentChest}
                      placeholder="Ex: 102"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>{t('assessment.waist')}</Text>
                    <TextInput
                      style={styles.input}
                      value={assessmentWaist}
                      onChangeText={setAssessmentWaist}
                      placeholder="Ex: 82"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>{t('assessment.arms')}</Text>
                    <TextInput
                      style={styles.input}
                      value={assessmentArms}
                      onChangeText={setAssessmentArms}
                      placeholder="Ex: 38"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>{t('assessment.thighs')}</Text>
                    <TextInput
                      style={styles.input}
                      value={assessmentThighs}
                      onChangeText={setAssessmentThighs}
                      placeholder="Ex: 58"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Fotografia de Evolução */}
                <Text style={styles.sectionSubtitle}>{t('clientDetails.evolutionPhoto')}</Text>
                {assessmentPhotoUri ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image source={{ uri: assessmentPhotoUri }} style={styles.photoPreview} />
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => {
                        setAssessmentPhotoUri(null);
                        setAssessmentPhotoBase64(null);
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      <Text style={styles.removePhotoText}>{t('clientDetails.removePhoto')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.pickPhotoBtn}
                    onPress={handlePickAssessmentPhoto}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera-outline" size={22} color={colors.accent} />
                    <Text style={styles.pickPhotoBtnText}>{t('clientDetails.takeOrPickPhoto')}</Text>
                  </TouchableOpacity>
                )}

                {/* Notas e Observações */}
                <View style={[styles.inputGroup, { marginTop: 14 }]}>
                  <Text style={styles.inputLabel}>{t('clientDetails.technicalNotes')}</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={assessmentNotes}
                    onChangeText={setAssessmentNotes}
                    placeholder="Observações de postura, simetria muscular, etc."
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setIsAssessmentModalVisible(false)}
                    disabled={isSavingAssessment}
                  >
                    <Text style={styles.modalCancelBtnText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalSubmitBtn}
                    onPress={handleSaveAssessment}
                    disabled={isSavingAssessment}
                  >
                    {isSavingAssessment ? (
                      <ActivityIndicator size="small" color={colors.bg} />
                    ) : (
                      <Text style={styles.modalSubmitBtnText}>{t('clientDetails.recordAssessment')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </Screen>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: space.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  backBtn: {
    padding: 6,
  },
  topTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  profileCard: {
    padding: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '800',
  },
  profileText: {
    flex: 1,
  },
  clientName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  clientEmail: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: colors.border,
    height: '80%',
    alignSelf: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.bg,
    fontWeight: '700',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tabSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  actionBtnText: {
    color: colors.bg,
    fontSize: 13,
    fontWeight: '700',
  },
  workoutCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  workoutDesc: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  historyCard: {
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  historyDuration: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  historyDate: {
    color: colors.muted,
    fontSize: 12,
  },
  notesBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  notesLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  notesText: {
    color: colors.text,
    fontSize: 13,
  },
  historySetsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 6,
  },
  historyExerciseItem: {
    backgroundColor: colors.surface2,
    padding: 8,
    borderRadius: radius.sm,
  },
  historyExTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyExSets: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  // Nutrição
  goalsCard: {
    padding: 16,
    marginBottom: 18,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  goalsTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  goalsSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  editGoalsBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 4,
  },
  editGoalsBtnText: {
    color: colors.bg,
    fontSize: 12,
    fontWeight: '700',
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  macroBox: {
    flex: 1,
    backgroundColor: colors.surface2,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  macroVal: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  macroLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  mealCard: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  mealImage: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    marginBottom: 10,
  },
  mealContent: {
    gap: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  mealCalories: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  mealMacros: {
    color: colors.muted,
    fontSize: 12,
  },
  mealDate: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  // Avaliação Física
  assessmentCard: {
    padding: 16,
    marginBottom: 12,
  },
  assessmentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assessmentWeight: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  assessmentDate: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  bodyFatBadge: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },
  bodyFatText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    backgroundColor: colors.surface2,
    padding: 10,
    borderRadius: radius.sm,
  },
  measurementItem: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
  },
  measurementVal: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  measurementLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  photoContainer: {
    marginTop: 8,
    marginBottom: 10,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  evolutionPhoto: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
  },
  // Modais
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  modalSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  templateItemTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  templateItemDesc: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  categoryBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  // Form elements
  inputGroup: {
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sectionSubtitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 10,
  },
  pickPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  pickPhotoBtnText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  photoPreviewContainer: {
    alignItems: 'center',
    gap: 10,
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  removePhotoText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 260,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  emptyBtnText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
