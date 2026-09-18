import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';
import { Button, Screen } from '../components/ui';
import { space, radius } from '../theme';
import { api } from '../services/api';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const { colors, mode } = useTheme();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleToRegister, setRoleToRegister] = useState<'COACH' | 'CLIENT'>('COACH');

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '715283938816-l95uo27dqv3ke2cfqv3t93bef73tcf6s.apps.googleusercontent.com',
    iosClientId: '715283938816-qv35s088tbu2npb5am41i76qmtkl986r.apps.googleusercontent.com',
    androidClientId: '715283938816-4hio2kbp5u27nifolr33ot4d1fr5s8m8.apps.googleusercontent.com',
    scopes: ['profile', 'email', 'openid'],
    responseType: 'id_token',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      const idTokenFinal = authentication?.idToken || response.params?.id_token;

      if (idTokenFinal) {
        setIsSubmitting(true);
        api.post('/api/auth/google', { token: idTokenFinal, role: roleToRegister })
          .then((data) => {
            if (data.user) {
              login(data.user, data.token, data.coach, data.trial);
            }
          })
          .catch((err) => console.error('Login failed:', err))
          .finally(() => setIsSubmitting(false));
      }
    }
  }, [response]);

  const handleDevLogin = async (role: 'COACH' | 'CLIENT') => {
    try {
      setIsSubmitting(true);
      const data = await api.post('/api/auth/dev-login', { role });
      if (data.user) {
        await login(data.user, data.token, data.coach, data.trial);
      }
    } catch (err) {
      console.error('Dev login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen style={[styles.screen, { backgroundColor: colors.bg }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.mark}>
        <View style={[styles.logo, { backgroundColor: colors.accent }]}>
          <Text style={[styles.logoText, { color: mode === 'dark' ? '#0B0D10' : '#FFFFFF' }]}>PT</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{t('auth.appTitle')}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {t('auth.appSubtitle')}
        </Text>
      </View>

      {/* Seletor de Perfil Inicial para Google Login */}
      <View style={styles.rolePickerContainer}>
        <Text style={[styles.rolePickerLabel, { color: colors.muted }]}>{t('auth.loginAs')}</Text>
        <View style={[styles.roleTabs, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.roleTab,
              roleToRegister === 'COACH' && { backgroundColor: colors.accent },
            ]}
            onPress={() => setRoleToRegister('COACH')}
          >
            <Ionicons
              name="fitness-outline"
              size={18}
              color={roleToRegister === 'COACH' ? (mode === 'dark' ? '#0B0D10' : '#FFFFFF') : colors.text}
            />
            <Text
              style={[
                styles.roleTabText,
                { color: colors.text },
                roleToRegister === 'COACH' && { color: mode === 'dark' ? '#0B0D10' : '#FFFFFF', fontWeight: '700' },
              ]}
            >
              {t('auth.coach')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleTab,
              roleToRegister === 'CLIENT' && { backgroundColor: colors.accent },
            ]}
            onPress={() => setRoleToRegister('CLIENT')}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={roleToRegister === 'CLIENT' ? (mode === 'dark' ? '#0B0D10' : '#FFFFFF') : colors.text}
            />
            <Text
              style={[
                styles.roleTabText,
                { color: colors.text },
                roleToRegister === 'CLIENT' && { color: mode === 'dark' ? '#0B0D10' : '#FFFFFF', fontWeight: '700' },
              ]}
            >
              {t('auth.client')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Button
        title={t('auth.continueGoogle')}
        onPress={() => promptAsync()}
        disabled={!request || isSubmitting}
        icon="logo-google"
      />

      {isSubmitting && (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
      )}

      {/* Secção de Testes Rápidos (Dev Mode) */}
      <View style={[styles.devSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.devTitle, { color: colors.muted }]}>{t('auth.devSectionTitle')}</Text>
        <View style={styles.devButtons}>
          <TouchableOpacity
            style={[styles.devBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleDevLogin('COACH')}
            disabled={isSubmitting}
          >
            <Ionicons name="briefcase-outline" size={16} color={colors.accent} />
            <Text style={[styles.devBtnText, { color: colors.text }]}>{t('auth.devCoachBtn')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.devBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleDevLogin('CLIENT')}
            disabled={isSubmitting}
          >
            <Ionicons name="body-outline" size={16} color={colors.accent} />
            <Text style={[styles.devBtnText, { color: colors.text }]}>{t('auth.devClientBtn')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: space.lg,
    justifyContent: 'center',
  },
  mark: {
    marginBottom: 36,
    alignItems: 'center',
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 320,
  },
  rolePickerContainer: {
    marginBottom: 24,
  },
  rolePickerLabel: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  roleTabs: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    gap: 6,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm,
    gap: 6,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  devSection: {
    marginTop: 36,
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  devTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  devButtons: {
    width: '100%',
    gap: 10,
  },
  devBtn: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  devBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
