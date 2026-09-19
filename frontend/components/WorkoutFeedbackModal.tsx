import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';
import { radius, space } from '../theme';

interface WorkoutFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (feedback: {
    rpe: number;
    painJoints: string;
    painLevel: number;
    notes: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const JOINTS_OPTIONS = [
  'Nenhum',
  'Joelho',
  'Ombro',
  'Lombar',
  'Cotovelo',
  'Tornozelo',
  'Pulso',
  'Pescoço',
  'Anca',
];

export default function WorkoutFeedbackModal({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}: WorkoutFeedbackModalProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [rpe, setRpe] = useState<number>(7);
  const [selectedJoints, setSelectedJoints] = useState<string[]>(['Nenhum']);
  const [painLevel, setPainLevel] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');

  const toggleJoint = (joint: string) => {
    if (joint === 'Nenhum') {
      setSelectedJoints(['Nenhum']);
      return;
    }
    let updated = selectedJoints.filter((j) => j !== 'Nenhum');
    if (updated.includes(joint)) {
      updated = updated.filter((j) => j !== joint);
      if (updated.length === 0) updated = ['Nenhum'];
    } else {
      updated.push(joint);
    }
    setSelectedJoints(updated);
  };

  const hasPain = !selectedJoints.includes('Nenhum') && selectedJoints.length > 0;

  const getRpeColor = (val: number) => {
    if (val <= 4) return '#10B981'; // Verde
    if (val <= 6) return '#F59E0B'; // Amarelo
    if (val <= 8) return '#F97316'; // Laranja
    return '#EF4444'; // Vermelho
  };

  const getRpeLabel = (val: number) => {
    if (val <= 2) return 'Muito Leve (Aquecimento)';
    if (val <= 4) return 'Leve / Confortável';
    if (val <= 6) return 'Moderado (Bom Estímulo)';
    if (val <= 8) return 'Intenso / Perto do Limite';
    if (val === 9) return 'Muito Intenso (1 rep em reserva)';
    return 'Esforço Máximo / Exaustão Absoluta';
  };

  const handleSubmit = async () => {
    const painJointsStr = selectedJoints.includes('Nenhum') ? 'Nenhum' : selectedJoints.join(', ');
    await onSubmit({
      rpe,
      painJoints: painJointsStr,
      painLevel: hasPain ? painLevel : 0,
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                🎯 Feedback da Sessão
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
                Informa o teu treinador sobre o esforço e estado articular
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* 1. Escala de Esforço RPE */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              1. Nível de Esforço da Sessão (RPE)
            </Text>
            <View style={styles.rpeDisplayRow}>
              <View style={[styles.rpeBadge, { backgroundColor: getRpeColor(rpe) + '22', borderColor: getRpeColor(rpe) }]}>
                <Text style={[styles.rpeBadgeNumber, { color: getRpeColor(rpe) }]}>{rpe}</Text>
                <Text style={[styles.rpeBadgeMax, { color: getRpeColor(rpe) }]}>/10</Text>
              </View>
              <Text style={[styles.rpeLabelText, { color: colors.text }]}>{getRpeLabel(rpe)}</Text>
            </View>

            {/* Seletor numérico de 1 a 10 */}
            <View style={styles.rpeButtonsGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                const isSelected = rpe === val;
                const color = getRpeColor(val);
                return (
                  <TouchableOpacity
                    key={`rpe-${val}`}
                    style={[
                      styles.rpeBtn,
                      {
                        backgroundColor: isSelected ? color : colors.bg,
                        borderColor: isSelected ? color : colors.border,
                      },
                    ]}
                    onPress={() => setRpe(val)}
                  >
                    <Text
                      style={[
                        styles.rpeBtnText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {val}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Dores e Desconfortos Articulares */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: space.lg }]}>
              2. Sentiste dor ou desconforto articular?
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
              Seleciona se sentiste desconforto nalguma articulação durante o treino:
            </Text>

            <View style={styles.chipsWrap}>
              {JOINTS_OPTIONS.map((joint) => {
                const isSelected = selectedJoints.includes(joint);
                const isNone = joint === 'Nenhum';
                return (
                  <TouchableOpacity
                    key={joint}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? (isNone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)')
                          : colors.bg,
                        borderColor: isSelected
                          ? (isNone ? '#10B981' : '#EF4444')
                          : colors.border,
                      },
                    ]}
                    onPress={() => toggleJoint(joint)}
                  >
                    <Ionicons
                      name={isNone ? 'checkmark-circle-outline' : 'warning-outline'}
                      size={14}
                      color={isSelected ? (isNone ? '#10B981' : '#EF4444') : colors.muted}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: isSelected ? (isNone ? '#10B981' : '#EF4444') : colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {joint}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Aviso de Alerta e Intensidade se selecionou dor */}
            {hasPain ? (
              <View style={[styles.painAlertBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444' }]}>
                <View style={styles.painAlertHeader}>
                  <Ionicons name="alert-circle" size={18} color="#EF4444" />
                  <Text style={styles.painAlertTitle}>Aviso de Destaque para o Treinador</Text>
                </View>
                <Text style={[styles.painAlertDesc, { color: colors.text }]}>
                  O teu PT receberá um alerta prioritário para avaliar a causa e ajustar os próximos exercícios antes de haver risco de lesão.
                </Text>

                {/* Intensidade da Dor (1-10) */}
                <Text style={[styles.painLevelTitle, { color: colors.text }]}>
                  Intensidade da dor sentida: <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>{painLevel}/10</Text>
                </Text>
                <View style={styles.painLevelRow}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                    <TouchableOpacity
                      key={`lvl-${lvl}`}
                      style={[
                        styles.painLvlBtn,
                        {
                          backgroundColor: painLevel === lvl ? '#EF4444' : colors.surface,
                          borderColor: painLevel === lvl ? '#EF4444' : colors.border,
                        },
                      ]}
                      onPress={() => setPainLevel(lvl)}
                    >
                      <Text
                        style={[
                          styles.painLvlBtnText,
                          { color: painLevel === lvl ? '#FFF' : colors.text },
                        ]}
                      >
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {/* 3. Notas e Sensações Adicionais */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: space.lg }]}>
              3. Notas para o Treinador (Opcional)
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Ex: Tive boa energia, a carga no supino subiu bem..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </ScrollView>

          {/* Rodapé com Botões */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={[styles.cancelBtnText, { color: colors.muted }]}>Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.accent }]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.bg} />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={18} color={colors.bg} style={{ marginRight: 6 }} />
                  <Text style={[styles.submitBtnText, { color: colors.bg }]}>Concluir Treino</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '90%',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  rpeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  rpeBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginRight: 12,
  },
  rpeBadgeNumber: {
    fontSize: 22,
    fontWeight: '900',
  },
  rpeBadgeMax: {
    fontSize: 13,
    fontWeight: '700',
  },
  rpeLabelText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  rpeButtonsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rpeBtn: {
    width: 32,
    height: 38,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpeBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  painAlertBox: {
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  painAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  painAlertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
  },
  painAlertDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  painLevelTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  painLevelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  painLvlBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  painLvlBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: space.lg,
  },
  footer: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    height: 48,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
