import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Share, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { BackButton, Button, Screen, showAlert, Subtitle, Title } from '../components/ui';
import { colors, radius, space } from '../theme';

export default function HistoryScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        if (!user?.id) return;
        try {
          setIsLoading(true);
          const response = await fetch(`http://192.168.1.80:3000/api/logs/${user.id}`);
          const data = await response.json();
          setLogs(data);
        } catch (error) {
          console.error('Failed to load history:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchHistory();
    }, [user?.id])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async (workoutName: string, durationMinutes: number) => {
    try {
      await Share.share({
        message: `I just finished ${workoutName} in ${durationMinutes} min on Fit AI Tracker.`,
      });
    } catch (error: any) {
      console.error('Share failed:', error.message);
    }
  };

  const exportToCSV = async () => {
    if (logs.length === 0) {
      showAlert('Nothing to export', 'Finish a workout first.');
      return;
    }

    try {
      const headerString = 'Date,Workout Name,Duration (minutes)\n';
      const rowString = logs
        .map((log) => {
          const date = new Date(log.createdAt).toLocaleDateString('en-GB');
          const name = log.workout?.name || 'Deleted workout';
          const duration = log.durationMinutes || 0;
          return `${date},"${name}",${duration}`;
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
            dialogTitle: 'Export workout history',
            UTI: 'public.comma-separated-values-text',
          });
        } else {
          showAlert('Error', 'Sharing is not available on this device.');
        }
      }
    } catch (error) {
      console.error('CSV export failed:', error);
      showAlert('Error', 'Could not export your data.');
    }
  };

  const renderLog = ({ item }: any) => {
    const workoutName = item.workout?.name || 'Deleted workout';
    const duration = item.durationMinutes || 0;

    return (
      <View style={styles.logCard}>
        <View style={styles.logInfo}>
          <Text style={styles.workoutName}>{workoutName}</Text>
          <Text style={styles.meta}>
            {formatDate(item.createdAt)}
            {duration > 0 ? `  ·  ${duration} min` : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare(workoutName, duration)}>
          <Ionicons name="share-outline" size={18} color={colors.muted} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} label="Home" />
        <Title>History</Title>
        <Subtitle>Your completed sessions.</Subtitle>
        <View style={{ marginTop: 16 }}>
          <Button title="Export CSV" variant="secondary" icon="download-outline" onPress={exportToCSV} />
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
          ListEmptyComponent={<Text style={styles.empty}>No completed workouts yet. Finish a session to see it here.</Text>}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.lg },
  list: { paddingHorizontal: space.lg, paddingTop: 16, paddingBottom: 32 },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logInfo: { flex: 1 },
  workoutName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  meta: { fontSize: 13, color: colors.muted },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  empty: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 28, lineHeight: 22 },
});
