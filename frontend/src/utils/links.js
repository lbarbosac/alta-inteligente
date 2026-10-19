// Arquivo: src/utils/links.js
import api from '../services/api';

/** A API devolve o caminho da foto (/api/v1/fotos/...): aqui vira endereço completo do servidor. */
export function urlDaApi(caminho) {
  return new URL(caminho, api.defaults.baseURL).toString();
}

/** Link do portal do paciente, no endereço em que o sistema está aberto. */
export function linkDoPaciente(tokenPaciente) {
  return `${window.location.origin}/p/${tokenPaciente}`;
}

/**
 * Link "clique para conversar" do WhatsApp com a mensagem pronta.
 * Abre o WhatsApp do próprio profissional — não precisa de conta na Meta.
 */
export function linkWhatsApp(telefone, mensagem) {
  const digitos = String(telefone ?? '').replace(/\D/g, '');
  const numero = digitos.length === 10 || digitos.length === 11 ? `55${digitos}` : digitos;
  if (numero.length < 12) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
