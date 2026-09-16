import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '../theme';

export function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
}

export function BackButton({
  onPress,
  label = 'Back',
}: {
  onPress: () => void;
  label?: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.back} hitSlop={8}>
      <Ionicons name="chevron-back" size={20} color={colors.muted} />
      <Text style={styles.backLabel}>{label}</Text>
    </Pressable>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && styles.btnPrimary,
        variant === 'secondary' && styles.btnSecondary,
        variant === 'ghost' && styles.btnGhost,
        variant === 'danger' && styles.btnDanger,
        (disabled || loading) && styles.btnDisabled,
        pressed && !disabled && styles.btnPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.bg : colors.text} />
      ) : (
        <View style={styles.btnInner}>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={variant === 'primary' ? colors.bg : variant === 'danger' ? colors.danger : colors.text}
            />
          ) : null}
          <Text
            style={[
              styles.btnText,
              variant === 'primary' && styles.btnTextPrimary,
              variant === 'danger' && styles.btnTextDanger,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  style,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        {...props}
        style={[styles.input, style]}
      />
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: `${Math.min(Math.max(value, 0), 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: space.md,
    gap: 2,
  },
  backLabel: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '500',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 6,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
  },
  btn: {
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
  },
  btnSecondary: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnDanger: {
    backgroundColor: colors.dangerDim,
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 93, 0.28)',
  },
  btnDisabled: {
    opacity: 0.55,
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  btnTextPrimary: {
    color: colors.bg,
  },
  btnTextDanger: {
    color: colors.danger,
  },
  field: {
    marginBottom: space.md,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressBg: {
    height: 8,
    backgroundColor: colors.surface2,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.full,
  },
});
