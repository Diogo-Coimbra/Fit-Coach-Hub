import React, { useState, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorScheme, radius, space } from '../theme';
import { api } from '../services/api';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  onClientAdded?: () => void;
}

export default function InviteModal({ visible, onClose, onClientAdded }: InviteModalProps) {
  const { colors, mode } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    try {
      setLoading(true);
      const res = await api.post('/api/coach/invites', {});
      setInviteCode(res.code);
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!inviteCode) return;
    try {
      await Share.share({
        message: t('invite.shareMessage', { code: inviteCode }),
      });
    } catch (error) {
      console.error('Erro ao partilhar:', error);
    }
  };

  const handleClose = () => {
    setInviteCode(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="person-add-outline" size={22} color={colors.accent} />
              <Text style={styles.title}>{t('invite.title')}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            {t('invite.desc')}
          </Text>

          {inviteCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>{t('invite.codeLabel')}</Text>
              <Text style={styles.codeText}>{inviteCode}</Text>
              <Text style={styles.codeExpiry}>{t('invite.validFor')}</Text>

              <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
                <Ionicons name="share-social-outline" size={18} color={colors.bg} />
                <Text style={styles.shareBtnText}>{t('invite.shareBtn')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGenerateCode}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <>
                  <Ionicons name="key-outline" size={18} color={colors.bg} />
                  <Text style={styles.generateBtnText}>{t('invite.generateBtn')}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.lg,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  codeBox: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  codeLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  codeText: {
    color: colors.accent,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 2,
    marginVertical: 4,
  },
  codeExpiry: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 12,
  },
  shareBtn: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareBtnText: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: '700',
  },
  generateBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateBtnText: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: '700',
  },
});
