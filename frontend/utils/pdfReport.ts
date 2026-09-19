import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export interface CoachReportData {
  coachName: string;
  coachBrandName?: string | null;
  coachLogoUrl?: string | null;
  coachPhone?: string | null;
  clientName: string;
  clientEmail: string;
  currentWeight?: number | string;
  initialWeight?: number | string;
  weightDelta?: number | string;
  totalWorkouts: number;
  currentStreak: number;
  bodyFat?: number | string;
  beforePhotoUrl?: string | null;
  afterPhotoUrl?: string | null;
  beforeDate?: string;
  afterDate?: string;
  coachNotes?: string;
}

export async function generateAndShareCoachReportPDF(data: CoachReportData): Promise<string> {
  const brandTitle = data.coachBrandName || `Equipa ${data.coachName}`;
  const todayStr = new Date().toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Relatório de Evolução - ${data.clientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: #0F172A;
      background-color: #FFFFFF;
      padding: 36px 40px;
      line-height: 1.5;
    }

    .header-table {
      width: 100%;
      border-bottom: 3px solid #10B981;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .brand-title {
      font-size: 24px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.5px;
    }

    .brand-sub {
      font-size: 13px;
      color: #10B981;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .doc-badge {
      text-align: right;
    }

    .report-pill {
      display: inline-block;
      background: #F1F5F9;
      color: #334155;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }

    .meta-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
    }

    .meta-item {
      font-size: 13px;
    }

    .meta-item strong {
      display: block;
      color: #64748B;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .meta-item span {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
    }

    .section-heading {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 12px;
      border-left: 4px solid #10B981;
      padding-left: 10px;
    }

    .kpi-grid {
      display: table;
      width: 100%;
      margin-bottom: 24px;
    }

    .kpi-card {
      display: table-cell;
      width: 25%;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 14px;
      text-align: center;
    }

    .kpi-card + .kpi-card {
      border-left: none;
    }

    .kpi-val {
      font-size: 24px;
      font-weight: 900;
      color: #10B981;
      line-height: 1.1;
    }

    .kpi-label {
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
      margin-top: 4px;
      text-transform: uppercase;
    }

    .photos-container {
      display: table;
      width: 100%;
      margin-bottom: 28px;
    }

    .photo-col {
      display: table-cell;
      width: 50%;
      padding: 0 8px;
      vertical-align: top;
    }

    .photo-box {
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      background: #F8FAFC;
      text-align: center;
      padding: 8px;
    }

    .photo-box.after {
      border-color: #10B981;
    }

    .photo-header {
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .photo-img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 8px;
    }

    .photo-footer {
      font-size: 11px;
      color: #64748B;
      margin-top: 6px;
      font-weight: 600;
    }

    .notes-card {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .notes-title {
      font-size: 13px;
      font-weight: 800;
      color: #166534;
      margin-bottom: 6px;
    }

    .notes-text {
      font-size: 13px;
      color: #14532D;
      line-height: 1.6;
    }

    .footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 16px;
      font-size: 11px;
      color: #94A3B8;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>

  <!-- CABEÇALHO COM MARCA DO PT -->
  <table class="header-table">
    <tr>
      <td style="vertical-align: middle;">
        <div class="brand-title">${brandTitle}</div>
        <div class="brand-sub">Personal Training & Consultoria Desportiva</div>
      </td>
      <td class="doc-badge" style="vertical-align: middle;">
        <div class="report-pill">RELATÓRIO MENSAL</div>
        <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Emitido a ${todayStr}</div>
      </td>
    </tr>
  </table>

  <!-- DADOS DO ALUNO E PT -->
  <div class="meta-box">
    <div class="meta-item">
      <strong>Aluno(a)</strong>
      <span>${data.clientName}</span>
    </div>
    <div class="meta-item">
      <strong>Contacto Aluno</strong>
      <span>${data.clientEmail}</span>
    </div>
    <div class="meta-item">
      <strong>Treinador Responsável</strong>
      <span>${data.coachName}</span>
    </div>
    ${data.coachPhone ? `
    <div class="meta-item">
      <strong>Contacto PT</strong>
      <span>${data.coachPhone}</span>
    </div>` : ''}
  </div>

  <!-- MÉTRICAS DE DESEMPENHO (KPIS) -->
  <div class="section-heading">Resumo de Indicadores de Evolução</div>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-val">${data.currentWeight || '--'} <span style="font-size: 14px;">kg</span></div>
      <div class="kpi-label">Peso Corporal Atual</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val" style="color: #0F172A;">${data.weightDelta ? `${data.weightDelta} kg` : '0 kg'}</div>
      <div class="kpi-label">Variação de Peso</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val">${data.totalWorkouts}</div>
      <div class="kpi-label">Treinos Concluídos</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val" style="color: #F59E0B;">${data.currentStreak} 🔥</div>
      <div class="kpi-label">Semanas em Racha</div>
    </div>
  </div>

  <!-- FOTOGRAFIAS COMPARATIVAS (ANTES & DEPOIS) -->
  ${data.beforePhotoUrl && data.afterPhotoUrl ? `
  <div class="section-heading">Comparador Fotográfico de Evolução Física</div>
  <div class="photos-container">
    <div class="photo-col">
      <div class="photo-box">
        <div class="photo-header" style="color: #64748B;">FOTO INICIAL (ANTES)</div>
        <img src="${data.beforePhotoUrl}" class="photo-img" alt="Foto Antes">
        <div class="photo-footer">${data.beforeDate || 'Início'} • ${data.initialWeight ? `${data.initialWeight} kg` : ''}</div>
      </div>
    </div>
    <div class="photo-col">
      <div class="photo-box after">
        <div class="photo-header" style="color: #10B981;">FOTO RECENTE (DEPOIS)</div>
        <img src="${data.afterPhotoUrl}" class="photo-img" alt="Foto Depois">
        <div class="photo-footer">${data.afterDate || 'Recente'} • ${data.currentWeight ? `${data.currentWeight} kg` : ''}</div>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- FEEDBACK DO TREINADOR -->
  <div class="notes-card">
    <div class="notes-title">💬 Parecer do Personal Trainer & Próximos Passos:</div>
    <div class="notes-text">
      ${data.coachNotes || `Parabéns pela dedicação e consistência demonstrada ao longo deste período. O cumprimento da divisão semanal de treinos e o registo de cargas têm sido fundamentais para os ganhos obtidos. No próximo mesociclo, iremos intensificar o trabalho de sobrecarga progressiva e ajustar o volume de séries para potenciar ainda mais os resultados.`}
    </div>
  </div>

  <!-- RODAPÉ -->
  <div class="footer">
    <div>Documento gerado por <strong>Fit Coach Hub</strong> para Personal Trainers profissionais.</div>
    <div>${brandTitle} • Todos os direitos reservados</div>
  </div>

</body>
</html>
  `;

  const { uri } = await Print.printToFileAsync({ html });

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(uri, '_blank');
    }
  } else {
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `Relatório de Evolução - ${data.clientName}`,
    });
  }

  return uri;
}
