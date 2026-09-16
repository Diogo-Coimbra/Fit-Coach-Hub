import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../store/useAuthStore';
import { BackButton, Button, Card, ProgressBar, Screen, showAlert, Subtitle, Title } from '../components/ui';
import { colors, radius, space } from '../theme';

export default function NutritionScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);

  const goalCalories = user?.dailyCalories || 2500;
  const goalProtein = user?.dailyProtein || 150;
  const goalCarbs = user?.dailyCarbs || 300;
  const goalFat = user?.dailyFat || 80;

  const fetchTodayMeals = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const response = await fetch(`http://192.168.1.80:3000/api/nutrition/meals/${user.id}/today`);
      const data = await response.json();
      setTodayMeals(data);
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

    if (!result.canceled && result.assets[0].base64) {
      setTempImageUri(result.assets[0].uri);
      analyzeImageWithAI(result.assets[0].base64);
    }
  };

  const analyzeImageWithAI = async (base64Image: string) => {
    try {
      setIsAnalyzing(true);
      const response = await fetch('http://192.168.1.80:3000/api/nutrition/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image }),
      });

      if (!response.ok) throw new Error('AI failed');

      const data = await response.json();
      setAiResult(data);
      setModalVisible(true);
    } catch (error) {
      console.error('Nutrition analysis failed:', error);
      showAlert('Could not analyze', 'Try another photo with the plate clearly visible.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confirmAndSaveMeal = async () => {
    if (!user?.id || !aiResult) return;

    try {
      const response = await fetch('http://192.168.1.80:3000/api/nutrition/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: aiResult.name,
          calories: aiResult.calories,
          protein: aiResult.protein,
          carbs: aiResult.carbs,
          fat: aiResult.fat,
          imageUri: tempImageUri,
        }),
      });

      if (response.ok) {
        setModalVisible(false);
        setAiResult(null);
        setTempImageUri(null);
        fetchTodayMeals();
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Failed to save meal:', error);
      showAlert('Error', 'Could not save this meal.');
    }
  };

  const renderMeal = ({ item }: any) => (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealName}>{item.name}</Text>
        <Text style={styles.mealCalories}>{item.calories} kcal</Text>
      </View>
      <Text style={styles.macroText}>
        P {item.protein}g  ·  C {item.carbs}g  ·  F {item.fat}g
      </Text>
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} label="Home" />
        <Title>Nutrition</Title>
        <Subtitle>Log meals from a photo.</Subtitle>
      </View>

      <FlatList
        data={todayMeals}
        keyExtractor={(item) => item.id}
        renderItem={renderMeal}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Card style={styles.summary}>
              <Text style={styles.summaryLabel}>Today</Text>
              <View style={styles.calRow}>
                <Text style={styles.calValue}>{consumedCalories}</Text>
                <Text style={styles.calGoal}> / {goalCalories} kcal</Text>
              </View>
              <ProgressBar value={calorieProgress} />
              <View style={styles.macros}>
                <View style={styles.macroBox}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>
                    {consumedProtein}/{goalProtein}g
                  </Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>
                    {consumedCarbs}/{goalCarbs}g
                  </Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={styles.macroLabel}>Fat</Text>
                  <Text style={styles.macroValue}>
                    {consumedFat}/{goalFat}g
                  </Text>
                </View>
              </View>
            </Card>

            {isAnalyzing ? (
              <View style={styles.analyzing}>
                <ActivityIndicator color={colors.accent} />
                <Text style={styles.analyzingText}>Analyzing your plate...</Text>
              </View>
            ) : (
              <View style={styles.actions}>
                <View style={{ flex: 1 }}>
                  <Button title="Camera" icon="camera-outline" onPress={() => handlePickImage(true)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title="Gallery" variant="secondary" icon="image-outline" onPress={() => handlePickImage(false)} />
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>Today's meals</Text>
            {isLoading ? <ActivityIndicator color={colors.accent} style={{ marginBottom: 12 }} /> : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? null : <Text style={styles.empty}>No meals logged today. Photograph your plate to start.</Text>
        }
      />

      <Modal animationType="fade" transparent visible={modalVisible}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Meal estimate</Text>
            {tempImageUri ? <Image source={{ uri: tempImageUri }} style={styles.preview} /> : null}
            <Text style={styles.aiName}>{aiResult?.name}</Text>
            <Text style={styles.aiCal}>{aiResult?.calories} kcal</Text>
            <Text style={styles.aiMacros}>
              P {aiResult?.protein}g  ·  C {aiResult?.carbs}g  ·  F {aiResult?.fat}g
            </Text>
            <View style={styles.modalBtns}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setModalVisible(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Save meal" onPress={confirmAndSaveMeal} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  actions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
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
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 14 },
  preview: { width: '100%', height: 160, borderRadius: radius.md, marginBottom: 14 },
  aiName: { fontSize: 18, fontWeight: '700', color: colors.text },
  aiCal: { fontSize: 24, fontWeight: '700', color: colors.accent, marginVertical: 6 },
  aiMacros: { color: colors.muted, fontSize: 14, marginBottom: 18 },
  modalBtns: { flexDirection: 'row', gap: 10 },
});
