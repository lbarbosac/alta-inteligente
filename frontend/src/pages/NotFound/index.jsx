// Arquivo: src/pages/NotFound/index.jsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center">
            <Activity size={16} strokeWidth={2} className="text-white" />
          </div>
          <span className="text-slate-950 text-sm font-semibold">AltaInteligente</span>
        </div>

        {/* Código de erro */}
        <div>
          <p className="text-slate-200 text-8xl font-extrabold tracking-tight leading-none select-none">
            404
          </p>
          <h1 className="text-slate-950 text-xl font-extrabold mt-2">
            Página não encontrada
          </h1>
          <p className="text-slate-400 text-sm font-light mt-2 leading-relaxed">
            O endereço que você tentou acessar não existe ou foi movido.
          </p>
        </div>

        {/* Ação */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
            bg-slate-950 text-white text-sm font-medium
            hover:bg-slate-800 active:scale-[0.98]
            transition-all duration-150"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </button>
      </div>
    </div>
  );
}