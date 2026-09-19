import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';
import { ColorScheme, radius, space } from '../theme';

export interface ExerciseAlternative {
  name: string;
  muscleGroup: string;
  equipmentType: 'dumbbell' | 'cable' | 'machine' | 'barbell' | 'bodyweight';
}

const EXERCISE_CATALOG: ExerciseAlternative[] = [
  // Quadríceps & Pernas
  { name: 'Prensa 45º (Leg Press)', muscleGroup: 'Quadríceps', equipmentType: 'machine' },
  { name: 'Agachamento Hack', muscleGroup: 'Quadríceps', equipmentType: 'machine' },
  { name: 'Agachamento com Barra', muscleGroup: 'Quadríceps', equipmentType: 'barbell' },
  { name: 'Agachamento Búlgaro com Halteres', muscleGroup: 'Quadríceps', equipmentType: 'dumbbell' },
  { name: 'Extensão de Pernas (Leg Extension)', muscleGroup: 'Quadríceps', equipmentType: 'machine' },
  { name: 'Agachamento Goblet', muscleGroup: 'Quadríceps', equipmentType: 'dumbbell' },
  { name: 'Passadas / Lunges com Halteres', muscleGroup: 'Quadríceps', equipmentType: 'dumbbell' },
  { name: 'Prensa Horizontal', muscleGroup: 'Quadríceps', equipmentType: 'machine' },

  // Isquiotibiais & Glúteos
  { name: 'Peso Morto Romeno (RDL com Barra)', muscleGroup: 'Posterior & Glúteos', equipmentType: 'barbell' },
  { name: 'Peso Morto Romeno com Halteres', muscleGroup: 'Posterior & Glúteos', equipmentType: 'dumbbell' },
  { name: 'Flexão de Pernas Deitado (Leg Curl)', muscleGroup: 'Posterior & Glúteos', equipmentType: 'machine' },
  { name: 'Flexão de Pernas Sentado', muscleGroup: 'Posterior & Glúteos', equipmentType: 'machine' },
  { name: 'Elevação Pélvica (Hip Thrust)', muscleGroup: 'Posterior & Glúteos', equipmentType: 'barbell' },
  { name: 'Hip Thrust em Máquina', muscleGroup: 'Posterior & Glúteos', equipmentType: 'machine' },

  // Peitoral
  { name: 'Supino Reto com Barra', muscleGroup: 'Peitoral', equipmentType: 'barbell' },
  { name: 'Supino Reto com Halteres', muscleGroup: 'Peitoral', equipmentType: 'dumbbell' },
  { name: 'Supino Inclinado com Halteres', muscleGroup: 'Peitoral', equipmentType: 'dumbbell' },
  { name: 'Supino Inclinado com Barra', muscleGroup: 'Peitoral', equipmentType: 'barbell' },
  { name: 'Supino em Máquina Convergente', muscleGroup: 'Peitoral', equipmentType: 'machine' },
  { name: 'Crossover no Cabo', muscleGroup: 'Peitoral', equipmentType: 'cable' },
  { name: 'Aberturas com Halteres (Flyes)', muscleGroup: 'Peitoral', equipmentType: 'dumbbell' },
  { name: 'Peck Deck / Voador', muscleGroup: 'Peitoral', equipmentType: 'machine' },
  { name: 'Flexões de Braço (Push-ups)', muscleGroup: 'Peitoral', equipmentType: 'bodyweight' },

  // Costas & Dorsal
  { name: 'Puxada Alta ao Peito (Lat Pulldown)', muscleGroup: 'Costas', equipmentType: 'cable' },
  { name: 'Puxada com Triângulo', muscleGroup: 'Costas', equipmentType: 'cable' },
  { name: 'Remada com Cabo Sentado (Low Row)', muscleGroup: 'Costas', equipmentType: 'cable' },
  { name: 'Remada Curvada com Barra', muscleGroup: 'Costas', equipmentType: 'barbell' },
  { name: 'Remada Unilateral com Haltere (Serrote)', muscleGroup: 'Costas', equipmentType: 'dumbbell' },
  { name: 'Remada com Apoio no Peito (Chest-supported)', muscleGroup: 'Costas', equipmentType: 'dumbbell' },
  { name: 'Elevações em Barra Fixa (Pull-ups)', muscleGroup: 'Costas', equipmentType: 'bodyweight' },
  { name: 'Remada em Máquina', muscleGroup: 'Costas', equipmentType: 'machine' },

  // Ombros
  { name: 'Press Militar com Halteres Sentado', muscleGroup: 'Ombros', equipmentType: 'dumbbell' },
  { name: 'Press Militar com Barra em Pé', muscleGroup: 'Ombros', equipmentType: 'barbell' },
  { name: 'Press de Ombros em Máquina', muscleGroup: 'Ombros', equipmentType: 'machine' },
  { name: 'Elevações Laterais com Halteres', muscleGroup: 'Ombros', equipmentType: 'dumbbell' },
  { name: 'Elevações Laterais no Cabo', muscleGroup: 'Ombros', equipmentType: 'cable' },
  { name: 'Face Pulls no Cabo', muscleGroup: 'Ombros', equipmentType: 'cable' },
  { name: 'Deltoide Posterior no Peck Deck', muscleGroup: 'Ombros', equipmentType: 'machine' },

  // Bíceps
  { name: 'Curl com Barra W', muscleGroup: 'Bíceps', equipmentType: 'barbell' },
  { name: 'Curl com Halteres Alternado', muscleGroup: 'Bíceps', equipmentType: 'dumbbell' },
  { name: 'Curl Martelo com Halteres', muscleGroup: 'Bíceps', equipmentType: 'dumbbell' },
  { name: 'Curl Bíceps no Cabo', muscleGroup: 'Bíceps', equipmentType: 'cable' },
  { name: 'Curl Scott / Banco Preacher', muscleGroup: 'Bíceps', equipmentType: 'machine' },

  // Tríceps
  { name: 'Tríceps com Corda no Cabo', muscleGroup: 'Tríceps', equipmentType: 'cable' },
  { name: 'Tríceps com Barra Reta no Cabo', muscleGroup: 'Tríceps', equipmentType: 'cable' },
  { name: 'Tríceps Testa com Barra W', muscleGroup: 'Tríceps', equipmentType: 'barbell' },
  { name: 'Extensão Tríceps com Haltere Acima da Cabeça', muscleGroup: 'Tríceps', equipmentType: 'dumbbell' },
  { name: 'Fundos em Paralelas (Dips)', muscleGroup: 'Tríceps', equipmentType: 'bodyweight' },

  // Core & Abdominais
  { name: 'Prancha Abdominal', muscleGroup: 'Abdominais', equipmentType: 'bodyweight' },
  { name: 'Crunch na Polia Alta', muscleGroup: 'Abdominais', equipmentType: 'cable' },
  { name: 'Elevação de Pernas em Barra Fixa', muscleGroup: 'Abdominais', equipmentType: 'bodyweight' },
  { name: 'Roda Abdominal (Ab Wheel)', muscleGroup: 'Abdominais', equipmentType: 'bodyweight' },
];

function detectMuscleGroup(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes('leg') || n.includes('prens') || n.includes('prensa') || n.includes('agach') || n.includes('quad') || n.includes('extens') || n.includes('lunge') || n.includes('passad')) {
    return 'Quadríceps';
  }
  if (n.includes('rdl') || n.includes('romeno') || n.includes('curl de pernas') || n.includes('flex') && n.includes('perna') || n.includes('glút') || n.includes('hip thrust')) {
    return 'Posterior & Glúteos';
  }
  if (n.includes('supin') || n.includes('peit') || n.includes('bench') || n.includes('cross') || n.includes('voador') || n.includes('peck') || n.includes('flexõ')) {
    return 'Peitoral';
  }
  if (n.includes('puxad') || n.includes('remad') || n.includes('dorsal') || n.includes('costas') || n.includes('lat') || n.includes('pulldown') || n.includes('elev') && n.includes('barra')) {
    return 'Costas';
  }
  if (n.includes('militar') || n.includes('ombr') || n.includes('latera') || n.includes('shoulder') || n.includes('face pull') || n.includes('deltoid')) {
    return 'Ombros';
  }
  if (n.includes('bícep') || n.includes('bicep') || n.includes('curl') && !n.includes('perna')) {
    return 'Bíceps';
  }
  if (n.includes('trícep') || n.includes('tricep') || n.includes('testa') || n.includes('dips') || n.includes('fundo')) {
    return 'Tríceps';
  }
  if (n.includes('abdom') || n.includes('core') || n.includes('pranch') || n.includes('crunch')) {
    return 'Abdominais';
  }
  return null;
}

interface SubstituteExerciseModalProps {
  visible: boolean;
  currentExerciseName: string;
  onClose: () => void;
  onSubstitute: (newExerciseName: string) => Promise<void>;
}

export const SubstituteExerciseModal: React.FC<SubstituteExerciseModalProps> = ({
  visible,
  currentExerciseName,
  onClose,
  onSubstitute,
}) => {
  const { colors, mode } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => getStyles(colors, mode), [colors, mode]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('RECOMMENDED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detectedGroup = useMemo(() => {
    return detectMuscleGroup(currentExerciseName) || 'Quadríceps';
  }, [currentExerciseName]);

  const filteredList = useMemo(() => {
    let list = EXERCISE_CATALOG;

    if (search.trim()) {
      const q = search.toLowerCase();
      return list.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) || ex.muscleGroup.toLowerCase().includes(q)
      );
    }

    if (selectedCategory === 'RECOMMENDED') {
      return list.filter((ex) => ex.muscleGroup === detectedGroup && ex.name !== currentExerciseName);
    } else if (selectedCategory !== 'ALL') {
      return list.filter((ex) => ex.muscleGroup === selectedCategory && ex.name !== currentExerciseName);
    }

    return list.filter((ex) => ex.name !== currentExerciseName);
  }, [search, selectedCategory, detectedGroup, currentExerciseName]);

  const handleSelect = (item: ExerciseAlternative) => {
    Alert.alert(
      t('substituteExercise.confirmSwapTitle'),
      t('substituteExercise.confirmSwapMessage')
        .replace('{oldName}', currentExerciseName)
        .replace('{newName}', item.name),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'default',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await onSubstitute(item.name);
              onClose();
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || 'Erro ao substituir exercício.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const categories = [
    { key: 'RECOMMENDED', label: `⭐ ${t('substituteExercise.sameGroupTag')} (${detectedGroup})` },
    { key: 'ALL', label: t('substituteExercise.allEquivalents') },
    { key: 'Quadríceps', label: 'Quadríceps' },
    { key: 'Posterior & Glúteos', label: 'Posterior & Glúteos' },
    { key: 'Peitoral', label: 'Peitoral' },
    { key: 'Costas', label: 'Costas' },
    { key: 'Ombros', label: 'Ombros' },
    { key: 'Bíceps', label: 'Bíceps' },
    { key: 'Tríceps', label: 'Tríceps' },
  ];

  const getEquipmentTag = (eq: ExerciseAlternative['equipmentType']) => {
    switch (eq) {
      case 'dumbbell':
        return t('substituteExercise.dumbbellAltTag');
      case 'cable':
        return t('substituteExercise.cableAltTag');
      case 'machine':
        return t('substituteExercise.machineAltTag');
      case 'barbell':
        return 'Com Barra';
      default:
        return 'Peso Corporal';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.headerRow}>
                <Ionicons name="swap-horizontal" size={20} color={colors.accent} />
                <Text style={styles.title}>{t('substituteExercise.modalTitle')}</Text>
              </View>
              <Text style={styles.currentName} numberOfLines={1}>
                Atual: {currentExerciseName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Subtítulo explicativo */}
          <Text style={styles.subtitle}>{t('substituteExercise.modalSubtitle')}</Text>

          {/* Campo de Pesquisa */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={colors.muted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('substituteExercise.searchPlaceholder')}
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={setSearch}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Filtros em Chips */}
          <View style={styles.filterScroll}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(cat) => cat.key}
              renderItem={({ item }) => {
                const isSelected = selectedCategory === item.key;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(item.key)}
                    style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                  >
                    <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Lista de Exercícios Alternativos */}
          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>A substituir exercício...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredList}
              keyExtractor={(item) => item.name}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity style={styles.exerciseCard} onPress={() => handleSelect(item)} activeOpacity={0.7}>
                    <View style={styles.cardLeft}>
                      <Text style={styles.exerciseName}>{item.name}</Text>
                      <View style={styles.tagsRow}>
                        <View style={styles.groupBadge}>
                          <Text style={styles.groupBadgeText}>{item.muscleGroup}</Text>
                        </View>
                        <View style={styles.equipmentBadge}>
                          <Text style={styles.equipmentBadgeText}>{getEquipmentTag(item.equipmentType)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.swapActionBtn}>
                      <Ionicons name="swap-horizontal" size={18} color={colors.accent} />
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={36} color={colors.muted} />
                  <Text style={styles.emptyText}>Nenhum exercício alternativo encontrado com esse filtro.</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: ColorScheme, mode: string) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.bg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: '82%',
      paddingHorizontal: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 6,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    currentName: {
      fontSize: 12,
      color: colors.accent,
      fontWeight: '600',
      marginTop: 2,
    },
    closeBtn: {
      padding: 6,
      borderRadius: radius.full,
      backgroundColor: colors.surface2,
    },
    subtitle: {
      fontSize: 12,
      color: colors.muted,
      marginBottom: 12,
      lineHeight: 16,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 10,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
    },
    filterScroll: {
      marginBottom: 12,
    },
    categoryChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.surface,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    categoryChipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    categoryChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    categoryChipTextActive: {
      color: colors.bg,
      fontWeight: '700',
    },
    exerciseCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 8,
    },
    cardLeft: {
      flex: 1,
      paddingRight: 10,
    },
    exerciseName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    tagsRow: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
    },
    groupBadge: {
      backgroundColor: colors.surface2,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.sm,
    },
    groupBadgeText: {
      fontSize: 11,
      color: colors.accent,
      fontWeight: '600',
    },
    equipmentBadge: {
      backgroundColor: 'rgba(255,255,255,0.06)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.sm,
    },
    equipmentBadgeText: {
      fontSize: 11,
      color: colors.muted,
      fontWeight: '500',
    },
    swapActionBtn: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 36,
      gap: 8,
    },
    emptyText: {
      color: colors.muted,
      fontSize: 13,
      textAlign: 'center',
      maxWidth: 240,
    },
  });
