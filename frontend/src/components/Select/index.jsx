// Arquivo: src/components/Select/index.jsx
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { inputClass } from '../Field';

const ALTURA_MAXIMA = 320; // px da lista aberta, quando cabe na tela

/** Sem acento e sem maiúscula: "extracao" encontra "Extração". */
function normalizar(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const imprimivel = (e) => e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

/**
 * Campo de escolha no lugar do <select> nativo, no visual do sistema.
 *
 * - `options`: [{ value, label, detail? }]. `detail` aparece à direita, em cinza (ex.: "3 dias").
 *   A ordem é a de quem chama — o componente não ordena.
 * - `searchable`: campo de busca no topo da lista. Ignora acento e maiúscula e aceita várias
 *   palavras em qualquer ordem ("siso 38" encontra "Extração de Siso (Dente 38)").
 * - Teclado no padrão combobox da WAI-ARIA: setas, Home/End, Enter, Esc; digitar pula para a opção.
 * - Usar dentro de <Field>: o rótulo do Field nomeia o campo e a lista.
 *
 * A lista abre com `position: fixed` para não ser cortada pela rolagem do modal, mas continua
 * no mesmo lugar do DOM (sem portal) para o foco seguir preso dentro do modal.
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Selecione',
  searchable = false,
  searchPlaceholder = 'Buscar',
  emptyText = 'Nenhuma opção encontrada.',
  disabled = false,
  className = '',
  id: idRecebido,
  'aria-invalid': invalido,
  'aria-describedby': descritoPor,
}) {
  const idGerado = useId();
  const id = idRecebido ?? idGerado;
  const idLista = `${id}-lista`;
  const idOpcao = (i) => `${id}-opcao-${i}`;

  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [ativo, setAtivo] = useState(-1);
  const [teclado, setTeclado] = useState(false); // destaque com contorno só quando navega pelo teclado
  const [posicao, setPosicao] = useState(null);

  const raizRef = useRef(null);
  const gatilhoRef = useRef(null);
  const buscaRef = useRef(null);
  const listaRef = useRef(null);
  const rolarRef = useRef(null); // 'centro' ao abrir, 'perto' ao navegar
  const ponteiroRef = useRef({ x: -1, y: -1 });
  const digitadoRef = useRef({ texto: '', timer: 0 });

  const termos = normalizar(busca).split(/\s+/).filter(Boolean);
  const visiveis = termos.length
    ? options.filter((o) => {
        const rotulo = normalizar(o.label);
        return termos.every((t) => rotulo.includes(t));
      })
    : options;
  const indiceAtivo = Math.min(ativo, visiveis.length - 1);
  // Valor vazio mostra o placeholder, mesmo que exista uma opção "Nenhum" com valor ''
  const selecionada = value === '' || value == null ? null : options.find((o) => o.value === value);

  function calcularPosicao() {
    const r = gatilhoRef.current.getBoundingClientRect();
    const vv = window.visualViewport;
    const topoVisivel = vv ? vv.offsetTop : 0;
    const baseVisivel = vv ? vv.offsetTop + vv.height : window.innerHeight;
    const abaixo = baseVisivel - r.bottom - 12;
    const acima = r.top - topoVisivel - 12;
    const paraCima = abaixo < 200 && acima > abaixo;
    const maxHeight = Math.max(120, Math.min(ALTURA_MAXIMA, paraCima ? acima : abaixo));
    return paraCima
      ? { left: r.left, width: r.width, maxHeight, bottom: window.innerHeight - r.top + 4 }
      : { left: r.left, width: r.width, maxHeight, top: r.bottom + 4 };
  }

  function abrir(indice) {
    if (disabled) return;
    const atual = options.findIndex((o) => o.value === value);
    setBusca('');
    setAtivo(indice ?? (atual >= 0 ? atual : 0));
    setPosicao(calcularPosicao());
    rolarRef.current = 'centro';
    setAberto(true);
  }

  function fechar(devolverFoco = false) {
    setAberto(false);
    setBusca('');
    if (devolverFoco) gatilhoRef.current?.focus();
  }

  function escolher(opcao) {
    if (!opcao) return;
    onChange(opcao.value);
    fechar(true);
  }

  function mover(para) {
    setTeclado(true);
    rolarRef.current = 'perto';
    setAtivo(Math.max(0, Math.min(para, visiveis.length - 1)));
  }

  // Digitar com a lista sem busca pula para a primeira opção que começa com o texto ("14" → 14:00)
  function indiceDigitado(tecla) {
    const d = digitadoRef.current;
    clearTimeout(d.timer);
    d.texto += normalizar(tecla);
    d.timer = setTimeout(() => { d.texto = ''; }, 700);
    return options.findIndex((o) => normalizar(o.label).startsWith(d.texto));
  }

  function navegar(e) {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); mover(indiceAtivo + 1); break;
      case 'ArrowUp':   e.preventDefault(); mover(indiceAtivo - 1); break;
      case 'PageDown':  e.preventDefault(); mover(indiceAtivo + 10); break;
      case 'PageUp':    e.preventDefault(); mover(indiceAtivo - 10); break;
      case 'Home':
      case 'End':
        if (searchable) break; // no campo de busca, Home/End movem o cursor do texto
        e.preventDefault();
        mover(e.key === 'Home' ? 0 : visiveis.length - 1);
        break;
      case 'Enter':
        e.preventDefault(); // nunca envia o formulário em volta
        escolher(visiveis[indiceAtivo]);
        break;
      case ' ':
        if (searchable) break; // espaço digita na busca
        e.preventDefault();
        escolher(visiveis[indiceAtivo]);
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation(); // Esc fecha só a lista, não o modal em volta
        fechar(true);
        break;
      case 'Tab':
        fechar(); // o foco segue para o próximo campo sem mudar a escolha
        break;
      default:
        if (!searchable && imprimivel(e)) {
          e.preventDefault();
          const i = indiceDigitado(e.key);
          if (i >= 0) mover(i);
        }
    }
  }

  function teclaNoGatilho(e) {
    if (aberto) { navegar(e); return; }
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      setTeclado(true);
      abrir();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      setTeclado(true);
      abrir(e.key === 'Home' ? 0 : options.length - 1);
    } else if (imprimivel(e)) {
      e.preventDefault();
      setTeclado(true);
      if (searchable) {
        abrir(0);
        setBusca(e.key); // a primeira letra já entra na busca
      } else {
        const i = indiceDigitado(e.key);
        abrir(i >= 0 ? i : undefined);
      }
    }
  }

  function aoClicar() {
    if (disabled) return;
    if (aberto) { fechar(); return; }
    gatilhoRef.current?.focus(); // o Safari não foca botão no clique
    setTeclado(false);
    abrir();
  }

  // Foco na busca ao abrir, com o cursor depois da letra que abriu a lista
  useEffect(() => {
    if (!aberto || !searchable) return;
    const campo = buscaRef.current;
    campo?.focus({ preventScroll: true });
    campo?.setSelectionRange(campo.value.length, campo.value.length);
  }, [aberto, searchable]);

  // Clique fora fecha
  useEffect(() => {
    if (!aberto) return;
    const aoTocarFora = (e) => { if (!raizRef.current?.contains(e.target)) fechar(); };
    document.addEventListener('pointerdown', aoTocarFora, true);
    return () => document.removeEventListener('pointerdown', aoTocarFora, true);
  }, [aberto]);

  // Acompanha o campo quando a página ou o modal rolam, ou a tela muda de tamanho (teclado do celular)
  useEffect(() => {
    if (!aberto) return;
    let quadro = 0;
    const atualizar = (e) => {
      if (e?.target === listaRef.current) return; // rolar a própria lista não move nada
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => { if (gatilhoRef.current) setPosicao(calcularPosicao()); });
    };
    const vv = window.visualViewport;
    window.addEventListener('resize', atualizar);
    window.addEventListener('scroll', atualizar, true);
    vv?.addEventListener('resize', atualizar);
    vv?.addEventListener('scroll', atualizar);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener('resize', atualizar);
      window.removeEventListener('scroll', atualizar, true);
      vv?.removeEventListener('resize', atualizar);
      vv?.removeEventListener('scroll', atualizar);
    };
  }, [aberto]);

  // Mantém a opção ativa visível: centralizada ao abrir, no limite mais próximo ao navegar
  useLayoutEffect(() => {
    const modo = rolarRef.current;
    const lista = listaRef.current;
    if (!aberto || !modo || !lista) return;
    rolarRef.current = null;
    const item = lista.children[indiceAtivo];
    if (!item) { lista.scrollTop = 0; return; }
    if (modo === 'centro') {
      lista.scrollTop = item.offsetTop - (lista.clientHeight - item.offsetHeight) / 2;
    } else if (item.offsetTop < lista.scrollTop) {
      lista.scrollTop = item.offsetTop - 4;
    } else if (item.offsetTop + item.offsetHeight > lista.scrollTop + lista.clientHeight) {
      lista.scrollTop = item.offsetTop + item.offsetHeight - lista.clientHeight + 4;
    }
  });

  function aoPerderFoco(e) {
    if (aberto && !raizRef.current?.contains(e.relatedTarget)) fechar();
  }

  function aoMoverPonteiro(e, i) {
    const p = ponteiroRef.current;
    if (p.x === e.clientX && p.y === e.clientY) return; // a lista rolou sob o mouse parado
    ponteiroRef.current = { x: e.clientX, y: e.clientY };
    setTeclado(false);
    if (i !== indiceAtivo) setAtivo(i);
  }

  return (
    <div ref={raizRef} onBlur={aoPerderFoco} className={`relative ${className}`}>
      <button
        ref={gatilhoRef}
        type="button"
        id={id}
        role="combobox"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={aberto ? idLista : undefined}
        aria-activedescendant={aberto && !searchable && indiceAtivo >= 0 ? idOpcao(indiceAtivo) : undefined}
        aria-invalid={invalido}
        aria-describedby={descritoPor}
        onClick={aoClicar}
        onKeyDown={teclaNoGatilho}
        onKeyUp={(e) => { if (e.key === ' ') e.preventDefault(); }} // senão o espaço vira clique e reabre
        className={inputClass(Boolean(invalido), {
          className: `flex items-center gap-2 text-left tabular-nums disabled:cursor-not-allowed
            ${disabled ? '' : 'cursor-pointer'} ${aberto ? '!border-ink ring-1 ring-ink' : ''}`,
        })}
      >
        <span className={`min-w-0 flex-1 truncate ${selecionada ? '' : 'text-neutral-500'}`}>
          {selecionada ? selecionada.label : placeholder}
        </span>
        {selecionada?.detail && <span className="flex-shrink-0 text-neutral-500">{selecionada.detail}</span>}
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className={`flex-shrink-0 text-neutral-500 transition-transform duration-150 ${aberto ? 'rotate-180' : ''}`}
        />
      </button>

      {aberto && (
        <div
          style={{ position: 'fixed', ...posicao }}
          onMouseDown={(e) => { if (e.target !== buscaRef.current) e.preventDefault(); }} // clique na lista não tira o foco
          className="z-[60] flex flex-col overflow-hidden rounded-lg border border-line-strong bg-white focus-within:border-ink"
        >
          {searchable && (
            <div className="relative flex-shrink-0 border-b border-line">
              <Search
                size={15}
                strokeWidth={1.75}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <input
                ref={buscaRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={idLista}
                aria-autocomplete="list"
                aria-activedescendant={indiceAtivo >= 0 ? idOpcao(indiceAtivo) : undefined}
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setAtivo(0); setTeclado(true); rolarRef.current = 'perto'; }}
                onKeyDown={navegar}
                autoComplete="off"
                spellCheck={false}
                className="h-11 w-full bg-transparent pl-9 pr-3 text-sm text-ink placeholder:text-neutral-500 focus-visible:outline-none"
              />
            </div>
          )}

          <ul
            ref={listaRef}
            id={idLista}
            role="listbox"
            aria-labelledby={`${id}-rotulo`}
            className={`relative min-h-0 flex-1 overflow-y-auto overscroll-contain tabular-nums ${visiveis.length ? 'p-1' : 'hidden'}`}
          >
            {visiveis.map((opcao, i) => {
              const marcada = opcao.value === value;
              const destacada = i === indiceAtivo;
              return (
                <li
                  key={opcao.value}
                  id={idOpcao(i)}
                  role="option"
                  aria-selected={marcada}
                  onMouseMove={(e) => aoMoverPonteiro(e, i)}
                  onClick={() => escolher(opcao)}
                  className={`flex min-h-10 cursor-pointer select-none items-center gap-3 rounded-md px-2.5 py-2 text-sm text-ink
                    [@media(pointer:coarse)]:min-h-11
                    ${destacada ? 'bg-neutral-100' : ''}
                    ${destacada && teclado ? 'outline outline-2 -outline-offset-2 outline-ink' : ''}
                    ${marcada ? 'font-medium' : ''}`}
                >
                  <span className="min-w-0 flex-1 break-words">{opcao.label}</span>
                  {opcao.detail && <span className="flex-shrink-0 font-normal text-neutral-600">{opcao.detail}</span>}
                  <Check
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                    className={`flex-shrink-0 ${marcada ? 'text-ink' : 'invisible'}`}
                  />
                </li>
              );
            })}
          </ul>

          {visiveis.length === 0 && <p className="px-3.5 py-3 text-sm text-neutral-600">{emptyText}</p>}
          {searchable && (
            <p role="status" className="sr-only">
              {termos.length ? `${visiveis.length} ${visiveis.length === 1 ? 'resultado' : 'resultados'}` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
