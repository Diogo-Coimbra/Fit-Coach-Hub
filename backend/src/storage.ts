import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export interface SaveImageResult {
  url: string;
  filename: string;
  storage: 'cloudinary' | 'local';
}

/**
 * Guarda uma fotografia recebida em Base64 ou Data URI.
 * - Se as variáveis CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET estiverem configuradas no .env,
 *   faz o upload direto para a CDN Cloudinary (solução permanente para produção em nuvem).
 * - Caso contrário, guarda em disco local na pasta uploads/ (ideal para desenvolvimento local).
 */
export async function saveUploadedImage(
  imageBase64: string,
  host: string,
  protocol: string = 'http'
): Promise<SaveImageResult> {
  const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let ext = 'jpg';
  let mimeType = 'image/jpeg';
  let dataBuffer: Buffer;

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    dataBuffer = Buffer.from(matches[2], 'base64');
  } else {
    dataBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  }

  // 1. Tentar upload para Cloudinary caso as credenciais estejam presentes
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    try {
      const timestamp = Math.round(Date.now() / 1000);
      const signatureString = `folder=fit-ai-tracker&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

      const fileDataUri = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:${mimeType};base64,${imageBase64}`;

      const formData = new URLSearchParams();
      formData.append('file', fileDataUri);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', 'fit-ai-tracker');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = (await response.json()) as any;
        console.log(`☁️ [Cloud Storage] Fotografia guardada no Cloudinary: ${result.secure_url}`);
        return {
          url: result.secure_url,
          filename: result.public_id || `cloud_${Date.now()}`,
          storage: 'cloudinary',
        };
      } else {
        const errText = await response.text();
        console.warn('⚠️ [Cloud Storage] Resposta não-200 do Cloudinary, a recorrer a armazenamento local:', errText);
      }
    } catch (cloudErr) {
      console.warn('⚠️ [Cloud Storage] Falha ao contactar Cloudinary, a recorrer a armazenamento local:', cloudErr);
    }
  }

  // 2. Armazenamento local (uploads/)
  const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(filePath, dataBuffer);

  const cleanHost = host.replace(/\/+$/, '');
  const publicUrl = `${protocol}://${cleanHost}/uploads/${filename}`;

  return {
    url: publicUrl,
    filename,
    storage: 'local',
  };
}
