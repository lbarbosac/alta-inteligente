// Arquivo: src/hooks/useDashboard.js
import { useState, useEffect } from 'react';
import { getDashboard } from '../services/dashboardService';

/**
 * Hook para buscar e gerenciar os dados do dashboard do profissional.
 *
 * Retorna:
 *  - dados: { cards, alertasCriticos, checkinsRecentes } | null
 *  - loading: boolean
 *  - erro: string | null
 *  - refetch: função para forçar nova busca
 */
export function useDashboard() {
  const [dados,   setDados]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  async function buscar() {
    setLoading(true);
    setErro(null);
    try {
      const resultado = await getDashboard();
      setDados(resultado);
    } catch (err) {
      setErro(
        err.response?.data?.message ||
        'Não foi possível carregar o dashboard. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscar();
  }, []);

  return { dados, loading, erro, refetch: buscar };
}