import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  PanResponder,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';
import { api } from '../services/api';
import { radius, space } from '../theme';

interface PhotoCompareModalProps {
  visible: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

interface PhotoItem {
  date: string;
  weight?: number;
  frontPhotoUrl?: string | null;
  backPhotoUrl?: string | null;
  sidePhotoUrl?: string | null;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - 48, 380);
const CONTAINER_HEIGHT = Math.round(CONTAINER_WIDTH * 1.25);

export default function PhotoCompareModal({
  visible,
  onClose,
  clientId,
  clientName,
}: PhotoCompareModalProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [photoList, setPhotoList] = useState<PhotoItem[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<'front' | 'back' | 'side'>('front');
  const [mode, setMode] = useState<'slider' | 'sideBySide'>('slider');

  // Índices para Foto Antes e Foto Depois
  const [beforeIndex, setBeforeIndex] = useState<number>(0);
  const [afterIndex, setAfterIndex] = useState<number>(0);

  // Posição do separador deslizante (0 a CONTAINER_WIDTH)
  const [sliderX, setSliderX] = useState<number>(CONTAINER_WIDTH / 2);
  const sliderXRef = useRef(CONTAINER_WIDTH / 2);
  sliderXRef.current = sliderX;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(0, Math.min(CONTAINER_WIDTH, gestureState.moveX - 24));
        setSliderX(newX);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  useEffect(() => {
    if (visible && clientId) {
      loadPhotos();
    }
  }, [visible, clientId]);

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const [checkInsData, clientData] = await Promise.all([
        api.get(`/api/checkins/client/${clientId}`).catch(() => []),
        api.get(`/api/coach/clients/${clientId}`).catch(() => null),
      ]);

      const list: PhotoItem[] = [];

      // Recolher fotos de check-ins semanais
      if (Array.isArray(checkInsData)) {
        checkInsData.forEach((c: any) => {
          if (c.frontPhotoUrl || c.backPhotoUrl || c.sidePhotoUrl) {
            list.push({
              date: c.createdAt,
              weight: c.weight,
              frontPhotoUrl: c.frontPhotoUrl,
              backPhotoUrl: c.backPhotoUrl,
              sidePhotoUrl: c.sidePhotoUrl,
            });
          }
        });
      }

      // Recolher fotos de avaliações físicas (BodyMetric)
      if (clientData?.bodyMetrics && Array.isArray(clientData.bodyMetrics)) {
        clientData.bodyMetrics.forEach((m: any) => {
          if (m.photoUrl) {
            list.push({
              date: m.createdAt,
              weight: m.weight,
              frontPhotoUrl: m.photoUrl,
            });
          }
        });
      }

      // Ordenar por data cronológica (mais antiga primeiro)
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Remover duplicados ou sem foto para o ângulo padrão
      setPhotoList(list);

      if (list.length >= 2) {
        setBeforeIndex(0); // A mais antiga (Semana 1)
        setAfterIndex(list.length - 1); // A mais recente
      } else if (list.length === 1) {
        setBeforeIndex(0);
        setAfterIndex(0);
      }
    } catch (err) {
      console.error('Erro ao carregar fotos comparativas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPhotoUrl = (item?: PhotoItem, angle: 'front' | 'back' | 'side' = 'front') => {
    if (!item) return null;
    if (angle === 'front') return item.frontPhotoUrl || item.sidePhotoUrl || item.backPhotoUrl;
    if (angle === 'back') return item.backPhotoUrl || item.frontPhotoUrl;
    if (angle === 'side') return item.sidePhotoUrl || item.frontPhotoUrl;
    return null;
  };

  const beforeItem = photoList[beforeIndex];
  const afterItem = photoList[afterIndex];

  const beforeUrl = getPhotoUrl(beforeItem, selectedAngle);
  const afterUrl = getPhotoUrl(afterItem, selectedAngle);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const weightDelta =
    beforeItem?.weight && afterItem?.weight
      ? Math.round((afterItem.weight - beforeItem.weight) * 10) / 10
      : null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('photoCompare.title')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {t('photoCompare.subtitle', { name: clientName })}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.muted }]}>{t('photoCompare.loading')}</Text>
            </View>
          ) : photoList.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="images-outline" size={56} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('photoCompare.emptyTitle')}</Text>
              <Text style={[styles.emptyDesc, { color: colors.muted }]}>
                {t('photoCompare.emptyDesc')}
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              {/* Seletor de Ângulo (Frente / Costas / Perfil) */}
              <View style={[styles.angleTabs, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                {(['front', 'back', 'side'] as const).map((angle) => {
                  const isSel = selectedAngle === angle;
                  const label =
                    angle === 'front'
                      ? t('weeklyCheckIn.front')
                      : angle === 'back'
                      ? t('weeklyCheckIn.back')
                      : t('weeklyCheckIn.side');
                  return (
                    <TouchableOpacity
                      key={angle}
                      style={[styles.angleTab, isSel && { backgroundColor: colors.accent }]}
                      onPress={() => setSelectedAngle(angle)}
                    >
                      <Text style={[styles.angleTabText, { color: isSel ? colors.bg : colors.text }]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Seletor de Modo (Barra Deslizante vs Lado a Lado) */}
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[styles.modeBtn, mode === 'slider' && { borderColor: colors.accent, backgroundColor: colors.accent + '15' }]}
                  onPress={() => setMode('slider')}
                >
                  <Ionicons name="swap-horizontal" size={16} color={mode === 'slider' ? colors.accent : colors.muted} />
                  <Text style={[styles.modeBtnText, { color: mode === 'slider' ? colors.accent : colors.muted }]}>
                    {t('photoCompare.sliderMode')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeBtn, mode === 'sideBySide' && { borderColor: colors.accent, backgroundColor: colors.accent + '15' }]}
                  onPress={() => setMode('sideBySide')}
                >
                  <Ionicons name="grid-outline" size={16} color={mode === 'sideBySide' ? colors.accent : colors.muted} />
                  <Text style={[styles.modeBtnText, { color: mode === 'sideBySide' ? colors.accent : colors.muted }]}>
                    {t('photoCompare.sideBySideMode')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Seletor de Datas (Antes vs Depois) */}
              <View style={styles.datesRow}>
                <View style={[styles.dateBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={[styles.dateLabel, { color: colors.muted }]}>{t('photoCompare.beforeInitial')}</Text>
                  <Text style={[styles.dateValue, { color: colors.text }]}>{formatDate(beforeItem?.date)}</Text>
                  {beforeItem?.weight ? (
                    <Text style={[styles.weightBadge, { color: colors.muted }]}>{beforeItem.weight} kg</Text>
                  ) : null}
                </View>

                <View style={styles.deltaBox}>
                  <Ionicons name="arrow-forward" size={18} color={colors.accent} />
                  {weightDelta !== null && (
                    <Text
                      style={[
                        styles.deltaText,
                        { color: weightDelta <= 0 ? '#10B981' : '#F59E0B' },
                      ]}
                    >
                      {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
                    </Text>
                  )}
                </View>

                <View style={[styles.dateBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={[styles.dateLabel, { color: colors.accent }]}>{t('photoCompare.afterRecent')}</Text>
                  <Text style={[styles.dateValue, { color: colors.text }]}>{formatDate(afterItem?.date)}</Text>
                  {afterItem?.weight ? (
                    <Text style={[styles.weightBadge, { color: colors.accent }]}>{afterItem.weight} kg</Text>
                  ) : null}
                </View>
              </View>

              {/* ÁREA DE VISUALIZAÇÃO: BARRA DESLIZANTE */}
              {mode === 'slider' ? (
                <View style={styles.sliderSection}>
                  <View style={[styles.sliderContainer, { width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT }]}>
                    {/* Imagem do DEPOIS (Fundo completo) */}
                    {afterUrl ? (
                      <Image source={{ uri: afterUrl }} style={styles.imageLayer} resizeMode="cover" />
                    ) : (
                      <View style={[styles.imageFallback, { backgroundColor: colors.bg }]}>
                        <Text style={{ color: colors.muted }}>{t('photoCompare.noAfterPhoto')}</Text>
                      </View>
                    )}

                    {/* Imagem do ANTES (Sobreposta com máscara de corte pela largura sliderX) */}
                    {beforeUrl ? (
                      <View style={[styles.beforeCutLayer, { width: sliderX }]}>
                        <Image
                          source={{ uri: beforeUrl }}
                          style={[styles.imageLayer, { width: CONTAINER_WIDTH }]}
                          resizeMode="cover"
                        />
                      </View>
                    ) : null}

                    {/* Linha Divisória Deslizante */}
                    <View style={[styles.dividerLine, { left: sliderX - 1.5 }]}>
                      <View style={[styles.sliderHandle, { backgroundColor: colors.accent }]}>
                        <Ionicons name="swap-horizontal" size={18} color={colors.bg} />
                      </View>
                    </View>

                    {/* Badges de Legenda Flutuantes */}
                    <View style={[styles.floatingBadge, styles.badgeLeft]}>
                      <Text style={styles.floatingBadgeText}>{t('photoCompare.before')}</Text>
                    </View>
                    <View style={[styles.floatingBadge, styles.badgeRight]}>
                      <Text style={styles.floatingBadgeText}>{t('photoCompare.after')}</Text>
                    </View>
                  </View>

                  {/* Controle de arrasto com PanResponder */}
                  <View {...panResponder.panHandlers} style={[styles.touchTrack, { width: CONTAINER_WIDTH }]}>
                    <Text style={[styles.dragTip, { color: colors.muted }]}>
                      {t('photoCompare.dragTip')}
                    </Text>
                  </View>
                </View>
              ) : (
                /* ÁREA DE VISUALIZAÇÃO: LADO A LADO */
                <View style={styles.sideBySideRow}>
                  <View style={[styles.sideCard, { borderColor: colors.border }]}>
                    <View style={styles.sideHeader}>
                      <Text style={[styles.sideTitle, { color: colors.muted }]}>{t('photoCompare.before')}</Text>
                      <Text style={[styles.sideSub, { color: colors.muted }]}>{formatDate(beforeItem?.date)}</Text>
                    </View>
                    {beforeUrl ? (
                      <Image source={{ uri: beforeUrl }} style={styles.sideImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.sideFallback}>
                        <Text style={{ color: colors.muted }}>{t('photoCompare.noPhoto')}</Text>
                      </View>
                    )}
                    <Text style={[styles.sideWeight, { color: colors.text }]}>{beforeItem?.weight || '--'} kg</Text>
                  </View>

                  <View style={[styles.sideCard, { borderColor: colors.accent }]}>
                    <View style={styles.sideHeader}>
                      <Text style={[styles.sideTitle, { color: colors.accent }]}>{t('photoCompare.after')}</Text>
                      <Text style={[styles.sideSub, { color: colors.accent }]}>{formatDate(afterItem?.date)}</Text>
                    </View>
                    {afterUrl ? (
                      <Image source={{ uri: afterUrl }} style={styles.sideImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.sideFallback}>
                        <Text style={{ color: colors.muted }}>{t('photoCompare.noPhoto')}</Text>
                      </View>
                    )}
                    <Text style={[styles.sideWeight, { color: colors.accent }]}>{afterItem?.weight || '--'} kg</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    alignItems: 'center',
  },
  angleTabs: {
    flexDirection: 'row',
    borderRadius: radius.full,
    borderWidth: 1,
    padding: 3,
    width: '100%',
    marginBottom: 12,
  },
  angleTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  angleTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 14,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  dateBox: {
    flex: 1,
    padding: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  weightBadge: {
    fontSize: 11,
    marginTop: 2,
  },
  deltaBox: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  sliderSection: {
    alignItems: 'center',
  },
  sliderContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  imageLayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  beforeCutLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden',
    zIndex: 2,
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#FFFFFF',
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderHandle: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingBadge: {
    position: 'absolute',
    top: 10,
    zIndex: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeLeft: {
    left: 10,
  },
  badgeRight: {
    right: 10,
  },
  floatingBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  touchTrack: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragTip: {
    fontSize: 12,
    fontWeight: '500',
  },
  sideBySideRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  sideCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: 8,
    alignItems: 'center',
  },
  sideHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  sideTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  sideSub: {
    fontSize: 10,
    marginTop: 1,
  },
  sideImage: {
    width: '100%',
    height: 180,
    borderRadius: radius.sm,
    marginBottom: 6,
  },
  sideFallback: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: radius.sm,
  },
  sideWeight: {
    fontSize: 13,
    fontWeight: '700',
  },
});
