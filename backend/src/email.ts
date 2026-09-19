import { Resend } from 'resend';
import nodemailer, { Transporter } from 'nodemailer';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Configuração SMTP alternativa (ex: Gmail com App Password ou Brevo / SendGrid / Custom SMTP)
const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || '';
const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || '';
const smtpHost = process.env.SMTP_HOST || (process.env.GMAIL_USER ? 'smtp.gmail.com' : '');
const smtpPort = Number(process.env.SMTP_PORT) || 465;

const emailFrom = process.env.EMAIL_FROM || 'Fit Coach Hub <onboarding@resend.dev>';

let transporter: Transporter | null = null;
if (smtpUser && smtpPass && smtpHost) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  mode: 'resend' | 'smtp' | 'dev';
  error?: string;
}

/**
 * Envia email de recuperação de palavra-passe com código de 6 dígitos
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  code: string,
  userName?: string
): Promise<SendEmailResult> {
  const subject = `🔑 Código de Recuperação de Palavra-Passe: ${code} · Fit Coach Hub`;

  const html = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B0D10; color: #FFFFFF; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background-color: #12151A; border: 1px solid #1E242C; border-radius: 16px; overflow: hidden; padding: 32px 28px; }
        .logo { font-size: 24px; font-weight: 800; color: #4F46E5; letter-spacing: -0.5px; margin-bottom: 24px; }
        .title { font-size: 20px; font-weight: 700; color: #FFFFFF; margin-bottom: 12px; }
        .text { font-size: 15px; line-height: 1.6; color: #94A3B8; margin-bottom: 24px; }
        .code-box { background: linear-gradient(135deg, #18202A 0%, #151A22 100%); border: 2px dashed #4F46E5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .code { font-size: 36px; font-weight: 800; color: #10B981; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; }
        .expiry { font-size: 13px; color: #64748B; margin-top: 8px; }
        .footer { font-size: 12px; color: #475569; border-top: 1px solid #1E242C; padding-top: 20px; margin-top: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">⚡ Fit Coach Hub</div>
        <div class="title">Recuperação de Palavra-Passe</div>
        <p class="text">
          Olá${userName ? ` <strong>${userName}</strong>` : ''},<br>
          Recebemos um pedido para redefinir a palavra-passe associada à tua conta <strong>Fit Coach Hub</strong>. Utiliza o código de verificação abaixo para avançar:
        </p>
        
        <div class="code-box">
          <div class="code">${code}</div>
          <div class="expiry">⏳ Válido durante os próximos 15 minutos</div>
        </div>

        <p class="text">
          Se não solicitaste esta alteração, podes ignorar com segurança este email — a tua palavra-passe atual continuará segura e nada será alterado.
        </p>

        <div class="footer">
          Fit Coach Hub · Plataforma Inteligente para Personal Trainers & Alunos<br>
          Este é um email automático de segurança. Por favor, não respondas a esta mensagem.
        </div>
      </div>
    </body>
    </html>
  `;

  const preferSmtp = process.env.EMAIL_SERVICE === 'gmail' || process.env.EMAIL_SERVICE === 'smtp';

  // 1. Enviar via SMTP / Gmail (se preferido ou como método principal)
  if (preferSmtp && transporter) {
    try {
      const fromAddr = smtpUser ? `Fit Coach Hub <${smtpUser}>` : emailFrom;
      const info = await transporter.sendMail({
        from: fromAddr,
        to: toEmail,
        subject,
        html,
      });
      console.log(`📧 [Gmail/SMTP] Email enviado com sucesso para ${toEmail} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, mode: 'smtp' };
    } catch (err: any) {
      console.error('❌ Falha no envio Gmail/SMTP:', err.message);
    }
  }

  // 2. Enviar via Resend (se chave API estiver configurada)
  if (resend) {
    try {
      const response = await resend.emails.send({
        from: emailFrom,
        to: toEmail,
        subject,
        html,
      });

      if (response.error) {
        console.warn('⚠️ Erro ao enviar email via Resend:', response.error);
      } else {
        console.log(`📧 [Resend] Email enviado com sucesso para ${toEmail} (ID: ${response.data?.id})`);
        return { success: true, messageId: response.data?.id, mode: 'resend' };
      }
    } catch (err: any) {
      console.error('❌ Falha na chamada da API Resend:', err.message);
    }
  }

  // 3. Fallback para SMTP / Gmail (caso o Resend não esteja configurado ou falhe o envio para domínio externo)
  if (!preferSmtp && transporter) {
    try {
      const fromAddr = smtpUser ? `Fit Coach Hub <${smtpUser}>` : emailFrom;
      const info = await transporter.sendMail({
        from: fromAddr,
        to: toEmail,
        subject,
        html,
      });
      console.log(`📧 [Gmail/SMTP Fallback] Email enviado com sucesso para ${toEmail} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, mode: 'smtp' };
    } catch (err: any) {
      console.error('❌ Falha no envio Gmail/SMTP Fallback:', err.message);
    }
  }

  // 3. Modo Dev / Fallback Local (quando ainda não há credenciais de email ativas)
  console.log(`\n======================================================`);
  console.log(`📧 [SIMULAÇÃO DE EMAIL - FIT COACH HUB]`);
  console.log(`📬 Para: ${toEmail}`);
  console.log(`📋 Assunto: ${subject}`);
  console.log(`🔑 Código: ${code}`);
  console.log(`💡 Dica: Para envio real, adiciona RESEND_API_KEY ou GMAIL_USER/GMAIL_APP_PASS no ficheiro backend/.env`);
  console.log(`======================================================\n`);

  return { success: true, mode: 'dev' };
}
