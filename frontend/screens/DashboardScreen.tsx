import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { Card, ProgressBar, Screen } from '../components/ui';
import { colors, radius, space } from '../theme';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();

  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalLogs, setTotalLogs] = useState(0);
  const [weeklyLogs, setWeeklyLogs] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const WEEKLY_GOAL = user?.weeklyGoal || 3;

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!user?.id) return;

        try {
          setIsLoading(true);

          const workoutsResponse = await fetch(`http://192.168.1.80:3000/api/workouts/${user.id}`);
          const workoutsData = await workoutsResponse.json();
          setWorkouts(workoutsData);

          const logsResponse = await fetch(`http://192.168.1.80:3000/api/logs/${user.id}`);
          const logsData = await logsResponse.json();
          setTotalLogs(logsData.length || 0);

          const summedMinutes = logsData.reduce((acc: number, log: any) => {
            return acc + (log.durationMinutes || 0);
          }, 0);
          setTotalMinutes(summedMinutes);

          const now = new Date();
          const dayOfWeek = now.getDay() || 7;

          const monday = new Date(now);
          monday.setDate(now.getDate() - dayOfWeek + 1);
          monday.setHours(0, 0, 0, 0);

          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          sunday.setHours(23, 59, 59, 999);

          const thisWeekLogs = logsData.filter((log: any) => {
            const logDate = new Date(log.createdAt);
            return logDate >= monday && logDate <= sunday;
          });

          setWeeklyLogs(thisWeekLogs.length);
        } catch (error) {
          console.error('Failed to load dashboard:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [user?.id])
  );

  const formatTotalTime = (mins: number) => {
    if (mins === 0) return '0m';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const remaining = Math.max(WEEKLY_GOAL - weeklyLogs, 0);
  let weeklyCopy = 'Start your week with a session.';
  if (weeklyLogs > 0 && weeklyLogs < WEEKLY_GOAL) {
    weeklyCopy = `${remaining} session${remaining === 1 ? '' : 's'} left this week.`;
  } else if (weeklyLogs >= WEEKLY_GOAL) {
    weeklyCopy = 'Weekly goal complete.';
  }

  const progressPercent = Math.min((weeklyLogs / WEEKLY_GOAL) * 100, 100);
  const firstName = user?.name?.split(' ')[0] || 'there';
  const initial = (user?.name || 'U').charAt(0).toUpperCase();

  const renderWorkoutCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.workoutText}>
        <Text style={styles.workoutName}>{item.name}</Text>
        {item.description ? <Text style={styles.workoutDescription} numberOfLines={1}>{item.description}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </TouchableOpacity>
  );

  return (
    <Screen>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkoutCard}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.kicker}>Home</Text>
                <Text style={styles.hello}>Hi, {firstName}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarBtn}>
                {user?.picture ? (
                  <Image source={{ uri: user.picture }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarLetter}>{initial}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{totalLogs}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{formatTotalTime(totalMinutes)}</Text>
                <Text style={styles.statLabel}>Time trained</Text>
              </Card>
            </View>

            <Card style={styles.weekCard}>
              <View style={styles.weekHeader}>
                <Text style={styles.weekTitle}>This week</Text>
                <Text style={styles.weekCount}>
                  {weeklyLogs}/{WEEKLY_GOAL}
                </Text>
              </View>
              <ProgressBar value={progressPercent} />
              <View style={styles.weekFooter}>
                <Text style={styles.weekCopy}>{weeklyCopy}</Text>
                {(user?.currentStreak || 0) > 0 ? (
                  <Text style={styles.streak}>{user?.currentStreak} week streak</Text>
                ) : null}
              </View>
            </Card>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('Nutrition')}>
                <Ionicons name="restaurant-outline" size={20} color={colors.accent} />
                <Text style={styles.actionText}>Nutrition</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('AIGenerator')}>
                <Ionicons name="flash-outline" size={20} color={colors.accent} />
                <Text style={styles.actionText}>AI plan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('CreateWorkout')}>
                <Ionicons name="add" size={20} color={colors.accent} />
                <Text style={styles.actionText}>New workout</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('History')}>
                <Ionicons name="time-outline" size={20} color={colors.accent} />
                <Text style={styles.actionText}>History</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>My workouts</Text>
            {isLoading ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} /> : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? null : (
            <Text style={styles.empty}>No workouts yet. Create one or generate a plan with AI.</Text>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  kicker: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  hello: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginTop: 2,
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: {
    flex: 1,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: colors.text, fontWeight: '700', fontSize: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statCard: { flex: 1 },
  statValue: { color: colors.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  statLabel: { color: colors.muted, fontSize: 13, marginTop: 4 },
  weekCard: { marginBottom: space.lg },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  weekTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  weekCount: { color: colors.accent, fontSize: 16, fontWeight: '700' },
  weekFooter: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  weekCopy: { color: colors.muted, fontSize: 13, flex: 1 },
  streak: { color: colors.text, fontSize: 13, fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: space.lg,
  },
  action: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutText: { flex: 1, marginRight: 8 },
  workoutName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  workoutDescription: { color: colors.muted, fontSize: 13, marginTop: 4 },
  empty: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 12 },
});
