import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  Image,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';
import { Button, Screen, showAlert } from '../components/ui';
import { space, radius } from '../theme';
import { api } from '../services/api';
import PrivacyTermsModal from '../components/PrivacyTermsModal';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const { colors, mode } = useTheme();
  const { t } = useLanguage();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Campos de Formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleToRegister, setRoleToRegister] = useState<'COACH' | 'CLIENT'>('COACH');

  // Modal de Recuperação de Palavra-Passe
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);

  // Modal de Termos & Privacidade
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);

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
          .catch((err) => {
            console.error('Login failed:', err);
            showAlert(t('common.error'), err.message || 'Falha na autenticação Google.');
          })
          .finally(() => setIsSubmitting(false));
      }
    }
  }, [response]);

  // Login com Email e Password
  const handleEmailLogin = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      showAlert(t('common.attention'), 'Por favor, introduz o teu email e a tua palavra-passe.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await api.post('/api/auth/login', { email: cleanEmail, password });
      if (data.user && data.token) {
        await login(data.user, data.token, data.coach, data.trial);
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      showAlert(t('common.error'), err.message || 'Email ou palavra-passe incorretos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Registo com Email e Password
  const handleEmailRegister = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      showAlert(t('common.attention'), 'Por favor, introduz o teu nome completo.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showAlert(t('common.attention'), 'Por favor, introduz um endereço de email válido.');
      return;
    }
    if (!password || password.length < 6) {
      showAlert(t('common.attention'), 'A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      showAlert(t('common.attention'), 'As palavras-passe introduzidas não coincidem.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await api.post('/api/auth/register', {
        name: cleanName,
        email: cleanEmail,
        password,
        role: roleToRegister,
      });
      if (data.user && data.token) {
        await login(data.user, data.token, data.coach, data.trial);
      }
    } catch (err: any) {
      console.error('Erro no registo:', err);
      showAlert(t('common.error'), err.message || 'Não foi possível criar a conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pedido de Código de Recuperação de Palavra-Passe (Passo 1)
  const handleSendForgotCode = async () => {
    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showAlert(t('common.attention'), 'Por favor, introduz o teu email.');
      return;
    }

    try {
      setIsSubmittingForgot(true);
      const data = await api.post('/api/auth/forgot-password', { email: cleanEmail });
      showAlert(
        'Código Gerado',
        data.devCode
          ? `O teu código de verificação é: ${data.devCode}\n(Introduz este código no passo seguinte)`
          : 'Se o email estiver registado, enviámos o código de recuperação.'
      );
      if (data.devCode) {
        setForgotCode(data.devCode);
      }
      setForgotStep(2);
    } catch (err: any) {
      showAlert(t('common.error'), err.message || 'Erro ao pedir código de recuperação.');
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  // Validação do Código e Redefinição de Password (Passo 2)
  const handleResetPassword = async () => {
    const cleanEmail = forgotEmail.trim();
    const cleanCode = forgotCode.trim();

    if (!cleanCode) {
      showAlert(t('common.attention'), 'Por favor, introduz o código de 6 dígitos.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      showAlert(t('common.attention'), 'A nova palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setIsSubmittingForgot(true);
      await api.post('/api/auth/reset-password', {
        email: cleanEmail,
        code: cleanCode,
        newPassword: forgotNewPassword,
      });
      showAlert('Sucesso!', 'A tua palavra-passe foi alterada com sucesso! Podes agora iniciar sessão.');
      setIsForgotModalVisible(false);
      setForgotStep(1);
      setForgotEmail('');
      setForgotCode('');
      setForgotNewPassword('');
      setAuthMode('login');
    } catch (err: any) {
      showAlert(t('common.error'), err.message || 'Código inválido ou expirado.');
    } finally {
      setIsSubmittingForgot(false);
    }
  };

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logótipo e Cabeçalho */}
          <View style={styles.mark}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.text }]}>{t('auth.appTitle')}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {t('auth.appSubtitle')}
            </Text>
          </View>

          {/* Segmentador: Iniciar Sessão vs Criar Conta */}
          <View style={[styles.modeTabs, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.modeTab,
                authMode === 'login' && { backgroundColor: colors.accent },
              ]}
              onPress={() => setAuthMode('login')}
            >
              <Text
                style={[
                  styles.modeTabText,
                  { color: colors.text },
                  authMode === 'login' && { color: mode === 'dark' ? '#0B0D10' : '#FFFFFF', fontWeight: '700' },
                ]}
              >
                Iniciar Sessão
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeTab,
                authMode === 'register' && { backgroundColor: colors.accent },
              ]}
              onPress={() => setAuthMode('register')}
            >
              <Text
                style={[
                  styles.modeTabText,
                  { color: colors.text },
                  authMode === 'register' && { color: mode === 'dark' ? '#0B0D10' : '#FFFFFF', fontWeight: '700' },
                ]}
              >
                Criar Conta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Seletor de Perfil (Apenas no Modo de Registo) */}
          {authMode === 'register' && (
            <View style={styles.rolePickerContainer}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Pretendes registar-te como:</Text>
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
                    Treinador / PT
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
                    Aluno
                  </Text>
                </TouchableOpacity>
              </View>
              {roleToRegister === 'COACH' && (
                <Text style={{ fontSize: 11, color: colors.accent, textAlign: 'center', marginTop: 6, fontWeight: '600' }}>
                  🎁 Inclui 14 dias de teste grátis com acesso total a todas as ferramentas
                </Text>
              )}
            </View>
          )}

          {/* Formulário de Campos */}
          <View style={styles.formContainer}>
            {authMode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Nome Completo</Text>
                <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="person-outline" size={18} color={colors.muted} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Ex: Diogo Silva"
                    placeholderTextColor={colors.muted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Endereço de Email</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={colors.muted} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="teu.email@exemplo.com"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Palavra-passe</Text>
                {authMode === 'login' && (
                  <TouchableOpacity
                    onPress={() => {
                      setForgotEmail(email);
                      setForgotStep(1);
                      setIsForgotModalVisible(true);
                    }}
                  >
                    <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>
                      Esqueci-me da palavra-passe
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {authMode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Confirmar Palavra-passe</Text>
                <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.muted} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Repete a tua palavra-passe"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </View>
            )}

            {/* Botão de Submissão Principal */}
            <TouchableOpacity
              style={[styles.mainSubmitBtn, { backgroundColor: colors.accent }]}
              onPress={authMode === 'login' ? handleEmailLogin : handleEmailRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={mode === 'dark' ? '#0B0D10' : '#FFFFFF'} />
              ) : (
                <Text style={[styles.mainSubmitText, { color: mode === 'dark' ? '#0B0D10' : '#FFFFFF' }]}>
                  {authMode === 'login' ? 'Entrar na Conta' : 'Criar Conta Gratuita'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divisor "ou continua com" */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.muted }]}>ou continua com</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Botão Oficial Google */}
          <Button
            title={t('auth.continueGoogle')}
            onPress={() => promptAsync()}
            disabled={!request || isSubmitting}
            icon="logo-google"
          />

          {/* Termos de Serviço e Política de Privacidade */}
          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, { color: colors.muted }]}>
              Ao continuar, declaras que concordas com os nossos{' '}
              <Text
                style={{ color: colors.accent, fontWeight: '700', textDecorationLine: 'underline' }}
                onPress={() => setIsTermsModalVisible(true)}
              >
                Termos de Uso e Política de Privacidade
              </Text>
              .
            </Text>
          </View>

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
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Recuperação de Palavra-Passe */}
      <Modal
        visible={isForgotModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsForgotModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Recuperar Palavra-passe
              </Text>
              <TouchableOpacity onPress={() => setIsForgotModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {forgotStep === 1 ? (
              <View>
                <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                  Introduz o email associado à tua conta para receberes um código de verificação de 6 dígitos.
                </Text>

                <View style={[styles.inputBox, { backgroundColor: colors.bg, borderColor: colors.border, marginTop: 14 }]}>
                  <Ionicons name="mail-outline" size={18} color={colors.muted} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="teu.email@exemplo.com"
                    placeholderTextColor={colors.muted}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.mainSubmitBtn, { backgroundColor: colors.accent, marginTop: 18 }]}
                  onPress={handleSendForgotCode}
                  disabled={isSubmittingForgot}
                >
                  {isSubmittingForgot ? (
                    <ActivityIndicator color={mode === 'dark' ? '#0B0D10' : '#FFFFFF'} />
                  ) : (
                    <Text style={[styles.mainSubmitText, { color: mode === 'dark' ? '#0B0D10' : '#FFFFFF' }]}>
                      Enviar Código de Recuperação
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                  Introduz o código de 6 dígitos enviado para {forgotEmail} e escolhe uma nova palavra-passe.
                </Text>

                <View style={[styles.inputBox, { backgroundColor: colors.bg, borderColor: colors.border, marginTop: 14 }]}>
                  <Ionicons name="key-outline" size={18} color={colors.muted} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Código de 6 dígitos (Ex: 123456)"
                    placeholderTextColor={colors.muted}
                    value={forgotCode}
                    onChangeText={setForgotCode}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputBox, { backgroundColor: colors.bg, borderColor: colors.border, marginTop: 10 }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Nova palavra-passe (mín. 6 car.)"
                    placeholderTextColor={colors.muted}
                    secureTextEntry
                    value={forgotNewPassword}
                    onChangeText={setForgotNewPassword}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.mainSubmitBtn, { backgroundColor: colors.accent, marginTop: 18 }]}
                  onPress={handleResetPassword}
                  disabled={isSubmittingForgot}
                >
                  {isSubmittingForgot ? (
                    <ActivityIndicator color={mode === 'dark' ? '#0B0D10' : '#FFFFFF'} />
                  ) : (
                    <Text style={[styles.mainSubmitText, { color: mode === 'dark' ? '#0B0D10' : '#FFFFFF' }]}>
                      Redefinir Palavra-passe
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ alignSelf: 'center', marginTop: 12 }}
                  onPress={() => setForgotStep(1)}
                >
                  <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
                    ← Voltar e alterar email
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Termos de Serviço e Política de Privacidade */}
      <PrivacyTermsModal
        visible={isTermsModalVisible}
        onClose={() => setIsTermsModalVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: space.lg,
  },
  scrollContent: {
    paddingVertical: 36,
  },
  mark: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 320,
  },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    marginBottom: 18,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rolePickerContainer: {
    marginBottom: 16,
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
  formContainer: {
    gap: 12,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  mainSubmitBtn: {
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  mainSubmitText: {
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  termsContainer: {
    marginTop: 18,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  devSection: {
    marginTop: 28,
    paddingTop: 18,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  devTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  devButtons: {
    width: '100%',
    gap: 8,
  },
  devBtn: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  devBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: space.lg,
  },
  modalCard: {
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
