// Arquivo: src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão do localStorage na montagem inicial
  useEffect(() => {
    const token       = localStorage.getItem('@alta:token');
    const usuarioJson = localStorage.getItem('@alta:usuario');

    if (token && usuarioJson) {
      try {
        setUsuario(JSON.parse(usuarioJson));
      } catch {
        // JSON inválido — limpa e força novo login
        localStorage.removeItem('@alta:token');
        localStorage.removeItem('@alta:usuario');
      }
    }

    setLoading(false);
  }, []);

  // Sessão expirada ou token inválido: o api.js avisa com este evento e a sessão é encerrada.
  // Antes ninguém ouvia o evento e a tela ficava aberta com todas as chamadas falhando.
  useEffect(() => {
    function aoPerderSessao() {
      if (!localStorage.getItem('@alta:token')) return;
      logout();
    }
    window.addEventListener('alta:unauthorized', aoPerderSessao);
    return () => window.removeEventListener('alta:unauthorized', aoPerderSessao);
  }, []);

  /**
   * Realiza o login chamando a API de autenticação.
   * Persiste token e dados do usuário no localStorage.
   *
   * @param {string} email
   * @param {string} senha
   * @param {'PROFESSIONAL'|'ADMIN'} perfil
   * @returns {object} usuario com campo `role`
   */
  async function login(email, senha, perfil) {
    const response = await api.post('/auth/login', { email, senha, perfil });
    const { token, usuario: dadosUsuario } = response.data.data;

    localStorage.setItem('@alta:token',   token);
    localStorage.setItem('@alta:usuario', JSON.stringify(dadosUsuario));

    setUsuario(dadosUsuario);
    return dadosUsuario;
  }

  /** Atualiza parte dos dados do usuário logado (ex.: depois de aceitar os termos). */
  function atualizarUsuario(parcial) {
    setUsuario((atual) => {
      if (!atual) return atual;
      const novo = { ...atual, ...parcial };
      localStorage.setItem('@alta:usuario', JSON.stringify(novo));
      return novo;
    });
  }

  /**
   * Encerra a sessão limpando localStorage e estado local.
   */
  function logout() {
    localStorage.removeItem('@alta:token');
    localStorage.removeItem('@alta:usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para consumir o contexto de autenticação.
 * Lança erro se usado fora do AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }
  return context;
}
