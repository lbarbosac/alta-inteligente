// Arquivo: src/utils/painLevelColor.js
// Zonas de dor (specs/design.md §2). A cor só aparece em atenção (7–8) e crítico (9–10),
// as mesmas faixas do calculatePatientStatus do backend.

export function zonaDor(nivel) {
  if (nivel === null || nivel === undefined) return 'vazia';
  if (nivel >= 9) return 'critico';
  if (nivel >= 7) return 'atencao';
  return 'normal';
}

export const COR_ZONA = {
  //         chip = número em listas     selecionado = escala do paciente    grafico = ponto do gráfico
  vazia:   { chip: 'bg-neutral-100 text-neutral-600', selecionado: 'bg-ink text-white',     texto: 'text-neutral-600', grafico: '#A3A3A3' },
  normal:  { chip: 'bg-neutral-100 text-ink',         selecionado: 'bg-ink text-white',     texto: 'text-ink',         grafico: '#0A0A0A' },
  atencao: { chip: 'bg-amber-500 text-ink',           selecionado: 'bg-amber-500 text-ink', texto: 'text-amber-700',   grafico: '#F59E0B' },
  critico: { chip: 'bg-red-600 text-white',           selecionado: 'bg-red-600 text-white', texto: 'text-red-600',     grafico: '#DC2626' },
};

export function descricaoDor(nivel) {
  if (!nivel)     return 'Toque no número que representa sua dor agora.';
  if (nivel <= 3) return 'Dor leve ou sem dor.';
  if (nivel <= 6) return 'Dor moderada. Siga as orientações.';
  if (nivel <= 8) return 'Dor forte. Fique atento.';
  return 'Dor intensa. Avise seu profissional.';
}
