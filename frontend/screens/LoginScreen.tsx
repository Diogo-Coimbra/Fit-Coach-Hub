import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/useAuthStore';
import { Button, Screen } from '../components/ui';
import { colors, space } from '../theme';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);

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
        fetch('http://192.168.1.80:3000/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: idTokenFinal }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.user) login(data.user);
          })
          .catch((err) => console.error('Login failed:', err));
      }
    }
  }, [response]);

  return (
    <Screen style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.mark}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>F</Text>
        </View>
        <Text style={styles.title}>Fit AI Tracker</Text>
        <Text style={styles.subtitle}>Training, nutrition, and progress — in one place.</Text>
      </View>

      <Button
        title="Continue with Google"
        onPress={() => promptAsync()}
        disabled={!request}
        icon="logo-google"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: space.lg,
    justifyContent: 'center',
  },
  mark: {
    marginBottom: 48,
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: colors.bg,
    fontSize: 30,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 280,
  },
});
