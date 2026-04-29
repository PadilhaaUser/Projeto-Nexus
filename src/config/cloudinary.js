// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary — Armazenamento gratuito de imagens (alternativa ao Firebase Storage)
//
// COMO CONFIGURAR (grátis, sem cartão de crédito):
//  1. Acesse https://cloudinary.com e crie uma conta gratuita (25 GB/mês grátis)
//  2. No painel do Cloudinary, copie o "Cloud Name" (fica no canto superior esquerdo)
//  3. Vá em Settings → Upload → Add upload preset
//     - Signing mode: UNSIGNED
//     - Defina um nome para o preset (ex: nexus_products)
//     - Clique em Save
//  4. Preencha as variáveis abaixo com seus dados
// ─────────────────────────────────────────────────────────────────────────────

export const CLOUDINARY_CLOUD_NAME = 'dxzbkrtdp'; // ex: 'minha-empresa-123'
export const CLOUDINARY_UPLOAD_PRESET = 'nexus_products'; // ex: 'nexus_products'

export const isCloudinaryConfigured =
  !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);

/**
 * Envia uma imagem para o Cloudinary e retorna a URL pública.
 * Retorna null se o Cloudinary não estiver configurado.
 */
export const uploadToCloudinary = async (file) => {
  if (!isCloudinaryConfigured) return null;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Falha no upload para Cloudinary');
  }

  const data = await res.json();
  return data.secure_url;
};
