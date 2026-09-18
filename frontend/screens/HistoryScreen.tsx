import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Share, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { BackButton, Button, Card, Screen, showAlert, Subtitle, Title } from '../components/ui';
import { ColorScheme, radius, space } from '../theme';
import { api } from '../services/api';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';

export default function HistoryScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { colors, mode } = useTheme();
  const { t, language } = useLanguage();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        if (!user?.id) return;
        try {
          setIsLoading(true);
          const data = await api.get(`/api/logs/${user.id}`);
          setLogs(data || []);
        } catch (error) {
          console.error('Falha ao carregar histórico:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchHistory();
    }, [user?.id])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeMap: Record<string, string> = { pt: 'pt-PT', en: 'en-US', es: 'es-ES', fr: 'fr-FR' };
    return date.toLocaleDateString(localeMap[language] || 'pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleShare = async (workoutName: string, durationMinutes: number) => {
    try {
      await Share.share({
        message: t('history.workoutCompletedShare', { workoutName, duration: durationMinutes }),
      });
    } catch (error: any) {
      console.error('Falha ao partilhar:', error.message);
    }
  };

  const exportToCSV = async () => {
    if (logs.length === 0) {
      showAlert(t('history.noData'), t('history.noDataToExport'));
      return;
    }

    try {
      const headerString = 'Date,Workout,Duration(min),Notes\n';
      const localeMap: Record<string, string> = { pt: 'pt-PT', en: 'en-US', es: 'es-ES', fr: 'fr-FR' };
      const rowString = logs
        .map((log) => {
          const date = new Date(log.createdAt).toLocaleDateString(localeMap[language] || 'pt-PT');
          const name = log.workout?.name || t('history.workoutCompletedDefault');
          const duration = log.durationMinutes || 0;
          const notes = log.notes ? `"${log.notes.replace(/"/g, '""')}"` : '""';
          return `${date},"${name}",${duration},${notes}`;
        })
        .join('\n');

      const csvString = `${headerString}${rowString}`;
      const fileName = `workout_history_${new Date().getTime()}.csv`;

      if (Platform.OS === 'web') {
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, csvString, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: t('history.exportCSV'),
            UTI: 'public.comma-separated-values-text',
          });
        } else {
          showAlert(t('common.attention'), t('history.shareNotAvailable'));
        }
      }
    } catch (error) {
      console.error('Falha na exportação CSV:', error);
      showAlert(t('common.error'), t('history.csvExportError'));
    }
  };

  const renderLog = ({ item }: any) => {
    const workoutName = item.workout?.name || t('history.workoutCompletedDefault');
    const duration = item.durationMinutes || 0;

    // Agrupar séries por exercício
    const setsByExercise: Record<string, any[]> = {};
    (item.setLogs || []).forEach((set: any) => {
      const name = set.exerciseName || t('workouts.exerciseName');
      if (!setsByExercise[name]) setsByExercise[name] = [];
      setsByExercise[name].push(set);
    });

    return (
      <Card style={styles.logCard}>
        <View style={styles.logTop}>
          <View style={styles.logInfo}>
            <Text style={styles.workoutName}>{workoutName}</Text>
            <Text style={styles.meta}>
              {formatDate(item.createdAt)}
              {duration > 0 ? `  ·  ${duration} min` : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare(workoutName, duration)}>
            <Ionicons name="share-outline" size={17} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        ) : null}

        {Object.keys(setsByExercise).length > 0 ? (
          <View style={styles.setsContainer}>
            {Object.entries(setsByExercise).map(([exName, sets]) => (
              <View key={exName} style={styles.exerciseRow}>
                <Text style={styles.exerciseTitle}>{exName}</Text>
                <Text style={styles.exerciseSets}>
                  {sets.map((s) => `${s.reps} reps × ${s.weight || 0} kg`).join('  ·  ')}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Title>{t('history.title')}</Title>
        <Subtitle>{t('history.subtitle')}</Subtitle>
        <View style={{ marginTop: 14 }}>
          <Button
            title={t('history.exportCSV')}
            variant="secondary"
            icon="download-outline"
            onPress={exportToCSV}
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderLog}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {t('history.noLogs')}
            </Text>
          }
        />
      )}
    </Screen>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  header: { paddingHorizontal: space.lg },
  list: { paddingHorizontal: space.lg, paddingTop: 16, paddingBottom: 32 },
  logCard: {
    marginBottom: 12,
    padding: 14,
  },
  logTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logInfo: { flex: 1 },
  workoutName: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  meta: { fontSize: 13, color: colors.muted },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  notesBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  notesText: {
    color: colors.text,
    fontSize: 13,
  },
  setsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 6,
  },
  exerciseRow: {
    backgroundColor: colors.surface2,
    padding: 8,
    borderRadius: radius.sm,
  },
  exerciseTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseSets: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 32, lineHeight: 22 },
});
