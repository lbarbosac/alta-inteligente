// Arquivo: src/hooks/usePatients.js
import { useState, useEffect } from 'react';
import { getPatients } from '../services/patientService';
import { getTreatments } from '../services/treatmentService';
import { calculatePatientStatus, calculateRecoveryDay } from '../utils/recoveryStatus';

/**
 * Lista de pacientes do profissional, já com o tratamento atual e o status clínico.
 *
 * Antes a lista mostrava "Sem check-in" fixo para todo mundo. Os tratamentos já trazem o
 * último check-in (GET /treatments), então o status real sai daqui sem mudar o backend.
 *
 * Cada paciente ganha:
 *  - tratamentoAtual: { id, nomeProcedimento, status, diaAtual, totalDias } | null
 *  - ultimoCheckin:   { nivelDor, enviadoEm, diaRecuperacao } | null
 *  - statusClinico:   'recuperacao' | 'estabilizacao' | 'atencao' | 'critico' | 'sem_checkin' | 'sem_tratamento' | 'encerrado'
 */
export function usePatients() {
  const [pacientes, setPacientes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState(null);

  async function buscar() {
    setLoading(true);
    setErro(null);
    try {
      const [lista, tratamentos] = await Promise.all([getPatients(), getTreatments()]);

      setPacientes((lista ?? []).map((paciente) => {
        const doPaciente = (tratamentos ?? []).filter((t) => t.paciente?.id === paciente.id);
        const tratamento = doPaciente.find((t) => t.status === 'ativo') ?? doPaciente[0] ?? null;
        const ultimoCheckin = tratamento?.checkins?.[0] ?? null;

        let statusClinico = 'sem_tratamento';
        if (tratamento && tratamento.status !== 'ativo') statusClinico = 'encerrado';
        else if (tratamento) statusClinico = calculatePatientStatus(ultimoCheckin);

        return {
          ...paciente,
          ultimoCheckin,
          statusClinico,
          tratamentoAtual: tratamento && {
            id:               tratamento.id,
            nomeProcedimento: tratamento.nomeProcedimento,
            status:           tratamento.status,
            diaAtual:         calculateRecoveryDay(tratamento.dataProcedimento),
            totalDias:        tratamento.versaoProtocolo?.totalDias ?? null,
          },
        };
      }));
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
