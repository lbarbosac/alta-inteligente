// Arquivo: src/utils/formatDate.js
// Formatação de datas e nomes usada nas telas. Antes cada página tinha a sua cópia.

export function formatarData(data) {
  if (!data) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(data));
}

// Datas @db.Date chegam como meia-noite UTC — formatar em UTC para não voltar um dia no Brasil
export function formatarDataCivil(data) {
  if (!data) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(data));
}

export function formatarDataHora(data) {
  if (!data) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(data));
}

export function formatarRelativo(data) {
  if (!data) return '—';
  const min = Math.floor((Date.now() - new Date(data).getTime()) / 60000);
  if (min < 1)  return 'agora';
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} dia${dias !== 1 ? 's' : ''}`;
}

// Hoje em AAAA-MM-DD no fuso do navegador, para o `max` de campo de data.
// toISOString() daria a data UTC: depois das 21h no Brasil já seria amanhã.
export function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dataPorExtenso(data = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(data);
}

export function saudacao(data = new Date()) {
  const hora = data.getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Datas @db.Date (meia-noite UTC): calcula a idade pelas partes UTC
export function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getUTCFullYear();
  const m = hoje.getMonth() - nasc.getUTCMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getUTCDate())) idade--;
  return idade;
}

export function getInitials(nome) {
  const partes = (nome ?? '').replace(/^(dra?|prof[a]?)\.?\s+/i, '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// "Dr. João Silva" → "Dr. João"; "Maria Souza" → "Maria"
export function nomeCurto(nome) {
  const partes = (nome ?? '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '';
  if (/^(dra?|prof[a]?)\.?$/i.test(partes[0]) && partes[1]) return `${partes[0]} ${partes[1]}`;
  return partes[0];
}
