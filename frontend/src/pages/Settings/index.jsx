// Arquivo: src/pages/Settings/index.jsx
import { Settings as SettingsIcon, Bell, Lock, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function SettingRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex items-start justify-between gap-6 py-5 border-b border-slate-50 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon size={16} strokeWidth={1.5} className="text-slate-500" />
        </div>
        <div>
          <p className="text-slate-900 text-sm font-medium">{title}</p>
          <p className="text-slate-400 text-xs font-light mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { usuario } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-slate-950 text-2xl font-extrabold tracking-tight">
          Configurações
        </h1>
        <p className="text-slate-400 text-sm font-light mt-1">
          Gerencie suas preferências e dados da conta.
        </p>
      </div>

      <section className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="text-slate-950 text-sm font-semibold">Dados da Conta</h2>
        </div>
        <div className="px-6">
          <SettingRow icon={SettingsIcon} title="Nome" description="Seu nome exibido na plataforma">
            <span className="text-slate-600 text-sm font-medium">{usuario?.nome ?? '—'}</span>
          </SettingRow>
          <SettingRow icon={Globe} title="E-mail" description="Endereço de login">
            <span className="text-slate-600 text-sm font-medium">{usuario?.email ?? '—'}</span>
          </SettingRow>
          <SettingRow icon={Lock} title="Senha" description="Altere sua senha de acesso">
            <button type="button"
              className="text-sm text-slate-950 font-semibold underline underline-offset-2 hover:text-slate-600 transition-colors">
              Alterar
            </button>
          </SettingRow>
        </div>
      </section>

      <section className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="text-slate-950 text-sm font-semibold">Notificações</h2>
        </div>
        <div className="px-6">
          <SettingRow icon={Bell} title="Alertas críticos" description="Pacientes com dor ≥ 8">
            <div className="w-10 h-6 rounded-full bg-slate-950 flex items-center px-1 cursor-pointer">
              <div className="w-4 h-4 rounded-full bg-white shadow-sm translate-x-4" />
            </div>
          </SettingRow>
          <SettingRow icon={Bell} title="Check-ins recebidos" description="Notificação ao receber check-in">
            <div className="w-10 h-6 rounded-full bg-slate-200 flex items-center px-1 cursor-pointer">
              <div className="w-4 h-4 rounded-full bg-white shadow-sm translate-x-0" />
            </div>
          </SettingRow>
        </div>
      </section>

      <p className="text-slate-300 text-xs font-light text-center">
        Edição de dados disponível em versão futura.
      </p>
    </div>
  );
}