// Arquivo: src/hooks/usePatients.js
import { useState, useEffect } from 'react';
import { getPatients } from '../services/patientService';

/**
 * Hook para buscar e gerenciar a lista de pacientes do profissional.
 *
 * Retorna:
 *  - pacientes: array de pacientes
 *  - loading: boolean
 *  - erro: string | null
 *  - refetch: função para forçar nova busca
 */
export function usePatients() {
  const [pacientes, setPacientes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState(null);

  async function buscar() {
    setLoading(true);
    setErro(null);
    try {
      const resultado = await getPatients();
      setPacientes(resultado ?? []);
    } catch (err) {
      setErro(
        err.response?.data?.message ||
        'Não foi possível carregar os pacientes. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscar();
  }, []);

  return { pacientes, loading, erro, refetch: buscar };
}