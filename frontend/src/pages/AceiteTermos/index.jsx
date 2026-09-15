// Arquivo: src/pages/AceiteTermos/index.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../../components/Brand';
import Button from '../../components/Button';
import InlineAlert from '../../components/InlineAlert';
import { useAuth } from '../../contexts/AuthContext';
import { aceitarTermos } from '../../services/accountService';
import { DATA_VERSAO_POR_EXTENSO, VERSAO_TERMOS_PROFISSIONAL } from '../../config/legal';

/**
 * Aceite dos Termos de Uso pelo profissional (primeiro acesso ou nova versão).
 * O painel só abre depois do aceite — é o contrato que define quem responde pelos dados dos pacientes.
 */
export default function AceiteTermos() {
  const { usuario, atualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();
  const [concordo, setConcordo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function aceitar() {
    setEnviando(true);
    setErro('');
    try {
      await aceitarTermos(VERSAO_TERMOS_PROFISSIONAL);
      atualizarUsuario({ precisaAceitarTermos: false });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível registrar o aceite. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-5 sm:px-8">
        <Brand />
        <Button variant="ghost" size="sm" onClick={logout}>Sair</Button>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
        <p className="text-sm text-neutral-600">Versão de {DATA_VERSAO_POR_EXTENSO}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Antes de continuar</h1>
        <p className="mt-3 text-base leading-relaxed text-neutral-600">
          {usuario?.nome?.split(' ').slice(0, 2).join(' ')}, leia os pontos principais dos Termos de Uso e da Política de Privacidade.
        </p>

        <section className="mt-8 rounded-xl border border-line bg-white p-6">
          <ul className="space-y-4 text-sm leading-relaxed text-ink">
            <li><strong>Você é o responsável pelos dados dos seus pacientes</strong> (controlador, na LGPD). O AltaInteligente guarda e processa esses dados em seu nome.</li>
            <li><strong>A plataforma apoia, não decide.</strong> Alertas são sinais para a sua avaliação; não substituem o julgamento clínico. Mensagens automáticas podem falhar — não use como único canal de urgência.</li>
            <li><strong>Informe seus pacientes</strong> sobre o uso da plataforma e atenda os pedidos deles sobre dados pessoais. Você pode exportar e anonimizar dados pelo perfil do paciente.</li>
            <li><strong>Guarda de prontuário</strong> continua sendo sua obrigação, pelo prazo da legislação e do seu conselho.</li>
          </ul>
          <p className="mt-6 text-sm text-neutral-600">
            Texto completo:{' '}
            <Link to="/termos" target="_blank" className="font-medium text-ink underline underline-offset-2">Termos de Uso</Link>
            {' e '}
            <Link to="/privacidade" target="_blank" className="font-medium text-ink underline underline-offset-2">Política de Privacidade</Link>.
          </p>
        </section>

        <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={concordo}
            onChange={(e) => setConcordo(e.target.checked)}
            className="mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer accent-ink"
          />
          Li e concordo com os Termos de Uso e com a Política de Privacidade.
        </label>

        {erro && <InlineAlert className="mt-4">{erro}</InlineAlert>}

        <Button size="lg" className="mt-6 w-full sm:w-auto" disabled={!concordo} loading={enviando} onClick={aceitar}>
          {enviando ? 'Registrando…' : 'Aceitar e continuar'}
        </Button>
      </main>
    </div>
  );
}
