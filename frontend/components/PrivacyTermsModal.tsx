import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';
import { radius, space } from '../theme';

interface PrivacyTermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacyTermsModal({ visible, onClose }: PrivacyTermsModalProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
        {/* Barra Superior */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t('privacyTerms.headerTitle')}
            </Text>
            <Text style={[styles.headerSub, { color: colors.muted }]}>
              {t('privacyTerms.headerSub')}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surface }]}>
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Conteúdo dos Termos */}
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.badge, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name="shield-checkmark" size={16} color={colors.accent} />
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              {t('privacyTerms.badgeText')}
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('privacyTerms.sec1Title')}
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {t('privacyTerms.sec1Text')}
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('privacyTerms.sec2Title')}
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {t('privacyTerms.sec2Text')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • {t('privacyTerms.sec2Bullet1')}
            </Text>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • {t('privacyTerms.sec2Bullet2')}
            </Text>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • {t('privacyTerms.sec2Bullet3')}
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('privacyTerms.sec3Title')}
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {t('privacyTerms.sec3Text')}
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('privacyTerms.sec4Title')}
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {t('privacyTerms.sec4Text')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • {t('privacyTerms.sec4Bullet1')}
            </Text>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • {t('privacyTerms.sec4Bullet2')}
            </Text>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • {t('privacyTerms.sec4Bullet3')}
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('privacyTerms.sec5Title')}
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {t('privacyTerms.sec5Text')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • {t('privacyTerms.sec5Bullet1')}
            </Text>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • {t('privacyTerms.sec5Bullet2')}
            </Text>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • {t('privacyTerms.sec5Bullet3')}
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('privacyTerms.sec6Title')}
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {t('privacyTerms.sec6Text')}
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {t('privacyTerms.sec6Subtext')}
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('privacyTerms.sec7Title')}
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {t('privacyTerms.sec7Text')}
          </Text>

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: colors.accent }]}
            onPress={onClose}
          >
            <Text style={[styles.confirmBtnText, { color: colors.bg }]}>{t('privacyTerms.agreeBtn')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: space.lg,
    paddingBottom: 50,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    gap: 8,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.9,
    marginBottom: 10,
  },
  bulletList: {
    marginBottom: 10,
    paddingLeft: 4,
    gap: 6,
  },
  bulletItem: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.9,
  },
  confirmBtn: {
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
