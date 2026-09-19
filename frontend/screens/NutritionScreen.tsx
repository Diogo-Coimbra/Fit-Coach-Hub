import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Modal,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { BackButton, Button, Card, ProgressBar, Screen, showAlert, Subtitle, Title } from '../components/ui';
import { ColorScheme, radius, space } from '../theme';
import { api } from '../services/api';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';

export default function NutritionScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);

  // Estados para notas adicionais em fotos e descrição por texto
  const [pendingPhotoBase64, setPendingPhotoBase64] = useState<string | null>(null);
  const [photoNotes, setPhotoNotes] = useState('');
  const [isPhotoNotesModalVisible, setIsPhotoNotesModalVisible] = useState(false);
  const [textDescription, setTextDescription] = useState('');
  const [isTextModalVisible, setIsTextModalVisible] = useState(false);

  const goalCalories = user?.dailyCalories || 2500;
  const goalProtein = user?.dailyProtein || 150;
  const goalCarbs = user?.dailyCarbs || 300;
  const goalFat = user?.dailyFat || 80;

  const fetchTodayMeals = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const data = await api.get(`/api/nutrition/meals/${user.id}/today`);
      setTodayMeals(data || []);
    } catch (error) {
      console.error('Failed to load meals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTodayMeals();
    }, [user?.id])
  );

  const consumedCalories = todayMeals.reduce((acc, meal) => acc + (meal.calories || 0), 0);
  const consumedProtein = todayMeals.reduce((acc, meal) => acc + (meal.protein || 0), 0);
  const consumedCarbs = todayMeals.reduce((acc, meal) => acc + (meal.carbs || 0), 0);
  const consumedFat = todayMeals.reduce((acc, meal) => acc + (meal.fat || 0), 0);
  const calorieProgress = (consumedCalories / goalCalories) * 100;

  const handlePickImage = async (useCamera: boolean = false) => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    };

    const result = useCamera
      ? await (async () => {
          await ImagePicker.requestCameraPermissionsAsync();
          return ImagePicker.launchCameraAsync(options);
        })()
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      let base64 = asset.base64;
      if (base64 && !base64.startsWith('data:')) {
        base64 = `data:image/jpeg;base64,${base64}`;
      }

      setTempImageUri(asset.uri);
      setPendingPhotoBase64(asset.base64 || null);
      setPhotoNotes('');
      setIsPhotoNotesModalVisible(true);
    }
  };

  const handleConfirmPhotoAnalysis = () => {
    if (!pendingPhotoBase64) return;
    setIsPhotoNotesModalVisible(false);

    // Faz upload da foto para Cloudinary em paralelo
    api.post('/api/uploads', { imageBase64: pendingPhotoBase64 })
      .then((res) => {
        if (res?.url) setTempImageUri(res.url);
      })
      .catch((err) => console.warn('Falha no upload da foto da refeição:', err));

    analyzeMealWithAI({
      imageBase64: pendingPhotoBase64,
      additionalNotes: photoNotes.trim() || undefined,
      language,
    });
  };

  const handleConfirmTextAnalysis = () => {
    const cleanText = textDescription.trim();
    if (!cleanText) {
      showAlert(t('common.attention'), t('nutrition.emptyDescriptionAlert'));
      return;
    }

    setIsTextModalVisible(false);
    setTempImageUri(null);
    analyzeMealWithAI({
      description: cleanText,
      language,
    });
  };

  const analyzeMealWithAI = async (payload: {
    imageBase64?: string;
    additionalNotes?: string;
    description?: string;
    language?: string;
  }) => {
    try {
      setIsAnalyzing(true);
      const data = await api.post('/api/nutrition/analyze', payload);
      setAiResult(data);
      setModalVisible(true);
    } catch (error: any) {
      console.error('Falha na análise nutricional:', error);
      showAlert(t('nutrition.cannotAnalyze'), error.message || t('nutrition.cannotAnalyzeTips'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confirmAndSaveMeal = async () => {
    if (!user?.id || !aiResult) return;

    try {
      await api.post('/api/nutrition/meals', {
        name: aiResult.name,
        calories: aiResult.calories,
        protein: aiResult.protein,
        carbs: aiResult.carbs,
        fat: aiResult.fat,
        imageUri: tempImageUri,
      });

      setModalVisible(false);
      setAiResult(null);
      setTempImageUri(null);
      setPendingPhotoBase64(null);
      setPhotoNotes('');
      setTextDescription('');
      fetchTodayMeals();
    } catch (error: any) {
      console.error('Falha ao guardar refeição:', error);
      showAlert(t('common.error'), error.message || t('common.error'));
    }
  };

  const renderMeal = ({ item }: any) => (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealName}>{item.name}</Text>
        <Text style={styles.mealCalories}>{item.calories} kcal</Text>
      </View>
      <Text style={styles.macroText}>
        {t('nutrition.protein')}: {item.protein}g · {t('nutrition.carbs')}: {item.carbs}g · {t('nutrition.fat')}: {item.fat}g
      </Text>
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Title>{t('nutrition.title')}</Title>
        <Subtitle>{t('nutrition.subtitle')}</Subtitle>
      </View>

      <FlatList
        data={todayMeals}
        keyExtractor={(item) => item.id}
        renderItem={renderMeal}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Card style={styles.summary}>
              <Text style={styles.summaryLabel}>{t('nutrition.todayTotal')}</Text>
              <View style={styles.calRow}>
                <Text style={styles.calValue}>{consumedCalories}</Text>
                <Text style={styles.calGoal}> / {goalCalories} kcal</Text>
              </View>
              <ProgressBar value={calorieProgress} />
              <View style={styles.macros}>
                <View style={styles.macroBox}>
                  <Text style={styles.macroLabel}>{t('nutrition.protein')}</Text>
                  <Text style={styles.macroValue}>
                    {consumedProtein}/{goalProtein}g
                  </Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={styles.macroLabel}>{t('nutrition.carbs')}</Text>
                  <Text style={styles.macroValue}>
                    {consumedCarbs}/{goalCarbs}g
                  </Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={styles.macroLabel}>{t('nutrition.fat')}</Text>
                  <Text style={styles.macroValue}>
                    {consumedFat}/{goalFat}g
                  </Text>
                </View>
              </View>
            </Card>

            {isAnalyzing ? (
              <View style={styles.analyzing}>
                <ActivityIndicator color={colors.accent} />
                <Text style={styles.analyzingText}>{t('nutrition.analyzingFood')}</Text>
              </View>
            ) : (
              <View style={{ marginBottom: 24, gap: 10 }}>
                <View style={styles.actions}>
                  <View style={{ flex: 1 }}>
                    <Button title={t('nutrition.scanMeal')} icon="camera-outline" onPress={() => handlePickImage(true)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button title={t('nutrition.galleryMeal')} variant="secondary" icon="image-outline" onPress={() => handlePickImage(false)} />
                  </View>
                </View>
                <Button
                  title={t('nutrition.describeMealTitle')}
                  variant="secondary"
                  icon="create-outline"
                  onPress={() => {
                    setTextDescription('');
                    setIsTextModalVisible(true);
                  }}
                />
              </View>
            )}

            <Text style={styles.sectionTitle}>{t('nutrition.todayMeals')}</Text>
            {isLoading ? <ActivityIndicator color={colors.accent} style={{ marginBottom: 12 }} /> : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? null : <Text style={styles.empty}>{t('nutrition.noMealsToday')}</Text>
        }
      />

      {/* Modal de Confirmação de Fotografia e Notas Adicionais / Pesos */}
      <Modal animationType="slide" transparent visible={isPhotoNotesModalVisible} onRequestClose={() => setIsPhotoNotesModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>{t('nutrition.confirmPhotoTitle')}</Text>
              {tempImageUri ? <Image source={{ uri: tempImageUri }} style={styles.preview} /> : null}

              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('nutrition.photoNotesLabel')}</Text>
              <TextInput
                style={[styles.modalTextInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                placeholder={t('nutrition.photoNotesPlaceholder')}
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                value={photoNotes}
                onChangeText={setPhotoNotes}
              />

              <View style={styles.modalBtns}>
                <View style={{ flex: 1 }}>
                  <Button
                    title={t('common.cancel')}
                    variant="secondary"
                    onPress={() => {
                      setIsPhotoNotesModalVisible(false);
                      setPendingPhotoBase64(null);
                      setTempImageUri(null);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title={t('nutrition.calculateWithAI')} onPress={handleConfirmPhotoAnalysis} />
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de Descrição de Refeição em Texto */}
      <Modal animationType="slide" transparent visible={isTextModalVisible} onRequestClose={() => setIsTextModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Ionicons name="restaurant-outline" size={22} color={colors.accent} />
                <Text style={styles.modalTitle}>{t('nutrition.describeMealTitle')}</Text>
              </View>
              <Text style={[styles.modalSubtitle, { color: colors.muted }]}>{t('nutrition.describeMealSub')}</Text>

              <TextInput
                style={[styles.modalTextInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text, minHeight: 90 }]}
                placeholder={t('nutrition.describeMealPlaceholder')}
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
                value={textDescription}
                onChangeText={setTextDescription}
                autoFocus
              />

              <View style={styles.modalBtns}>
                <View style={{ flex: 1 }}>
                  <Button title={t('common.cancel')} variant="secondary" onPress={() => setIsTextModalVisible(false)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title={t('nutrition.calculateWithAI')} onPress={handleConfirmTextAnalysis} />
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de Estimativa e Confirmação da Refeição */}
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{t('nutrition.nutritionEstimate')}</Text>
            {tempImageUri ? (
              <Image source={{ uri: tempImageUri }} style={styles.preview} />
            ) : (
              <View style={[styles.textMealBadge, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                <Ionicons name="restaurant-outline" size={32} color={colors.accent} />
              </View>
            )}
            <Text style={styles.aiName}>{aiResult?.name}</Text>
            <Text style={styles.aiCal}>{aiResult?.calories} kcal</Text>
            <Text style={styles.aiMacros}>
              {t('nutrition.protein')}: {aiResult?.protein}g · {t('nutrition.carbs')}: {aiResult?.carbs}g · {t('nutrition.fat')}: {aiResult?.fat}g
            </Text>
            <View style={styles.modalBtns}>
              <View style={{ flex: 1 }}>
                <Button title={t('nutrition.discard')} variant="secondary" onPress={() => setModalVisible(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title={t('nutrition.saveMeal')} onPress={confirmAndSaveMeal} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  header: { paddingHorizontal: space.lg },
  list: { paddingHorizontal: space.lg, paddingTop: 16, paddingBottom: 40 },
  summary: { marginBottom: 16 },
  summaryLabel: { color: colors.muted, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  calRow: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 8 },
  calValue: { color: colors.text, fontSize: 32, fontWeight: '700', letterSpacing: -0.8 },
  calGoal: { color: colors.muted, fontSize: 16, marginLeft: 4 },
  macros: { flexDirection: 'row', gap: 8, marginTop: 16 },
  macroBox: { flex: 1, backgroundColor: colors.surface2, borderRadius: radius.sm, padding: 10 },
  macroLabel: { color: colors.muted, fontSize: 11, marginBottom: 4 },
  macroValue: { color: colors.text, fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10 },
  analyzing: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  analyzingText: { color: colors.muted, marginTop: 10, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  mealCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 },
  mealName: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1 },
  mealCalories: { fontSize: 15, fontWeight: '700', color: colors.accent },
  macroText: { fontSize: 13, color: colors.muted },
  empty: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { fontSize: 19, fontWeight: '700', color: colors.text, marginBottom: 14 },
  modalSubtitle: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  modalTextInput: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  preview: { width: '100%', height: 160, borderRadius: radius.md, marginBottom: 14 },
  textMealBadge: {
    width: '100%',
    height: 90,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  aiName: { fontSize: 18, fontWeight: '700', color: colors.text },
  aiCal: { fontSize: 24, fontWeight: '700', color: colors.accent, marginVertical: 6 },
  aiMacros: { color: colors.muted, fontSize: 14, marginBottom: 18 },
  modalBtns: { flexDirection: 'row', gap: 10 },
});
