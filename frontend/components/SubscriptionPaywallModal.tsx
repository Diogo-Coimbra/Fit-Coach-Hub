import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { ColorScheme, radius, space } from '../theme';
import { api } from '../services/api';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';

interface SubscriptionPaywallModalProps {
  visible: boolean;
  onDismiss?: () => void;
  canDismiss?: boolean;
}

export default function SubscriptionPaywallModal({
  visible,
  onDismiss,
  canDismiss = false,
}: SubscriptionPaywallModalProps) {
  const { user, setUser, setTrial, logout } = useAuthStore();
  const { colors, mode } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Iniciar Checkout no Stripe
  const handleStripeCheckout = async () => {
    try {
      setIsLoading(true);
      const res = await api.post('/api/subscription/create-checkout');

      if (res.simulated) {
        Alert.alert(
          t('profile.devModeTitle'),
          t('subscription.noStripeKeyPrompt'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('subscription.activateDemo'), onPress: handleSimulatePayment },
          ]
        );
        return;
      }

      if (res.checkoutUrl) {
        const browserResult = await WebBrowser.openBrowserAsync(res.checkoutUrl);
        // Após o utilizador regressar do navegador Stripe, atualizar sessão
        const meRes = await api.get('/api/auth/me');
        if (meRes?.user) setUser(meRes.user);
        if (meRes?.trial) setTrial(meRes.trial);
      }
    } catch (error: any) {
      console.error('Erro no checkout Stripe:', error);
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir Portal de Faturação Stripe (Customer Portal)
  const handleOpenBillingPortal = async () => {
    try {
      setIsLoading(true);
      const res = await api.post('/api/subscription/portal');
      if (res.portalUrl) {
        await WebBrowser.openBrowserAsync(res.portalUrl);
      }
    } catch (error: any) {
      Alert.alert(t('profile.stripePortal'), error.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Simulação de Teste / Dev
  const handleSimulatePayment = async () => {
    try {
      setIsSimulating(true);
      const res = await api.post('/api/subscription/dev-simulate-payment');
      if (res.user) setUser(res.user);
      if (res.trial) setTrial(res.trial);
      Alert.alert(t('common.success'), t('profile.devSubscriptionActivated'));
      if (onDismiss) onDismiss();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('common.error'));
    } finally {
      setIsSimulating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        if (canDismiss && onDismiss) onDismiss();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {canDismiss && onDismiss ? (
            <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
              <Ionicons name="close" size={24} color={colors.muted} />
            </TouchableOpacity>
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Tag de Destaque */}
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.accent} />
              <Text style={styles.badgeText}>{t('subscription.proBadge')}</Text>
            </View>

            <Text style={styles.title}>{t('subscription.proTitle')}</Text>
            <Text style={styles.subtitle}>
              {canDismiss
                ? t('subscription.activeDesc')
                : t('subscription.trialExpiredDesc')}
            </Text>

            {/* Cartão de Preço */}
            <View style={styles.pricingCard}>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>{t('subscription.pricePerMonth')}</Text>
              </View>
              <Text style={styles.priceNote}>{t('subscription.cancelAnytime')}</Text>
            </View>

            {/* Vantagens */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                <Text style={styles.featureText}>Gestão ilimitada de alunos e fichas clínicas</Text>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                <Text style={styles.featureText}>Biblioteca e prescrição direta de modelos de treino</Text>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                <Text style={styles.featureText}>Prescrição de calorias e macronutrientes personalizados</Text>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                <Text style={styles.featureText}>Avaliações físicas completas e fotografias de evolução</Text>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                <Text style={styles.featureText}>Criação acelerada de treinos com Inteligência Artificial</Text>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                <Text style={styles.featureText}>Painel anti-churn com alertas de abandono de alunos</Text>
              </View>
            </View>

            {/* Botão Primário: Checkout Stripe */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleStripeCheckout}
              disabled={isLoading || isSimulating}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={mode === 'dark' ? '#0B0D10' : '#FFFFFF'} size="small" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={18} color={mode === 'dark' ? '#0B0D10' : '#FFFFFF'} />
                  <Text style={[styles.primaryBtnText, { color: mode === 'dark' ? '#0B0D10' : '#FFFFFF' }]}>
                    {t('subscription.activateStripe')}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Botão Secundário: Teste de Demonstração Dev */}
            <TouchableOpacity
              style={styles.devSimBtn}
              onPress={handleSimulatePayment}
              disabled={isLoading || isSimulating}
            >
              {isSimulating ? (
                <ActivityIndicator color={colors.accent} size="small" />
              ) : (
                <Text style={styles.devSimBtnText}>{t('subscription.activateDemo')}</Text>
              )}
            </TouchableOpacity>

            {/* Opções Auxiliares */}
            <View style={styles.footerOptions}>
              {user?.stripeCustomerId ? (
                <TouchableOpacity
                  style={styles.footerBtn}
                  onPress={handleOpenBillingPortal}
                  disabled={isLoading}
                >
                  <Text style={styles.footerBtnText}>{t('subscription.manageBilling')}</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity style={styles.footerBtn} onPress={handleLogout}>
                <Text style={[styles.footerBtnText, { color: colors.danger }]}>{t('subscription.logout')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: space.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  scrollContent: {
    padding: space.lg,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentDim,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    marginBottom: 14,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 320,
  },
  pricingCard: {
    width: '100%',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceAmount: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
  },
  pricePeriod: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  priceNote: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  featuresList: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  primaryBtnText: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: '700',
  },
  devSimBtn: {
    width: '100%',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  devSimBtnText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  footerOptions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  footerBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  footerBtnText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});
