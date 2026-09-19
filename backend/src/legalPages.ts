export function renderLegalPage(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} · Fit Coach Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0B0D10;
      --card: #13171F;
      --border: #212836;
      --text: #F1F5F9;
      --muted: #94A3B8;
      --accent: #10B981;
      --accent-dim: rgba(16, 185, 129, 0.12);
      --primary: #4F46E5;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.65;
      padding: 32px 16px;
    }
    .wrapper {
      max-width: 800px;
      margin: 0 auto;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 40px 36px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }
    .logo-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--accent), var(--primary));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
    }
    .header-text h1 {
      font-size: 24px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }
    .header-text p {
      font-size: 13px;
      color: var(--muted);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: var(--accent-dim);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 999px;
      color: var(--accent);
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 28px;
    }
    h2 {
      font-size: 18px;
      font-weight: 700;
      color: #FFFFFF;
      margin-top: 32px;
      margin-bottom: 12px;
    }
    p {
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 14px;
    }
    p strong, li strong {
      color: #FFFFFF;
    }
    ul {
      list-style-type: none;
      padding-left: 0;
      margin-bottom: 18px;
    }
    li {
      position: relative;
      padding-left: 24px;
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 10px;
    }
    li::before {
      content: "•";
      position: absolute;
      left: 6px;
      color: var(--accent);
      font-weight: bold;
      font-size: 18px;
      line-height: 1;
    }
    .highlight-box {
      background: rgba(79, 70, 229, 0.1);
      border: 1px solid rgba(79, 70, 229, 0.3);
      border-radius: 12px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .highlight-box p {
      margin-bottom: 0;
      color: #CBD5E1;
    }
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 12px;
      color: var(--muted);
    }
    .footer a {
      color: var(--accent);
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    @media (max-width: 640px) {
      .wrapper {
        padding: 24px 20px;
      }
      .header-text h1 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-badge">⚡</div>
      <div class="header-text">
        <h1>Fit Coach Hub</h1>
        <p>Plataforma Inteligente para Personal Trainers & Alunos</p>
      </div>
    </div>
    <div class="badge">
      🛡️ Conforme com RGPD (EU 2016/679) & Apple App Store Review Guidelines
    </div>
    ${contentHtml}
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Fit Coach Hub. Todos os direitos reservados.</p>
      <p>
        <a href="/privacy">Política de Privacidade</a> · 
        <a href="/terms">Termos de Serviço</a> · 
        <a href="mailto:suporte@fitcoachhub.com">suporte@fitcoachhub.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export const privacyPolicyHtml = `
  <h2>Política de Privacidade & Proteção de Dados Pessoais</h2>
  <p>Última atualização: Setembro de 2026</p>

  <h2>1. Objeto e Responsável pelo Tratamento</h2>
  <p>
    A aplicação <strong>Fit Coach Hub</strong> (doravante "Aplicação" ou "Serviço") é disponibilizada com o objetivo de conectar Personal Trainers e alunos para prescrição técnica de planos de treino, monitorização de cargas, acompanhamento nutricional e check-ins físicos de evolução.
  </p>

  <h2>2. Dados Pessoais Recolhidos</h2>
  <p>Para o fornecimento das funcionalidades da Aplicação, recolhemos as seguintes categorias de dados:</p>
  <ul>
    <li><strong>Dados de Identificação e Registo:</strong> Nome, endereço de email, fotografia de perfil e palavra-passe encriptada (ou identificador único autenticado através do Google OAuth).</li>
    <li><strong>Dados Fisiológicos e de Treino:</strong> Peso corporal, estimativa de massa gorda, séries, repetições, cargas utilizadas, tempo de descanso, esforço percebido (RPE) e notas de esforço.</li>
    <li><strong>Dados de Saúde e Bem-Estar:</strong> Níveis de energia, qualidade do sono, adesão à dieta e indicação voluntária de dores ou desconfortos articulares registados pelo aluno nos check-ins e fim de treino.</li>
    <li><strong>Fotografias de Evolução Corporal:</strong> Fotos enviadas semanalmente (frente, costas, perfil) com o propósito restrito de avaliação visual e comparativa pelo Personal Trainer atribuído.</li>
    <li><strong>Registos Nutricionais:</strong> Fotografias de pratos e estimativa aproximada de calorias e macronutrientes (proteína, hidratos de carbono e gorduras) processados por inteligência artificial.</li>
    <li><strong>Mensagens e Conteúdos Multimédia:</strong> Mensagens de texto, fotos, vídeos e notas de voz trocadas no canal de chat privado entre o treinador e o aluno.</li>
  </ul>

  <h2>3. Confidencialidade e Isolamento de Dados</h2>
  <div class="highlight-box">
    <p>
      <strong>Garantia de Isolamento:</strong> Os teus dados fisiológicos, fotografias de evolução e conversas privadas nunca são partilhados com outros alunos ou terceiros para fins de marketing. O acesso aos dados do aluno está estritamente restrito ao Personal Trainer com quem estabeleceste uma ligação autorizada via código de convite.
    </p>
  </div>

  <h2>4. Medidas de Segurança da Informação</h2>
  <ul>
    <li><strong>Encriptação de Palavras-Passe:</strong> As palavras-passe são encriptadas de forma irreversível utilizando o algoritmo <strong>BCrypt com salt hashing</strong>.</li>
    <li><strong>Comunicação Segura:</strong> Todas as transmissões de dados entre a aplicação móvel e os nossos servidores são cifradas por HTTPS/TLS.</li>
    <li><strong>Pagamentos Seguros:</strong> Todos os dados de subscrições e pagamentos com cartão são geridos de forma estanque pela plataforma de pagamentos certificada <strong>Stripe</strong>. Os nossos servidores não guardam nem têm acesso aos teus números de cartão bancário.</li>
  </ul>

  <h2>5. Direitos do Titular dos Dados (RGPD)</h2>
  <p>Nos termos do Regulamento Geral sobre a Proteção de Dados (RGPD), assistem-te os seguintes direitos:</p>
  <ul>
    <li>Direito de acesso, consulta e retificação dos teus dados pessoais a qualquer momento na secção "Perfil".</li>
    <li>Direito de exportação de dados e relatórios de progresso em formato PDF.</li>
    <li>Direito de revogação de consentimento ou desvinculação do Personal Trainer.</li>
  </ul>

  <h2>6. Direito ao Esquecimento e Eliminação Imediata de Conta (Diretriz Apple 5.1.1)</h2>
  <p>
    Em estrito cumprimento das diretrizes de privacidade internacionais e da Apple App Store (Diretriz 5.1.1(v)), podes <strong>eliminar permanentemente a tua conta e todos os dados associados a qualquer momento</strong> diretamente dentro da aplicação através do botão <em>"Eliminar Conta"</em> localizado no ecrã de Perfil.
  </p>
  <p>
    A eliminação é imediata e remove em cascata da nossa base de dados: conta de utilizador, treinos prescritos, histórico de cargas, fotografias corporais de check-in, registos alimentares, mensagens de chat e ficheiros de áudio.
  </p>

  <h2>7. Contactos de Suporte e Privacidade</h2>
  <p>
    Para esclarecer qualquer dúvida sobre esta política ou exercer os teus direitos de privacidade, contacta o nosso Encarregado de Proteção de Dados através do email: 
    <strong><a href="mailto:suporte@fitcoachhub.com">suporte@fitcoachhub.com</a></strong>.
  </p>
`;

export const termsOfServiceHtml = `
  <h2>Termos de Serviço & Condições Gerais de Utilização</h2>
  <p>Última atualização: Setembro de 2026</p>

  <h2>1. Aceitação dos Termos</h2>
  <p>
    Ao criar uma conta ou utilizar a aplicação móvel <strong>Fit Coach Hub</strong>, concordas em ficar vinculado aos presentes Termos de Serviço. Caso não concordes com algum dos termos, deves cessar imediatamente a utilização da plataforma.
  </p>

  <h2>2. Descrição do Serviço</h2>
  <p>
    O <strong>Fit Coach Hub</strong> é uma plataforma SaaS (Software as a Service) concebida para apoiar Personal Trainers na gestão e prescrição técnica de programas de treino para os seus alunos, proporcionando ferramentas de diário de treino, registo de cargas, check-ins fotográficos de evolução, cálculo nutricional auxiliado por inteligência artificial e comunicação direta.
  </p>

  <h2>3. Isenção de Responsabilidade Médica</h2>
  <div class="highlight-box">
    <p>
      <strong>Aviso de Saúde e Desporto:</strong> A aplicação Fit Coach Hub e os seus algoritmos de inteligência artificial destinam-se exclusivamente a fins desportivos e informativos. Não constituem aconselhamento médico, diagnóstico nem substituem o acompanhamento presencial de um profissional de saúde qualificado. A realização de exercícios físicos envolve riscos inerentes; consulta o teu médico assistente antes de iniciar qualquer programa de esforço intenso.
    </p>
  </div>

  <h2>4. Subscrições, Faturação e Período de Testes (PTs)</h2>
  <ul>
    <li>Os Personal Trainers beneficiam de um período experimental gratuito de 14 dias para avaliação completa das funcionalidades profissionais.</li>
    <li>Findo o período de avaliação, o acesso contínuo às ferramentas de prescrição e gestão de múltiplos alunos requer a ativação de uma subscrição mensal através da plataforma de pagamento Stripe.</li>
    <li>O utilizador pode cancelar a renovação da sua subscrição a qualquer momento através do Portal de Faturação, mantendo o acesso até ao término do ciclo contratado.</li>
  </ul>

  <h2>5. Conduta e Responsabilidades do Utilizador</h2>
  <p>Ao utilizar o serviço, comprometes-te a:</p>
  <ul>
    <li>Fornecer dados verdadeiros no registo e manter a confidencialidade da tua palavra-passe.</li>
    <li>Não partilhar conteúdos ofensivos, ilícitos, discriminatórios ou inapropriados através do canal de chat ou fotografias de check-in.</li>
    <li>Respeitar a propriedade intelectual de rotinas, metodologias e materiais prescritos pelo teu treinador.</li>
  </ul>

  <h2>6. Rescisão e Encerramento de Conta</h2>
  <p>
    O utilizador tem o direito de encerrar a sua conta a qualquer instante no ecrã de Perfil. Reservamo-nos o direito de suspender ou terminar o acesso a utilizadores que violem flagrantemente os presentes Termos de Serviço ou utilizem a plataforma de forma fraudulenta.
  </p>

  <h2>7. Lei Aplicável e Foro</h2>
  <p>
    Os presentes termos regem-se pela legislação portuguesa e pelas normas comunitárias europeias aplicáveis. Para a resolução de qualquer litígio emergente da utilização do serviço, é competente o foro da comarca da sede do prestador de serviço.
  </p>

  <h2>8. Contacto</h2>
  <p>
    Questões comerciais, legais ou técnicas devem ser dirigidas a: <strong><a href="mailto:suporte@fitcoachhub.com">suporte@fitcoachhub.com</a></strong>.
  </p>
`;
