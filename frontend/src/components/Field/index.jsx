// Arquivo: src/components/Field/index.jsx
import { cloneElement, isValidElement, useId } from 'react';

/**
 * Classes de campo. Borda `line-strong` porque a borda identifica o campo (contraste não-texto ≥3:1).
 * `grande` para o portal do paciente (48px, texto 16px — evita zoom automático no iPhone).
 */
export function inputClass(temErro = false, { grande = false, className = '' } = {}) {
  return `w-full rounded-lg border bg-white text-ink placeholder:text-neutral-500
    transition-colors duration-150 focus-visible:outline-none focus:border-ink focus:ring-1 focus:ring-ink
    disabled:bg-neutral-50 disabled:text-neutral-500
    ${grande ? 'min-h-12 px-4 py-3 text-base' : 'min-h-10 px-3.5 py-2 text-sm'}
    ${temErro ? 'border-red-600' : 'border-line-strong'} ${className}`;
}

/**
 * Label + campo + erro. Liga label e erro ao campo automaticamente (id, aria-invalid, aria-describedby),
 * inclusive em campos do react-hook-form.
 * Quando o campo vem embrulhado (ex.: senha com botão de mostrar), passe `htmlFor` com o id do input
 * e ligue `aria-describedby` ao `${id}-erro` no próprio input.
 */
export default function Field({ label, htmlFor, hint, error, opcional = false, className = '', children }) {
  const idGerado = useId();
  const clonar = !htmlFor && isValidElement(children);
  const id = htmlFor || (clonar && children.props.id) || idGerado;
  const idErro = `${id}-erro`;
  const idDica = `${id}-dica`;

  const campo = clonar
    ? cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? idErro : hint ? idDica : undefined,
      })
    : children;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        // O id do rótulo nomeia também a lista do Select (aria-labelledby)
        <label id={`${id}-rotulo`} htmlFor={id} className="block text-sm font-medium text-ink">
          {label}{opcional && <span className="font-normal text-neutral-500"> (opcional)</span>}
        </label>
      )}
      {campo}
      {hint && !error && <p id={idDica} className="text-xs text-neutral-600">{hint}</p>}
      {error && <p id={idErro} className="text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
