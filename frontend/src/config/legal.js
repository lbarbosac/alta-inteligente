// Arquivo: src/config/legal.js
// Dados de quem opera a plataforma, usados na Política de Privacidade e nos Termos de Uso.
// Preencha no .env do frontend antes de colocar no ar. Sem isso, os documentos mostram
// o campo entre colchetes — de propósito, para ninguém publicar com dado inventado.

export const EMPRESA = {
  nome:     import.meta.env.VITE_EMPRESA_NOME     || '[razão social da empresa]',
  cnpj:     import.meta.env.VITE_EMPRESA_CNPJ     || '[CNPJ]',
  endereco: import.meta.env.VITE_EMPRESA_ENDERECO || '[endereço]',
  // Encarregado de dados (DPO): canal para pedidos sobre dados pessoais
  email:    import.meta.env.VITE_EMPRESA_EMAIL_PRIVACIDADE || '[e-mail do encarregado de dados]',
};

// Mesmas versões do backend (backend/src/shared/config/legal.js)
export const VERSAO_TERMO_PACIENTE = '2026-09-15';
export const VERSAO_TERMOS_PROFISSIONAL = '2026-09-15';

export const DATA_VERSAO_POR_EXTENSO = '15 de setembro de 2026';
