// Arquivo: src/pages/Settings/index.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Field from '../../components/Field';
import InlineAlert from '../../components/InlineAlert';
import Select from '../../components/Select';
import { getPreferencias, salvarPreferencias } from '../../services/accountService';
import { esqueciSenha } from '../../services/authService';
import { formatarData } from '../../utils/formatDate';

// 06:00 a 20:00, de 30 em 30 minutos (mesma regra do backend)
const HORARIOS = Array.from({ length: 29 }, (_, i) => {
  const minutos = 6 * 60 + i * 30;
  const hora = `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
  return { value: hora, label: hora };
});

function Interruptor({ ligado, onChange, rotulo, descricao }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p id="rotulo-alertas" className="text-sm font-medium text-ink">{rotulo}</p>
        <p className="mt-0.5 text-sm text-neutral-600">{descricao}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={ligado}
        aria-labelledby="rotulo-alertas"
        onClick={() => onChange(!ligado)}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors ${ligado ? 'bg-ink' : 'bg-neutral-300'}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${ligado ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function NotificacoesProfissional() {
  const [prefs, setPrefs] = useState(null);
  const [form, setForm] = useState({ horaLembrete: '09:00', alertasEmail: true });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    getPreferencias()
      .then((p) => { setPrefs(p); setForm({ horaLembrete: p.horaLembrete, alertasEmail: p.alertasEmail }); })
      .catch(() => setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar suas preferências.' }));
  }, []);

  async function salvar() {
    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });
    try {
      setPrefs(await salvarPreferencias(form));
      setMensagem({ tipo: 'ok', texto: 'Preferências salvas.' });
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.response?.data?.message || 'Não foi possível salvar.' });
    } finally {
      setSalvando(false);
    }
  }

  const alterado = prefs && (prefs.horaLembrete !== form.horaLembrete || prefs.alertasEmail !== form.alertasEmail);

  return (
    <>
      <Card title="Notificações">
        {!prefs && !mensagem.texto ? (
          <div className="space-y-3" aria-busy="true"><div className="skeleton h-10" /><div className="skeleton h-10" /></div>
        ) : prefs && (
          <div className="space-y-6">
            <Interruptor
              ligado={form.alertasEmail}
              onChange={(v) => setForm((f) => ({ ...f, alertasEmail: v }))}
              rotulo="Alerta de dor por e-mail"
              descricao="Quando um paciente informar dor 7 ou mais, ou piora de 2 pontos em relação ao dia anterior."
            />
            <Field label="Horário do lembrete diário" hint="O paciente que aceitou lembretes e ainda não fez o check-in recebe a mensagem a partir deste horário.">
              <Select
                value={form.horaLembrete}
                onChange={(horaLembrete) => setForm((f) => ({ ...f, horaLembrete }))}
                options={HORARIOS}
                className="max-w-40"
              />
            </Field>

            <div className="rounded-lg bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <p>E-mail: {prefs.canais.email ? 'envio ativo.' : 'modo de teste — o servidor ainda não tem e-mail configurado.'}</p>
              <p className="mt-1">WhatsApp: {prefs.canais.whatsapp ? 'envio ativo.' : 'modo de teste — até configurar a conta da Meta, use o botão “Lembrar pelo WhatsApp” no perfil do paciente.'}</p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={salvar} loading={salvando} disabled={!alterado}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
              {mensagem.tipo === 'ok' && <p className="text-sm text-neutral-600" role="status">{mensagem.texto}</p>}
            </div>
          </div>
        )}
        {mensagem.tipo === 'erro' && <InlineAlert className="mt-4">{mensagem.texto}</InlineAlert>}
      </Card>

      {prefs?.termosAceitosEm && (
        <Card title="Termos e privacidade">
          <p className="text-sm text-neutral-600">
            Você aceitou os <Link to="/termos" className="font-medium text-ink underline underline-offset-2">Termos de Uso</Link> e a{' '}
            <Link to="/privacidade" className="font-medium text-ink underline underline-offset-2">Política de Privacidade</Link> em {formatarData(prefs.termosAceitosEm)}.
          </p>
        </Card>
      )}
    </>
  );
}

function TrocarSenha({ email, perfil }) {
  const [estado, setEstado] = useState('');
  async function enviar() {
    setEstado('enviando');
    try { await esqueciSenha(email, perfil); setEstado('enviado'); }
    catch { setEstado('erro'); }
  }
  return (
    <Card title="Senha">
      <p className="text-sm text-neutral-600">
        {estado === 'enviado'
          ? `Link enviado para ${email}. Ele vale por 60 minutos.`
          : `Vamos enviar um link para ${email}. Por ele você cria uma nova senha.`}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={enviar} loading={estado === 'enviando'} disabled={estado === 'enviado'}>
          {estado === 'enviado' ? 'Link enviado' : 'Enviar link para trocar a senha'}
        </Button>
        {estado === 'erro' && <p className="text-sm text-red-700" role="alert">Não foi possível enviar agora. Tente de novo em alguns minutos.</p>}
      </div>
    </Card>
  );
}

export default function Settings() {
  const { usuario } = useAuth();
  const ehProfissional = usuario?.role !== 'admin';

  const dados = [
    { termo: 'Nome',          valor: usuario?.nome },
    { termo: 'E-mail',        valor: usuario?.email },
    { termo: 'Especialidade', valor: usuario?.especialidade },
    { termo: 'Perfil',        valor: ehProfissional ? 'Profissional' : 'Administrador' },
  ].filter(d => d.valor);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Configurações" description="Sua conta, notificações e privacidade." />

      <Card title="Conta">
        <dl className="divide-y divide-line">
          {dados.map(({ termo, valor }) => (
            <div key={termo} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-sm text-neutral-500">{termo}</dt>
              <dd className="break-all text-sm text-ink sm:text-right">{valor}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {ehProfissional && <NotificacoesProfissional />}
      {usuario?.email && <TrocarSenha email={usuario.email} perfil={ehProfissional ? 'PROFESSIONAL' : 'ADMIN'} />}
    </div>
  );
}
