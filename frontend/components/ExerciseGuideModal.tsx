import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';
import { ColorScheme, radius, space } from '../theme';

interface ExerciseGuideModalProps {
  visible: boolean;
  exercise: {
    id: string;
    name: string;
    notes?: string | null;
    videoUrl?: string | null;
  } | null;
  onClose: () => void;
  onSaveVideoUrl?: (exerciseId: string, url: string) => Promise<void>;
  isCoach?: boolean;
}

interface BiomechanicsCue {
  setup: string;
  execution: string;
  mistakes: string;
  target: string;
}

function getBiomechanicsCues(name: string): BiomechanicsCue {
  const n = name.toLowerCase();

  if (n.includes('supin') || n.includes('bench') || n.includes('peit')) {
    return {
      target: 'Grande Peitoral, Deltoide Anterior e Tríceps Braquial',
      setup: 'Retrai e deprime as escápulas ("guarda as omoplatas nos bolsos de trás"). Pés firmes no chão com leve arco lombar natural.',
      execution: 'Desce a carga de forma controlada (2-3s) alinhando os cotovelos a cerca de 45-60º do tronco. Empurra em linha reta expirando na subida.',
      mistakes: 'Descolar as escápulas do banco no topo, bater a barra no peito com balanço ou abrir excessivamente os cotovelos a 90º.',
    };
  }

  if (n.includes('prens') || n.includes('leg press') || n.includes('hack') || n.includes('agach')) {
    return {
      target: 'Quadríceps, Glúteos Máximos e Gémeos',
      setup: 'Apoia toda a lombar e glúteos na almofada. Pés à largura dos ombros na plataforma, com joelhos a apontar na direção dos dedos dos pés.',
      execution: 'Flexiona os joelhos até cerca de 90º ou o máximo sem curvar a bacia ("sem retroversão pélvica"). Empurra com o calcanhar e meio do pé.',
      mistakes: 'Bloquear/travar os joelhos em hiperextensão no topo, deixar os joelhos colapsarem para dentro (valgo dinâmico) ou levantar a lombar do assento.',
    };
  }

  if (n.includes('puxad') || n.includes('lat') || n.includes('pulldown') || n.includes('remad')) {
    return {
      target: 'Grande Dorsal, Redondo Maior, Romboides e Bíceps',
      setup: 'Ajusta o apoio das pernas bem firme. Peito aberto, ombros longe das orelhas e abdómen ativo.',
      execution: 'Inicia o movimento puxando os cotovelos para baixo e para trás ("pensa em guardar os cotovelos na cintura"). Pausa 1 segundo no pico de contração.',
      mistakes: 'Puxar com os braços em vez das costas, inclinar excessivamente o tronco para trás ou balançar o corpo para criar inércia.',
    };
  }

  if (n.includes('militar') || n.includes('ombr') || n.includes('lateral') || n.includes('shoulder')) {
    return {
      target: 'Deltoides (Anterior, Lateral e Posterior) e Trapézio Superior',
      setup: 'Glúteos e abdómen contraídos para proteger a lombar. Ombros nivelados.',
      execution: 'Eleva a carga com controlo no plano escapular (ligeiramente à frente do corpo). Não uses impulso dos joelhos.',
      mistakes: 'Arquear a zona lombar para trás, encolher os ombros junto às orelhas ou descer a carga sem controlo.',
    };
  }

  if (n.includes('rdl') || n.includes('romeno') || n.includes('morto') || n.includes('curl de perna') || n.includes('glút')) {
    return {
      target: 'Isquiotibiais (Posterior da Coxa) e Glúteos',
      setup: 'Pés alinhados por baixo dos quadris. Joelhos com ligeira flexão fixa durante todo o movimento. Coluna neutra.',
      execution: 'Move a bacia para trás como se quisesses fechar uma porta com o glúteo ("hinge de quadril"). Desce apenas até onde a tua flexibilidade mantiver as costas retas.',
      mistakes: 'Arredondar a coluna lombar, dobrar excessivamente os joelhos transformando em agachamento ou olhar para cima forçando o pescoço.',
    };
  }

  if (n.includes('curl') || n.includes('bícep')) {
    return {
      target: 'Bíceps Braquial, Braquial Anterior e Braquiorradial',
      setup: 'Cotovelos alinhados junto às costelas, punhos firmes e estáveis.',
      execution: 'Flexiona o antebraço contraindo o bíceps no topo sem avançar os cotovelos. Desce controlando em 3 segundos.',
      mistakes: 'Balançar o tronco para a frente e para trás, afastar os cotovelos do tronco ou relaxar a descida.',
    };
  }

  if (n.includes('trícep') || n.includes('dips') || n.includes('fundo') || n.includes('testa')) {
    return {
      target: 'Tríceps Braquial (Cabeça Longa, Lateral e Medial)',
      setup: 'Cotovelos fixos apontados para a frente ou paralelos. Ombros estáveis.',
      execution: 'Estende o antebraço até à contração máxima do tríceps. Mantém os braços firmes sem balançar.',
      mistakes: 'Abrir os cotovelos para os lados, mexer os ombros ou usar o peso do corpo para empurrar.',
    };
  }

  return {
    target: 'Músculos principais do movimento',
    setup: 'Ajusta o equipamento ao teu tamanho, mantém o core ativo e as escápulas estáveis.',
    execution: 'Movimento cadenciado: 2 segundos na fase excêntrica (descida) e 1 segundo na fase concêntrica (subida/esforço).',
    mistakes: 'Usar peso excessivo sacrificando a amplitude ou realizar repetições incompletas com balanço.',
  };
}

export const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({
  visible,
  exercise,
  onClose,
  onSaveVideoUrl,
  isCoach = false,
}) => {
  const { colors, mode } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => getStyles(colors, mode), [colors, mode]);

  const [inputUrl, setInputUrl] = useState(exercise?.videoUrl || '');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const cues = useMemo(() => {
    return getBiomechanicsCues(exercise?.name || '');
  }, [exercise?.name]);

  const handleOpenVideo = async () => {
    if (exercise?.videoUrl) {
      try {
        await WebBrowser.openBrowserAsync(exercise.videoUrl);
      } catch (err: any) {
        Alert.alert(t('common.error'), 'Não foi possível abrir o link do vídeo.');
      }
    } else {
      // Abre pesquisa direta no YouTube com a técnica exata
      const query = encodeURIComponent(`${exercise?.name || 'exercicio'} como fazer execucao tecnica correta`);
      const url = `https://www.youtube.com/results?search_query=${query}`;
      try {
        await WebBrowser.openBrowserAsync(url);
      } catch (err: any) {
        Alert.alert(t('common.error'), 'Não foi possível abrir o navegador.');
      }
    }
  };

  const handleSaveUrl = async () => {
    if (!exercise?.id || !onSaveVideoUrl) return;
    try {
      setIsSaving(true);
      await onSaveVideoUrl(exercise.id, inputUrl.trim());
      setIsEditingUrl(false);
      Alert.alert(t('common.success'), t('exerciseGuide.videoUrlSaved'));
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Erro ao guardar link.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!exercise) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.badge}>
                <Ionicons name="fitness-outline" size={13} color={colors.accent} />
                <Text style={styles.badgeText}>{t('exerciseGuide.title')}</Text>
              </View>
              <Text style={styles.exerciseName} numberOfLines={2}>
                {exercise.name}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Bloco de Vídeo / Acesso Rápido */}
            <View style={styles.videoCard}>
              <View style={styles.videoCardHeader}>
                <Ionicons name="videocam-outline" size={20} color={colors.accent} />
                <Text style={styles.videoCardTitle}>{t('exerciseGuide.videoDemoTitle')}</Text>
              </View>
              <Text style={styles.videoCardDesc}>
                {exercise.videoUrl
                  ? 'Vídeo demonstrativo configurado para este exercício.'
                  : 'Assiste à demonstração técnica da biomecânica e alinhamento articular.'}
              </Text>

              <TouchableOpacity style={styles.watchBtn} onPress={handleOpenVideo} activeOpacity={0.8}>
                <Ionicons name="play-circle" size={20} color={colors.bg} />
                <Text style={styles.watchBtnText}>
                  {exercise.videoUrl ? 'Ver Vídeo de Demonstração ▶️' : t('exerciseGuide.watchOnYoutube')}
                </Text>
              </TouchableOpacity>

              {/* Botão de Edição de URL pelo Treinador */}
              {isCoach && onSaveVideoUrl && (
                <View style={{ marginTop: 12 }}>
                  {!isEditingUrl ? (
                    <TouchableOpacity style={styles.editUrlToggle} onPress={() => setIsEditingUrl(true)}>
                      <Ionicons name="link-outline" size={14} color={colors.muted} />
                      <Text style={styles.editUrlToggleText}>{t('exerciseGuide.editVideoUrl')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.urlEditBox}>
                      <TextInput
                        style={styles.urlInput}
                        placeholder={t('exerciseGuide.videoUrlPlaceholder')}
                        placeholderTextColor={colors.muted}
                        value={inputUrl}
                        onChangeText={setInputUrl}
                        autoCapitalize="none"
                      />
                      <View style={styles.urlBtnRow}>
                        <TouchableOpacity
                          style={styles.cancelUrlBtn}
                          onPress={() => setIsEditingUrl(false)}
                          disabled={isSaving}
                        >
                          <Text style={styles.cancelUrlText}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveUrlBtn} onPress={handleSaveUrl} disabled={isSaving}>
                          {isSaving ? (
                            <ActivityIndicator size="small" color={colors.bg} />
                          ) : (
                            <Text style={styles.saveUrlText}>{t('common.save')}</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Músculos Alvo */}
            <View style={styles.cueBox}>
              <View style={styles.cueHeader}>
                <Ionicons name="body-outline" size={16} color={colors.accent} />
                <Text style={styles.cueTitle}>{t('exerciseGuide.targetMuscles')}</Text>
              </View>
              <Text style={styles.cueText}>{cues.target}</Text>
            </View>

            {/* Instruções do Treinador se existirem */}
            {exercise.notes ? (
              <View style={[styles.cueBox, { borderColor: colors.accent }]}>
                <View style={styles.cueHeader}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.accent} />
                  <Text style={[styles.cueTitle, { color: colors.accent }]}>Nota do teu Treinador</Text>
                </View>
                <Text style={[styles.cueText, { fontWeight: '600' }]}>{exercise.notes}</Text>
              </View>
            ) : null}

            {/* 1. Posicionamento Inicial */}
            <View style={styles.cueBox}>
              <View style={styles.cueHeader}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                <Text style={styles.cueTitle}>{t('exerciseGuide.setupTitle')}</Text>
              </View>
              <Text style={styles.cueText}>{cues.setup}</Text>
            </View>

            {/* 2. Execução & Respiração */}
            <View style={styles.cueBox}>
              <View style={styles.cueHeader}>
                <Ionicons name="sync-outline" size={16} color="#3B82F6" />
                <Text style={styles.cueTitle}>{t('exerciseGuide.executionTitle')}</Text>
              </View>
              <Text style={styles.cueText}>{cues.execution}</Text>
            </View>

            {/* 3. Erros Comuns */}
            <View style={[styles.cueBox, { borderColor: 'rgba(239, 68, 68, 0.25)' }]}>
              <View style={styles.cueHeader}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
                <Text style={[styles.cueTitle, { color: colors.danger }]}>{t('exerciseGuide.mistakesTitle')}</Text>
              </View>
              <Text style={styles.cueText}>{cues.mistakes}</Text>
            </View>
          </ScrollView>
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
      height: '84%',
      paddingHorizontal: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surface2,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.full,
      alignSelf: 'flex-start',
      marginBottom: 4,
    },
    badgeText: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: '700',
    },
    exerciseName: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    closeBtn: {
      padding: 6,
      borderRadius: radius.full,
      backgroundColor: colors.surface2,
    },
    scrollBody: {
      flex: 1,
    },
    videoCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 14,
    },
    videoCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    videoCardTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    videoCardDesc: {
      fontSize: 12,
      color: colors.muted,
      marginBottom: 12,
      lineHeight: 16,
    },
    watchBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.accent,
      borderRadius: radius.md,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    watchBtnText: {
      color: colors.bg,
      fontSize: 13,
      fontWeight: '700',
    },
    editUrlToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      justifyContent: 'center',
      paddingVertical: 4,
    },
    editUrlToggleText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '600',
    },
    urlEditBox: {
      backgroundColor: colors.surface2,
      borderRadius: radius.sm,
      padding: 10,
      gap: 8,
    },
    urlInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: colors.text,
      fontSize: 12,
    },
    urlBtnRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    cancelUrlBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    cancelUrlText: {
      color: colors.muted,
      fontSize: 12,
    },
    saveUrlBtn: {
      backgroundColor: colors.accent,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: radius.sm,
    },
    saveUrlText: {
      color: colors.bg,
      fontSize: 12,
      fontWeight: '700',
    },
    cueBox: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 10,
    },
    cueHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    cueTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    cueText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
    },
  });
