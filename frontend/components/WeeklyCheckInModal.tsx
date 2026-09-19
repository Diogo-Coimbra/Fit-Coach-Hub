import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';
import { api } from '../services/api';

interface WeeklyCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WeeklyCheckInModal: React.FC<WeeklyCheckInModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [weight, setWeight] = useState('');
  const [energyLevel, setEnergyLevel] = useState(7);
  const [dietAdherence, setDietAdherence] = useState(8);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [hasPain, setHasPain] = useState(false);
  const [painLevel, setPainLevel] = useState(3);
  const [painNotes, setPainNotes] = useState('');
  const [notes, setNotes] = useState('');

  // 3 Fotos de evolução
  const [frontPhotoBase64, setFrontPhotoBase64] = useState<string | null>(null);
  const [frontPhotoUri, setFrontPhotoUri] = useState<string | null>(null);
  const [backPhotoBase64, setBackPhotoBase64] = useState<string | null>(null);
  const [backPhotoUri, setBackPhotoUri] = useState<string | null>(null);
  const [sidePhotoBase64, setSidePhotoBase64] = useState<string | null>(null);
  const [sidePhotoUri, setSidePhotoUri] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickPhoto = async (type: 'front' | 'back' | 'side') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('weeklyCheckIn.permissionError'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null;

        if (type === 'front') {
          setFrontPhotoUri(asset.uri);
          setFrontPhotoBase64(base64Data);
        } else if (type === 'back') {
          setBackPhotoUri(asset.uri);
          setBackPhotoBase64(base64Data);
        } else {
          setSidePhotoUri(asset.uri);
          setSidePhotoBase64(base64Data);
        }
      }
    } catch (err: any) {
      console.error('Erro ao escolher foto:', err);
      Alert.alert(t('common.error'), t('weeklyCheckIn.photoPickError'));
    }
  };

  const handleSubmit = async () => {
    const numWeight = parseFloat(weight.replace(',', '.'));
    if (isNaN(numWeight) || numWeight <= 20 || numWeight >= 300) {
      Alert.alert(t('common.error'), t('weeklyCheckIn.invalidWeightError'));
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/api/checkins', {
        weight: numWeight,
        energyLevel,
        dietAdherence,
        sleepQuality,
        painLevel: hasPain ? painLevel : 0,
        painNotes: hasPain ? painNotes : null,
        notes: notes.trim() || null,
        frontPhotoBase64,
        backPhotoBase64,
        sidePhotoBase64,
      });

      Alert.alert(
        t('weeklyCheckIn.submitSuccessTitle'),
        t('weeklyCheckIn.submitSuccessMsg'),
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              if (onSuccess) onSuccess();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Erro ao submeter check-in:', error);
      Alert.alert(t('common.error'), error.message || t('weeklyCheckIn.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingPills = (
    value: number,
    onChange: (val: number) => void,
    max: number = 10,
    accentColor: string = colors.accent
  ) => {
    return (
      <View style={styles.pillsRow}>
        {Array.from({ length: max }, (_, i) => i + 1).map((num) => {
          const isSelected = value === num;
          return (
            <TouchableOpacity
              key={num}
              onPress={() => onChange(num)}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? accentColor : colors.surface,
                  borderColor: isSelected ? accentColor : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: isSelected ? '#FFFFFF' : colors.muted, fontWeight: isSelected ? '700' : '500' },
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
          {/* Cabeçalho do Modal */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>📋 {t('checkin.title')}</Text>
              <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
                {t('checkin.bannerSubtitle')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* 1. Peso em Jejum */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="scale-outline" size={20} color={colors.accent} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('weeklyCheckIn.fastingWeightTitle')}</Text>
              </View>
              <Text style={[styles.cardHint, { color: colors.muted }]}>
                {t('weeklyCheckIn.fastingWeightHint')}
              </Text>
              <TextInput
                style={[styles.inputLarge, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface2 }]}
                placeholder={t('weeklyCheckIn.fastingWeightPlaceholder')}
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
            </View>

            {/* 2. Adesão à Dieta & Nutrição */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="restaurant-outline" size={20} color="#10B981" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {t('weeklyCheckIn.dietAdherenceTitle', { val: dietAdherence })}
                </Text>
              </View>
              <Text style={[styles.cardHint, { color: colors.muted }]}>
                {t('weeklyCheckIn.dietAdherenceHint')}
              </Text>
              {renderRatingPills(dietAdherence, setDietAdherence, 10, '#10B981')}
            </View>

            {/* 3. Nível de Energia e Sono */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="flash-outline" size={20} color="#F59E0B" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {t('weeklyCheckIn.energyLevelTitle', { val: energyLevel })}
                </Text>
              </View>
              {renderRatingPills(energyLevel, setEnergyLevel, 10, '#F59E0B')}

              <View style={[styles.cardHeader, { marginTop: 16 }]}>
                <Ionicons name="moon-outline" size={20} color="#8B5CF6" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {t('weeklyCheckIn.sleepQualityTitle', { val: sleepQuality })}
                </Text>
              </View>
              {renderRatingPills(sleepQuality, setSleepQuality, 10, '#8B5CF6')}
            </View>

            {/* 4. Dores Articulares ou Musculares (Alerta PT) */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: hasPain ? '#EF4444' : colors.border,
                  borderWidth: hasPain ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.painToggleRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeader}>
                    <Ionicons
                      name={hasPain ? 'warning-outline' : 'shield-checkmark-outline'}
                      size={20}
                      color={hasPain ? '#EF4444' : '#10B981'}
                    />
                    <Text style={[styles.cardTitle, { color: hasPain ? '#EF4444' : colors.text }]}>
                      {t('weeklyCheckIn.painTitle')}
                    </Text>
                  </View>
                  <Text style={[styles.cardHint, { color: colors.muted }]}>
                    {t('weeklyCheckIn.painHint')}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setHasPain(!hasPain)}
                  style={[
                    styles.toggleBtn,
                    { backgroundColor: hasPain ? '#EF4444' : colors.surface2, borderColor: hasPain ? '#EF4444' : colors.border },
                  ]}
                >
                  <Text style={{ color: hasPain ? '#FFFFFF' : colors.muted, fontWeight: '700' }}>
                    {hasPain ? t('weeklyCheckIn.yes') : t('weeklyCheckIn.no')}
                  </Text>
                </TouchableOpacity>
              </View>

              {hasPain && (
                <View style={styles.painDetailsBox}>
                  <Text style={[styles.labelSmall, { color: colors.text }]}>
                    {t('weeklyCheckIn.painIntensity', { val: painLevel })}
                  </Text>
                  {renderRatingPills(painLevel, setPainLevel, 10, '#EF4444')}

                  <Text style={[styles.labelSmall, { color: colors.text, marginTop: 12 }]}>
                    {t('weeklyCheckIn.painDescLabel')}
                  </Text>
                  <TextInput
                    style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface2 }]}
                    placeholder={t('weeklyCheckIn.painDescPlaceholder')}
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
                    value={painNotes}
                    onChangeText={setPainNotes}
                  />
                </View>
              )}
            </View>

            {/* 5. Fotos de Evolução (Frente, Costas, Lateral) */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="camera-outline" size={20} color={colors.accent} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('weeklyCheckIn.evolutionPhotosTitle')}</Text>
              </View>
              <Text style={[styles.cardHint, { color: colors.muted }]}>
                {t('weeklyCheckIn.evolutionPhotosHint')}
              </Text>

              <View style={styles.photosGrid}>
                {/* Frente */}
                <TouchableOpacity
                  onPress={() => pickPhoto('front')}
                  style={[styles.photoSlot, { backgroundColor: colors.surface2, borderColor: colors.border }]}
                >
                  {frontPhotoUri ? (
                    <Image source={{ uri: frontPhotoUri }} style={styles.photoThumb} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="person-outline" size={28} color={colors.muted} />
                      <Text style={[styles.photoSlotLabel, { color: colors.muted }]}>{t('weeklyCheckIn.front')}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Costas */}
                <TouchableOpacity
                  onPress={() => pickPhoto('back')}
                  style={[styles.photoSlot, { backgroundColor: colors.surface2, borderColor: colors.border }]}
                >
                  {backPhotoUri ? (
                    <Image source={{ uri: backPhotoUri }} style={styles.photoThumb} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="body-outline" size={28} color={colors.muted} />
                      <Text style={[styles.photoSlotLabel, { color: colors.muted }]}>{t('weeklyCheckIn.back')}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Lateral */}
                <TouchableOpacity
                  onPress={() => pickPhoto('side')}
                  style={[styles.photoSlot, { backgroundColor: colors.surface2, borderColor: colors.border }]}
                >
                  {sidePhotoUri ? (
                    <Image source={{ uri: sidePhotoUri }} style={styles.photoThumb} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="walk-outline" size={28} color={colors.muted} />
                      <Text style={[styles.photoSlotLabel, { color: colors.muted }]}>{t('weeklyCheckIn.side')}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 6. Observações Gerais */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.accent} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('weeklyCheckIn.weeklyNotesTitle')}</Text>
              </View>
              <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface2 }]}
                placeholder={t('weeklyCheckIn.weeklyNotesPlaceholder')}
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </ScrollView>

          {/* Rodapé com botão de Envio */}
          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.submitButton, { backgroundColor: colors.accent }]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>{t('weeklyCheckIn.submitCheckInBtn')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    gap: 14,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardHint: {
    fontSize: 12,
    marginBottom: 12,
  },
  inputLarge: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: '700',
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  pill: {
    flex: 1,
    height: 38,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 13,
  },
  painToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 10,
  },
  painDetailsBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  textArea: {
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  photoSlot: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoSlotLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
