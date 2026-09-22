// Arquivo: src/hooks/useProtocols.js
import { useEffect, useState } from 'react';
import { getProtocols } from '../services/protocolService';

const porNome = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base', numeric: true });

/**
 * Protocolos ativos do profissional em ordem alfabética, já no formato de opções do <Select>.
 *
 * Carrega quando `carregar` fica verdadeiro (ex.: ao abrir o modal) e recarrega a cada abertura,
 * para pegar protocolo criado depois. Na reabertura a lista anterior aparece enquanto atualiza.
 */
export function useProtocols(carregar = true) {
  const [protocolos, setProtocolos] = useState(null); // null = ainda não carregou
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!carregar) return;
    let cancelado = false;
    setErro('');
    getProtocols()
      .then((lista) => { if (!cancelado) setProtocolos((lista ?? []).filter((p) => p.ativo).sort(porNome)); })
      .catch(() => { if (!cancelado) setErro('Não foi possível carregar os protocolos.'); });
    return () => { cancelado = true; };
  }, [carregar]);

  const opcoes = (protocolos ?? []).map((p) => ({
    value: p.id,
    label: p.nome,
    detail: `${p.diasPadrao} ${p.diasPadrao === 1 ? 'dia' : 'dias'}`,
  }));

  return { opcoes, carregando: protocolos === null && !erro, erro };
}
