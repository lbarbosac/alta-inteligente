// Arquivo: src/components/ConfirmDialog/index.jsx
import { useEffect, useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import InlineAlert from '../InlineAlert';

/**
 * Confirmação de ação. Antes existia uma cópia de ModalConfirmar em cada página de protocolo.
 * `tom="danger"` para ação destrutiva (arquivar, encerrar, bloquear).
 */
export default function ConfirmDialog({ isOpen, titulo, descricao, labelConfirmar, tom = 'primary', onClose, onConfirmar }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => { if (isOpen) setErro(''); }, [isOpen]);

  async function confirmar() {
    setCarregando(true);
    setErro('');
    try {
      await onConfirmar();
      onClose();
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível concluir. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} size="sm">
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-neutral-600">{descricao}</p>
        {erro && <InlineAlert>{erro}</InlineAlert>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant={tom} loading={carregando} onClick={confirmar}>{labelConfirmar}</Button>
        </div>
      </div>
    </Modal>
  );
}
