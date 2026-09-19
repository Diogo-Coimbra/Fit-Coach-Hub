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
import { radius, space } from '../theme';

interface PrivacyTermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacyTermsModal({ visible, onClose }: PrivacyTermsModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
        {/* Barra Superior */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Termos & Privacidade
            </Text>
            <Text style={[styles.headerSub, { color: colors.muted }]}>
              Termos de Serviço e Proteção de Dados (RGPD)
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
              Atualizado em Setembro de 2026 · Conforme com RGPD & App Store
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Objeto e Âmbito da Aplicação
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            A presente plataforma tem como objetivo proporcionar a Personal Trainers e respetivos alunos um ambiente digital para prescrição de treinos, monitorização de cargas, registo nutricional, check-ins de evolução corporal e comunicação direta. Ao utilizar a aplicação, o utilizador declara aceitar os presentes Termos de Uso.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Recolha e Finalidade de Dados Pessoais
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Para garantir o correto funcionamento do serviço, recolhemos os seguintes dados:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • <Text style={{ fontWeight: '700' }}>Dados de Registo:</Text> Nome, endereço de email e palavra-passe encriptada (ou identificador único autenticado via Google).
            </Text>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • <Text style={{ fontWeight: '700' }}>Dados Fisiológicos e de Saúde:</Text> Peso corporal, percentagem de massa gorda, registo de treinos efetuados, feedback de fadiga (RPE) e eventuais indicações de dor ou desconforto articular reportadas voluntariamente.
            </Text>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • <Text style={{ fontWeight: '700' }}>Fotografias de Evolução Corporal:</Text> Fotos enviadas nos check-ins semanais (frente, costas, perfil) com a finalidade exclusiva de avaliação técnica comparativa ("Antes & Depois") pelo treinador atribuído.
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. Confidencialidade e Isolamento dos Dados
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Todos os dados de saúde, registos de treino, fotografias e mensagens trocadas no chat são <Text style={{ fontWeight: '700' }}>estritamente confidenciais</Text> e isolados. Nenhum aluno tem acesso a dados de outros alunos. O acesso aos dados do aluno está estritamente restrito ao Personal Trainer com quem o aluno estabeleceu uma ligação consented por código de convite.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Segurança e Armazenamento
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Adotamos medidas técnicas robustas de salvaguarda:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • Palavras-passe encriptadas unidirecionalmente com o algoritmo BCrypt com salt hashing.
            </Text>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • Sessões autenticadas através de JSON Web Tokens (JWT) seguros e comunicação protegida por protocolo HTTPS/SSL.
            </Text>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • Processamento de pagamentos efetuado integralmente através da plataforma Stripe, sem que quaisquer dados de cartão de crédito passem pelos nossos servidores.
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Direitos do Titular dos Dados (RGPD / GDPR)
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Ao abrigo do Regulamento Geral sobre a Proteção de Dados (RGPD), o utilizador tem o direito de:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • Aceder, consultar e atualizar os seus dados a qualquer momento no ecrã de Perfil.
            </Text>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • Exportar relatórios em formato PDF com as suas métricas e fotografias.
            </Text>
            <Text style={[styles.bulletItem, { color: colors.text }]}>
              • Solicitar a remoção ou revogação de consentimento de acesso ao treinador.
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Direito ao Esquecimento e Eliminação de Conta (Diretriz Apple 5.1.1)
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Em estrito cumprimento das diretrizes de privacidade internacionais e da Apple App Store (Diretriz 5.1.1(v)), o utilizador tem a faculdade de <Text style={{ fontWeight: '700' }}>eliminar permanentemente a sua conta</Text> diretamente dentro da aplicação através do botão "Eliminar Conta" disponível nas definições do seu Perfil.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            A eliminação da conta é imediata, irreversível e remove em cascata todos os treinos, registos de séries, diários de refeições, check-ins, fotografias de evolução, ficheiros de áudio e histórico de conversas dos nossos servidores.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Contacto e Suporte
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Para qualquer esclarecimento, exercício dos seus direitos de privacidade ou suporte técnico, poderá contactar a equipa através do endereço: <Text style={{ fontWeight: '700', color: colors.accent }}>suporte@fit-ai.app</Text>.
          </Text>

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: colors.accent }]}
            onPress={onClose}
          >
            <Text style={[styles.confirmBtnText, { color: colors.bg }]}>Compreendi e Concordo</Text>
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
