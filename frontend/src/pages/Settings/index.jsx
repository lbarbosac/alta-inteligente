// Arquivo: src/pages/Settings/index.jsx
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import InlineAlert from '../../components/InlineAlert';

// Os interruptores e o botão "Alterar" de antes não faziam nada — saíram até a função existir.
export default function Settings() {
  const { usuario } = useAuth();

  const dados = [
    { termo: 'Nome',          valor: usuario?.nome },
    { termo: 'E-mail',        valor: usuario?.email },
    { termo: 'Especialidade', valor: usuario?.especialidade },
    { termo: 'Perfil',        valor: usuario?.role === 'admin' ? 'Administrador' : 'Profissional' },
  ].filter(d => d.valor);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Configurações" description="Dados da sua conta na plataforma." />

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

      <InlineAlert tone="neutro">
        Edição de dados, troca de senha e notificações chegam em uma próxima versão.
      </InlineAlert>
    </div>
  );
}
