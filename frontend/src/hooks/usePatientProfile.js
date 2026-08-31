// Arquivo: frontend/src/hooks/usePatientProfile.js
import { useState, useEffect, useCallback } from 'react';
import { getPatient }             from '../services/patientService';
import { getTreatments }          from '../services/treatmentService';
import { getCheckinsByTreatment } from '../services/checkinService';
import { calculateRecoveryDay }   from '../utils/recoveryStatus';

/**
 * Hook centralizado para o perfil do paciente.
 * Separa o carregamento dos dados base (paciente + tratamento)
 * do carregamento do histórico de check-ins, permitindo
 * atualizar cada parte de forma independente.
 */
export function usePatientProfile(pacienteId) {
  const [paciente,        setPaciente]        = useState(null);
  const [tratamento,      setTratamento]      = useState(null);
  const [checkins,        setCheckins]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [loadingCheckins, setLoadingCheckins] = useState(false);
  const [erro,            setErro]            = useState('');
  const [erroCheckins,    setErroCheckins]    = useState('');

  // ── Busca check-ins de um tratamento específico ────────────────────────
  const buscarCheckins = useCallback(async (tratamentoId) => {
    if (!tratamentoId) return;
    setLoadingCheckins(true);
    setErroCheckins('');
    try {
      const data = await getCheckinsByTreatment(tratamentoId);
      setCheckins(data ?? []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Não foi possível carregar o histórico.';
      console.error('[usePatientProfile] Erro ao buscar check-ins:', err);
      setErroCheckins(msg);
      setCheckins([]);
    } finally {
      setLoadingCheckins(false);
    }
  }, []);

  // ── Busca paciente + tratamento ────────────────────────────────────────
  const buscar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const [pac, trats] = await Promise.all([
        getPatient(pacienteId),
        getTreatments(),
      ]);

      setPaciente(pac);

      const trat =
        trats?.find(t => t.paciente?.id === pacienteId && t.status === 'ativo') ??
        trats?.find(t => t.paciente?.id === pacienteId);

      if (trat) {
        const tratFormatado = {
          ...trat,
          diaAtual:  calculateRecoveryDay(trat.dataProcedimento),
          totalDias: trat.versaoProtocolo?.totalDias ?? 7,
        };
        setTratamento(tratFormatado);
        buscarCheckins(trat.id);
      } else {
        setTratamento(null);
        setCheckins([]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Não foi possível carregar o paciente.';
      console.error('[usePatientProfile] Erro ao buscar paciente:', err);
      setErro(msg);
    } finally {
      setLoading(false);
    }
  }, [pacienteId, buscarCheckins]);

  useEffect(() => { buscar(); }, [buscar]);

  return {
    // Dados
    paciente,
    tratamento,
    checkins,
    // Estados de loading
    loading,
    loadingCheckins,
    // Erros
    erro,
    erroCheckins,
    // Ações
    refetch:         buscar,
    refetchCheckins: () => tratamento?.id && buscarCheckins(tratamento.id),
  };
}