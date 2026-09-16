import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useAuthStore } from './store/useAuthStore';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import CreateWorkoutScreen from './screens/CreateWorkoutScreen';
import WorkoutDetailsScreen from './screens/WorkoutDetailsScreen';
import AddExerciseScreen from './screens/AddExerciseScreen';
import AIGeneratorScreen from './screens/AIGeneratorScreen';
import EditExerciseScreen from './screens/EditExerciseScreen';
import HistoryScreen from './screens/HistoryScreen';
import NutritionScreen from './screens/NutritionScreen';
import { colors } from './theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

export default function App() {
  const { user, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          {user ? (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="CreateWorkout" component={CreateWorkoutScreen} />
              <Stack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} />
              <Stack.Screen name="AddExercise" component={AddExerciseScreen} />
              <Stack.Screen name="AIGenerator" component={AIGeneratorScreen} />
              <Stack.Screen name="EditExercise" component={EditExerciseScreen} />
              <Stack.Screen name="History" component={HistoryScreen} />
              <Stack.Screen name="Nutrition" component={NutritionScreen} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
