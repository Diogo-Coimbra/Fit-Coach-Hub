import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useFocusEffect } from '@react-navigation/native';
import { BackButton, Button, Card, Screen, showAlert, Title } from '../components/ui';
import { colors, radius, space } from '../theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, setUser } = useAuthStore();

  const [profilePic, setProfilePic] = useState(user?.picture);
  const [imageError, setImageError] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [tempGoal, setTempGoal] = useState(user?.weeklyGoal || 3);
  const [isSaving, setIsSaving] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [isSavingWeight, setIsSavingWeight] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchWeights = async () => {
        if (!user?.id) return;
        try {
          const response = await fetch(`http://192.168.1.80:3000/api/metrics/weight/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setWeightHistory(data);
          }
        } catch (error) {
          console.error('Failed to load weight history:', error);
        }
      };
      fetchWeights();
    }, [user?.id])
  );

  const saveProfileToDB = async (updateData: any) => {
    if (!user || !user.id) return false;
    try {
      setIsSaving(true);
      const response = await fetch(`http://192.168.1.80:3000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        return true;
      }
      throw new Error('Failed to update profile.');
    } catch (error) {
      console.error('Failed to save profile:', error);
      showAlert('Error', 'Could not save your changes.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const newPicUri = result.assets[0].uri;
      setProfilePic(newPicUri);
      setImageError(false);
      await saveProfileToDB({ picture: newPicUri });
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      showAlert('Name required', 'Please enter a name.');
      return;
    }
    const success = await saveProfileToDB({ name: tempName });
    if (success) {
      setDisplayName(tempName);
      setIsEditingName(false);
    }
  };

  const adjustGoal = (amount: number) => {
    setTempGoal((prev) => {
      const newGoal = prev + amount;
      if (newGoal < 1) return 1;
      if (newGoal > 7) return 7;
      return newGoal;
    });
  };

  const handleSaveGoal = async () => {
    const success = await saveProfileToDB({ weeklyGoal: tempGoal });
    if (success) showAlert('Saved', 'Weekly goal updated.');
  };

  const handleSaveWeight = async () => {
    if (!user?.id || !weightInput.trim()) return;

    const formattedWeight = weightInput.replace(',', '.');

    if (isNaN(Number(formattedWeight))) {
      showAlert('Invalid weight', 'Please enter a valid number.');
      return;
    }

    try {
      setIsSavingWeight(true);
      const response = await fetch('http://192.168.1.80:3000/api/metrics/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, weight: formattedWeight }),
      });

      if (response.ok) {
        const newWeight = await response.json();
        setWeightHistory((prev) => [newWeight, ...prev]);
        setWeightInput('');
      } else {
        throw new Error('Failed to log weight.');
      }
    } catch (error) {
      console.error('Failed to save weight:', error);
      showAlert('Error', 'Could not log your weight.');
    } finally {
      setIsSavingWeight(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const initial = (displayName || 'U').charAt(0).toUpperCase();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton onPress={() => navigation.goBack()} label="Home" />
        <Title>Profile</Title>

        <TouchableOpacity onPress={pickImage} style={styles.imageWrap} activeOpacity={0.8} disabled={isSaving}>
          {profilePic && !imageError ? (
            <Image source={{ uri: profilePic }} style={styles.image} onError={() => setImageError(true)} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderLetter}>{initial}</Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera-outline" size={16} color={colors.bg} />
          </View>
        </TouchableOpacity>

        {isEditingName ? (
          <View style={styles.editName}>
            <TextInput
              style={styles.nameInput}
              value={tempName}
              onChangeText={setTempName}
              autoFocus
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              editable={!isSaving}
            />
            <TouchableOpacity style={styles.saveNameBtn} onPress={handleSaveName} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Ionicons name="checkmark" size={20} color={colors.bg} />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.nameRow} onPress={() => setIsEditingName(true)} disabled={isSaving}>
            <Text style={styles.name}>{displayName}</Text>
            <Ionicons name="pencil-outline" size={16} color={colors.muted} />
          </TouchableOpacity>
        )}

        <Text style={styles.email}>{user?.email}</Text>

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>Weekly goal</Text>
          <Text style={styles.blockSub}>How many sessions do you want this week?</Text>
          <View style={styles.goalControls}>
            <TouchableOpacity style={styles.goalBtn} onPress={() => adjustGoal(-1)} disabled={tempGoal <= 1 || isSaving}>
              <Text style={styles.goalBtnText}>-</Text>
            </TouchableOpacity>
            <View style={styles.goalDisplay}>
              <Text style={styles.goalNumber}>{tempGoal}</Text>
              <Text style={styles.goalLabel}>sessions</Text>
            </View>
            <TouchableOpacity style={styles.goalBtn} onPress={() => adjustGoal(1)} disabled={tempGoal >= 7 || isSaving}>
              <Text style={styles.goalBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          {tempGoal !== (user?.weeklyGoal || 3) && (
            <Button title={isSaving ? 'Saving...' : 'Save goal'} onPress={handleSaveGoal} disabled={isSaving} />
          )}
        </Card>

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>Body weight</Text>
          <Text style={styles.blockSub}>Track your progress over time.</Text>
          <View style={styles.weightRow}>
            <TextInput
              style={styles.weightInput}
              placeholder="75.5"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={weightInput}
              onChangeText={setWeightInput}
              editable={!isSavingWeight}
            />
            <Text style={styles.unit}>kg</Text>
            <TouchableOpacity style={styles.logBtn} onPress={handleSaveWeight} disabled={isSavingWeight}>
              <Text style={styles.logBtnText}>{isSavingWeight ? '...' : 'Log'}</Text>
            </TouchableOpacity>
          </View>

          {weightHistory.map((item, index) => (
            <View key={item.id} style={[styles.historyRow, index === 0 && styles.historyLatest]}>
              <Text style={[styles.historyDate, index === 0 && styles.highlight]}>{formatDate(item.createdAt)}</Text>
              <Text style={[styles.historyWeight, index === 0 && styles.highlight]}>{item.weight} kg</Text>
            </View>
          ))}
        </Card>

        <Button title="Sign out" variant="danger" onPress={() => logout()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.lg, paddingBottom: 40 },
  imageWrap: { alignSelf: 'center', marginTop: 24, marginBottom: 16, position: 'relative' },
  image: { width: 104, height: 104, borderRadius: 52, borderWidth: 1, borderColor: colors.border },
  placeholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderLetter: { color: colors.text, fontSize: 36, fontWeight: '700' },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.accent,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  editName: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 12,
    borderRadius: radius.md,
    fontSize: 18,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  saveNameBtn: {
    backgroundColor: colors.accent,
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  email: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  block: { width: '100%', marginBottom: 16 },
  blockTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  blockSub: { fontSize: 14, color: colors.muted, marginBottom: 16 },
  goalControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, marginBottom: 16 },
  goalBtn: {
    backgroundColor: colors.surface2,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalBtnText: { color: colors.text, fontSize: 22, fontWeight: '600' },
  goalDisplay: { alignItems: 'center' },
  goalNumber: { fontSize: 32, fontWeight: '700', color: colors.text },
  goalLabel: { fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  weightRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  weightInput: {
    flex: 1,
    backgroundColor: colors.surface2,
    color: colors.text,
    padding: 12,
    borderRadius: radius.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  unit: { color: colors.muted, fontSize: 16, fontWeight: '600' },
  logBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radius.md,
  },
  logBtnText: { color: colors.bg, fontSize: 15, fontWeight: '700' },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  historyLatest: {},
  historyDate: { color: colors.muted, fontSize: 15 },
  historyWeight: { color: colors.text, fontSize: 15, fontWeight: '600' },
  highlight: { color: colors.accent },
});
