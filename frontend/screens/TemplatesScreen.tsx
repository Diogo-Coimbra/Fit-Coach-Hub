import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BackButton, Button, Card, Screen, Title, Subtitle } from '../components/ui';
import { ColorScheme, radius, space } from '../theme';
import { api } from '../services/api';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';

export default function TemplatesScreen({ navigation }: any) {
  const { colors, mode } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/api/coach/templates');
      setTemplates(data || []);
    } catch (error) {
      console.error('Falha ao obter modelos de treino:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTemplates();
    }, [fetchTemplates])
  );

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    const confirmAction = async () => {
      try {
        await api.delete(`/api/coach/templates/${templateId}`);
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      } catch (err: any) {
        Alert.alert(t('common.error'), err.message || t('common.error'));
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('templates.deleteTemplateConfirm'))) confirmAction();
    } else {
      Alert.alert(t('common.delete'), t('templates.deleteTemplateConfirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: confirmAction },
      ]);
    }
  };

  const renderTemplate = ({ item }: any) => {
    return (
      <TouchableOpacity
        style={styles.templateCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id })}
      >
        <View style={styles.cardInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.templateTitle}>{item.name}</Text>
            {item.category ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
            ) : null}
          </View>
          
          <Text style={styles.templateDetails}>
            {item.exercises?.length || 0} {t('workouts.exercisesCount')}
            {item.description ? `  ·  ${item.description}` : ''}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteTemplate(item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Title>{t('templates.title')}</Title>
        <Subtitle>{t('templates.subtitle')}</Subtitle>
        
        <View style={styles.createBtnWrap}>
          <Button
            title={t('templates.createTemplate')}
            icon="add"
            onPress={() => navigation.navigate('CreateWorkout', { isTemplate: true })}
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          renderItem={renderTemplate}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="library-outline" size={44} color={colors.muted} />
              <Text style={styles.emptyTitle}>{t('templates.emptyTitle')}</Text>
              <Text style={styles.emptyDesc}>{t('templates.emptyDesc')}</Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  header: {
    paddingHorizontal: space.lg,
  },
  createBtnWrap: {
    marginTop: 14,
    marginBottom: 6,
  },
  list: {
    paddingHorizontal: space.lg,
    paddingTop: 14,
    paddingBottom: 40,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  cardInfo: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  categoryBadge: {
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  templateDetails: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 48,
    paddingHorizontal: space.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDesc: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 300,
  },
});
