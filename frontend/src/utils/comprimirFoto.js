// Arquivo: src/utils/comprimirFoto.js

const LADO_MAXIMO = 1600;

/**
 * Reduz a foto no próprio celular antes de enviar: 3 fotos de 4 MB viram ~600 KB no total,
 * o que importa para quem está no 4G. Regravar no canvas também descarta os metadados
 * (inclusive a localização). O servidor reprocessa de novo — isto aqui é só economia de dados.
 * Se o navegador não conseguir ler o formato, envia o arquivo original.
 */
export async function comprimirFoto(arquivo) {
  try {
    const imagem = await createImageBitmap(arquivo);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(imagem.width * escala);
    canvas.height = Math.round(imagem.height * escala);
    canvas.getContext('2d').drawImage(imagem, 0, 0, canvas.width, canvas.height);
    imagem.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    return blob ?? arquivo;
  } catch {
    return arquivo;
  }
}
