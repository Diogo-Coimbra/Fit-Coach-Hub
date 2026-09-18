import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useFocusEffect } from '@react-navigation/native';
import { BackButton, Button, Card, Screen, showAlert, Title } from '../components/ui';
import { ColorScheme, radius, space } from '../theme';
import { api } from '../services/api';
import SubscriptionPaywallModal from '../components/SubscriptionPaywallModal';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';

export default function ProfileScreen({ navigation }: any) {
  const { user, coach, trial, logout, setUser, setCoach, setTrial } = useAuthStore();
  const { mode, setTheme, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const isCoach = user?.role === 'COACH';

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

  // Código de associação para alunos
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isLinkingCoach, setIsLinkingCoach] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const fetchProfileData = async () => {
    if (!user?.id) return;
    try {
      const [weights, meData] = await Promise.all([
        api.get(`/api/metrics/weight/${user.id}`),
        api.get('/api/auth/me'),
      ]);
      setWeightHistory(weights || []);
      if (meData?.coach) setCoach(meData.coach);
      if (meData?.trial) setTrial(meData.trial);
      if (meData?.user) setUser(meData.user);
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [user?.id])
  );

  const saveProfileToDB = async (updateData: any) => {
    if (!user || !user.id) return false;
    try {
      setIsSaving(true);
      const updatedUser = await api.put(`/api/users/${user.id}`, updateData);
      setUser(updatedUser);
      return true;
    } catch (error: any) {
      console.error('Falha ao guardar perfil:', error);
      showAlert(t('common.error'), error.message || t('profile.saveChanges'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsSaving(true);
        const asset = result.assets[0];
        let base64 = asset.base64;
        if (base64 && !base64.startsWith('data:')) {
          base64 = `data:image/jpeg;base64,${base64}`;
        }

        let finalUrl = asset.uri;
        if (base64) {
          try {
            const uploadRes = await api.post('/api/uploads', { imageBase64: base64 });
            if (uploadRes?.url) {
              finalUrl = uploadRes.url;
            }
          } catch (uploadErr) {
            console.warn('Falha no upload para o servidor, a usar fallback local:', uploadErr);
          }
        }

        setProfilePic(finalUrl);
        setImageError(false);
        await saveProfileToDB({ picture: finalUrl });
      }
    } catch (err: any) {
      console.error('Erro ao selecionar imagem:', err);
      showAlert(t('common.error'), t('profile.errorLoadingImage'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      showAlert(t('profile.nameRequired'), t('profile.nameRequiredMsg'));
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
    if (success) showAlert(t('common.success'), t('profile.goalSavedSuccess'));
  };

  const handleSaveWeight = async () => {
    if (!user?.id || !weightInput.trim()) return;

    const formattedWeight = weightInput.replace(',', '.');
    if (isNaN(Number(formattedWeight))) {
      showAlert(t('common.error'), t('profile.invalidWeightMsg'));
      return;
    }

    try {
      setIsSavingWeight(true);
      const newWeight = await api.post('/api/metrics/weight', { weight: formattedWeight });
      setWeightHistory((prev) => [newWeight, ...prev]);
      setWeightInput('');
    } catch (error: any) {
      console.error('Falha ao guardar peso:', error);
      showAlert(t('common.error'), error.message || t('common.error'));
    } finally {
      setIsSavingWeight(false);
    }
  };

  const handleLinkCoach = async () => {
    if (!inviteCodeInput.trim()) {
      Alert.alert(t('common.attention'), t('profile.enterInviteCodePrompt'));
      return;
    }

    try {
      setIsLinkingCoach(true);
      const res = await api.post('/api/coach/accept-invite', { code: inviteCodeInput.trim() });
      if (res.coach) {
        await setCoach(res.coach);
      }
      Alert.alert(t('common.success'), res.message || t('profile.linkedCoachSuccess'));
      setInviteCodeInput('');
      fetchProfileData();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('common.error'));
    } finally {
      setIsLinkingCoach(false);
    }
  };

  const handleSwitchRole = async () => {
    const nextRole = isCoach ? 'CLIENT' : 'COACH';
    const roleLabel = nextRole === 'COACH' ? t('auth.coach') : t('auth.client');

    Alert.alert(
      t('profile.switchRoleTitle'),
      t('profile.switchRoleConfirm', { role: roleLabel }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              setIsSwitchingRole(true);
              const res = await api.post('/api/auth/switch-role', { targetRole: nextRole });
              if (res.user) {
                setUser(res.user);
                if (res.trial) setTrial(res.trial);
                Alert.alert(t('common.success'), t('profile.switchRoleSuccess', { role: roleLabel }));
                navigation.navigate('Dashboard');
              }
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || t('common.error'));
            } finally {
              setIsSwitchingRole(false);
            }
          },
        },
      ]
    );
  };

  const handleDevSimulatePayment = async () => {
    try {
      const res = await api.post('/api/subscription/dev-simulate-payment');
      if (res.user) setUser(res.user);
      if (res.trial) setTrial(res.trial);
      Alert.alert(t('common.success'), t('profile.devSubscriptionActivated'));
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('common.error'));
    }
  };

  const handleDevSimulateExpiry = async () => {
    try {
      const res = await api.post('/api/subscription/dev-simulate-expiry');
      if (res.user) setUser(res.user);
      if (res.trial) setTrial(res.trial);
      Alert.alert(t('profile.devModeTitle'), t('profile.devTrialExpired'));
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('common.error'));
    }
  };

  const handleOpenStripePortal = async () => {
    try {
      const res = await api.post('/api/subscription/portal');
      if (res.portalUrl) {
        await WebBrowser.openBrowserAsync(res.portalUrl);
      }
    } catch (err: any) {
      Alert.alert(t('profile.stripePortal'), err.message || t('common.error'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeMap: Record<string, string> = { pt: 'pt-PT', en: 'en-US', es: 'es-ES', fr: 'fr-FR' };
    return date.toLocaleDateString(localeMap[language] || 'pt-PT', { day: '2-digit', month: 'short' });
  };

  const initial = (displayName || 'U').charAt(0).toUpperCase();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton onPress={() => navigation.goBack()} />
        <Title>{t('profile.title')}</Title>

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
              placeholder={t('profile.placeholderName')}
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

        {/* Tag do Papel Atual */}
        <View style={styles.roleContainer}>
          <View style={[styles.roleBadge, isCoach && styles.roleBadgeCoach]}>
            <Ionicons
              name={isCoach ? 'fitness-outline' : 'person-outline'}
              size={14}
              color={isCoach ? colors.bg : colors.text}
            />
            <Text style={[styles.roleBadgeText, isCoach && styles.roleBadgeTextCoach]}>
              {isCoach ? t('dashboard.roleCoach') : t('dashboard.roleClient')}
            </Text>
          </View>
        </View>

        {/* Definições: Tema Visual e Idioma */}
        <Card style={styles.block}>
          <Text style={styles.blockTitle}>{t('profile.settingsAndAppearance')}</Text>
          <Text style={styles.blockSub}>{t('profile.themeSub')}</Text>

          {/* Seletor de Tema (Escuro / Claro) */}
          <Text style={styles.settingItemLabel}>{t('profile.themeTitle')}</Text>
          <View style={styles.themeSelectorRow}>
            <TouchableOpacity
              style={[
                styles.themeOptionBtn,
                mode === 'dark' && { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
              onPress={() => setTheme('dark')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="moon-outline"
                size={16}
                color={mode === 'dark' ? colors.bg : colors.muted}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  mode === 'dark' && { color: colors.bg, fontWeight: '700' },
                ]}
              >
                {t('profile.themeDark')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOptionBtn,
                mode === 'light' && { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
              onPress={() => setTheme('light')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="sunny-outline"
                size={16}
                color={mode === 'light' ? colors.bg : colors.muted}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  mode === 'light' && { color: colors.bg, fontWeight: '700' },
                ]}
              >
                {t('profile.themeLight')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Seletor de Idioma (PT, EN, ES, FR) */}
          <Text style={styles.settingItemLabel}>{t('profile.languageTitle')}</Text>
          <View style={styles.langSelectorRow}>
            {[
              { code: 'pt' as const, label: 'PT', flag: '🇵🇹' },
              { code: 'en' as const, label: 'EN', flag: '🇬🇧' },
              { code: 'es' as const, label: 'ES', flag: '🇪🇸' },
              { code: 'fr' as const, label: 'FR', flag: '🇫🇷' },
            ].map((item) => {
              const isSelected = language === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.langOptionBtn,
                    isSelected && {
                      backgroundColor: colors.accent,
                      borderColor: colors.accent,
                    },
                  ]}
                  onPress={() => setLanguage(item.code)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.langFlagText}>{item.flag}</Text>
                  <Text
                    style={[
                      styles.langOptionText,
                      isSelected && { color: colors.bg, fontWeight: '700' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Informação do Plano PT SaaS (Trial / Stripe) */}
        {isCoach ? (
          <Card style={styles.block}>
            <View style={styles.saasHeader}>
              <Ionicons name="sparkles" size={18} color={colors.accent} />
              <Text style={styles.blockTitle}>{t('profile.subCoachTitle')}</Text>
            </View>
            <Text style={styles.blockSub}>
              {t('profile.subCoachSub')}
            </Text>
            <View style={styles.saasDetails}>
              <View style={styles.saasRow}>
                <Text style={styles.saasLabel}>{t('common.status')}:</Text>
                <Text style={styles.saasValue}>
                  {trial?.isExpired ? t('subscription.statusExpired') : t('subscription.statusTrial')}
                </Text>
              </View>
              {trial?.daysLeft !== undefined && (
                <View style={styles.saasRow}>
                  <Text style={styles.saasLabel}>{t('subscription.daysLeftTrial')}:</Text>
                  <Text style={[styles.saasValue, { color: colors.accent, fontWeight: '700' }]}>
                    {trial.daysLeft}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ) : (
          /* Associação ao Personal Trainer (Para Clientes) */
          <Card style={styles.block}>
            <Text style={styles.blockTitle}>{t('profile.yourCoach')}</Text>
            {coach ? (
              <View style={styles.linkedCoachRow}>
                <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.coachNameText}>{coach.name}</Text>
                  <Text style={styles.coachEmailText}>{coach.email}</Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.blockSub}>
                  {t('profile.coachCodeDesc')}
                </Text>
                <View style={styles.inviteInputRow}>
                  <TextInput
                    style={styles.inviteInput}
                    placeholder="PT-XXXX"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="characters"
                    value={inviteCodeInput}
                    onChangeText={setInviteCodeInput}
                  />
                  <TouchableOpacity
                    style={styles.inviteBtn}
                    onPress={handleLinkCoach}
                    disabled={isLinkingCoach}
                  >
                    {isLinkingCoach ? (
                      <ActivityIndicator color={colors.bg} size="small" />
                    ) : (
                      <Text style={styles.inviteBtnText}>{t('profile.linkBtn')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card>
        )}

        {/* Objetivo Semanal */}
        <Card style={styles.block}>
          <Text style={styles.blockTitle}>{t('profile.weeklyGoalTitle')}</Text>
          <Text style={styles.blockSub}>{t('profile.weeklyGoalSub')}</Text>
          <View style={styles.goalControls}>
            <TouchableOpacity style={styles.goalBtn} onPress={() => adjustGoal(-1)} disabled={tempGoal <= 1 || isSaving}>
              <Text style={styles.goalBtnText}>-</Text>
            </TouchableOpacity>
            <View style={styles.goalDisplay}>
              <Text style={styles.goalNumber}>{tempGoal}</Text>
              <Text style={styles.goalLabel}>{t('profile.weeklySessions')}</Text>
            </View>
            <TouchableOpacity style={styles.goalBtn} onPress={() => adjustGoal(1)} disabled={tempGoal >= 7 || isSaving}>
              <Text style={styles.goalBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          {tempGoal !== (user?.weeklyGoal || 3) && (
            <Button title={isSaving ? t('common.saving') : t('profile.saveGoalBtn')} onPress={handleSaveGoal} disabled={isSaving} />
          )}
        </Card>

        {/* Gestão de Subscrição Profissional (Personal Trainer) */}
        {isCoach && (
          <Card style={styles.block}>
            <View style={styles.subCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.blockTitle}>{t('profile.subCoachTitle')}</Text>
                <Text style={styles.blockSub}>{t('profile.subCoachSub')}</Text>
              </View>
              <View
                style={[
                  styles.subStatusBadge,
                  user?.subscriptionStatus === 'active'
                    ? styles.subStatusActive
                    : trial?.isExpired
                    ? styles.subStatusExpired
                    : styles.subStatusTrial,
                ]}
              >
                <Text
                  style={[
                    styles.subStatusText,
                    user?.subscriptionStatus === 'active'
                      ? styles.subStatusTextActive
                      : trial?.isExpired
                      ? styles.subStatusTextExpired
                      : styles.subStatusTextTrial,
                  ]}
                >
                  {user?.subscriptionStatus === 'active'
                    ? t('subscription.statusActive')
                    : trial?.isExpired
                    ? t('subscription.statusExpired')
                    : `${trial?.daysLeft || 0} ${t('subscription.daysLeftTrial')}`}
                </Text>
              </View>
            </View>

            <Text style={styles.subCardDescription}>
              {user?.subscriptionStatus === 'active'
                ? t('profile.subActiveDesc')
                : trial?.isExpired
                ? t('profile.subExpiredDesc')
                : t('profile.subTrialDesc')}
            </Text>

            <View style={styles.subActionRow}>
              {user?.subscriptionStatus === 'active' ? (
                <TouchableOpacity
                  style={styles.manageSubBtn}
                  onPress={handleOpenStripePortal}
                  activeOpacity={0.8}
                >
                  <Ionicons name="card-outline" size={16} color={colors.accent} />
                  <Text style={styles.manageSubBtnText}>{t('profile.manageBillingStripe')}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.subscribeBtn}
                  onPress={() => setShowPaywallModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="shield-checkmark" size={16} color={colors.bg} />
                  <Text style={styles.subscribeBtnText}>{t('profile.subscribePlanPrice')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Painel de Testes de Desenvolvedor */}
            <View style={styles.devTestPanel}>
              <Text style={styles.devTestTitle}>{t('profile.devToolsTitle')}</Text>
              <View style={styles.devTestButtons}>
                <TouchableOpacity
                  style={styles.devTestBtn}
                  onPress={handleDevSimulatePayment}
                >
                  <Ionicons name="checkmark-done-outline" size={14} color={colors.accent} />
                  <Text style={styles.devTestBtnText}>{t('profile.simulateActivation')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.devTestBtn, { borderColor: colors.danger }]}
                  onPress={handleDevSimulateExpiry}
                >
                  <Ionicons name="lock-closed-outline" size={14} color={colors.danger} />
                  <Text style={[styles.devTestBtnText, { color: colors.danger }]}>{t('profile.simulateExpiry')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        {/* Histórico de Peso */}
        <Card style={styles.block}>
          <Text style={styles.blockTitle}>{t('profile.weightLogTitle')}</Text>
          <Text style={styles.blockSub}>{t('profile.weightLogSub')}</Text>
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
              <Text style={styles.logBtnText}>{isSavingWeight ? '...' : t('profile.logWeightBtn')}</Text>
            </TouchableOpacity>
          </View>

          {weightHistory.map((item, index) => (
            <View key={item.id} style={[styles.historyRow, index === 0 && styles.historyLatest]}>
              <Text style={[styles.historyDate, index === 0 && styles.highlight]}>{formatDate(item.createdAt)}</Text>
              <Text style={[styles.historyWeight, index === 0 && styles.highlight]}>{item.weight} kg</Text>
            </View>
          ))}
        </Card>

        {/* Botão de Alternar Papel (Modo Dev / Switch Role) */}
        <TouchableOpacity
          style={styles.switchRoleBtn}
          onPress={handleSwitchRole}
          disabled={isSwitchingRole}
        >
          <Ionicons name="swap-horizontal" size={18} color={colors.accent} />
          <Text style={styles.switchRoleText}>
            {isCoach ? t('profile.switchToClient') : t('profile.switchToCoach')}
          </Text>
        </TouchableOpacity>

        <Button title={t('profile.logoutBtn')} variant="danger" onPress={() => logout()} />

        {/* Modal de Subscrição Stripe */}
        <SubscriptionPaywallModal
          visible={showPaywallModal}
          canDismiss={true}
          onDismiss={() => setShowPaywallModal(false)}
        />
      </ScrollView>
    </Screen>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  content: { paddingHorizontal: space.lg, paddingBottom: 40 },
  imageWrap: { alignSelf: 'center', marginTop: 20, marginBottom: 14, position: 'relative' },
  image: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, borderColor: colors.border },
  placeholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderLetter: { color: colors.text, fontSize: 34, fontWeight: '700' },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
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
  email: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 4, marginBottom: 12 },
  roleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface2,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleBadgeCoach: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  roleBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  roleBadgeTextCoach: {
    color: colors.bg,
  },
  block: { width: '100%', marginBottom: 16 },
  blockTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  blockSub: { fontSize: 13, color: colors.muted, marginBottom: 14 },
  saasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  saasDetails: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    padding: 12,
    gap: 8,
  },
  saasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saasLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  saasValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  linkedCoachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg,
    padding: 12,
    borderRadius: radius.sm,
  },
  coachNameText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  coachEmailText: {
    color: colors.muted,
    fontSize: 12,
  },
  inviteInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inviteInput: {
    flex: 1,
    backgroundColor: colors.surface2,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  inviteBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteBtnText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
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
  goalNumber: { fontSize: 30, fontWeight: '700', color: colors.text },
  goalLabel: { fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
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
  logBtnText: { color: colors.bg, fontSize: 14, fontWeight: '700' },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  historyLatest: {},
  historyDate: { color: colors.muted, fontSize: 14 },
  historyWeight: { color: colors.text, fontSize: 14, fontWeight: '600' },
  highlight: { color: colors.accent },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginBottom: 16,
  },
  switchRoleText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  subStatusActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  subStatusTrial: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
  },
  subStatusExpired: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
  },
  subStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subStatusTextActive: {
    color: colors.accent,
  },
  subStatusTextTrial: {
    color: colors.text,
  },
  subStatusTextExpired: {
    color: colors.danger,
  },
  subCardDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  subActionRow: {
    marginBottom: 16,
  },
  subscribeBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  subscribeBtnText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
  manageSubBtn: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  manageSubBtnText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  devTestPanel: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  devTestTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  devTestButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  devTestBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 8,
  },
  devTestBtnText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  settingItemLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  themeOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  themeOptionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  langSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  langFlagText: {
    fontSize: 15,
  },
  langOptionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
