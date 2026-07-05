# AltaInteligente — Frontend Architecture & UI/UX Specification

## 🎯 1. Escopo e Objetivos Visuais
Este documento atua como a diretriz estrita de design do sistema. O objetivo é mesclar os princípios das metodologias **UI UX Pro Max**, **Impeccable**, **Huashu-Design** e **Taste** para conceber uma interface de saúde premium, minimalista e de alta performance. 

O design deve se afastar completamente de layouts genéricos de IA, focando em tipografia impecável, espaços em branco generosos (respiro) e micro-interações fluidas.

---

## 👥 2. UX Psychology & Duas Experiências Distintas

O sistema possui duas personas com estados emocionais e contextos de uso opostos. A interface deve refletir isso:

### A. O Portal do Profissional (Dashboard Clínica)
* **Contexto:** Uso diário intenso em telas de computadores ou tablets. O profissional tem pressa e precisa de eficiência cognitiva.
* **UX Strategy:** Alta densidade de dados organizados, leitura rápida (scannability), tabelas limpas, filtros ágeis e forte destaque para alertas críticos. O visual deve transmitir autoridade, precisão e sobriedade tecnológica.

### B. O Portal do Paciente (Link Seguro Mobile-First)
* **Contexto:** Uso exclusivo em smartphones. O paciente pode estar operado, sentindo dor, desconforto ou sob efeito de medicações.
* **UX Strategy:** Baixíssima densidade de informação por tela. Componentes grandes e fáceis de tocar (mínimo de 48px de área de clique). Texto grande, cores calmas que reduzem a ansiedade e inputs simplificados (ex: escala de dor em botões grandes em vez de campos de digitação).

---

## 🎨 3. Design System & Tokens Visuais (Base: Shadcn / Radix Style)

### Paleta de Cores (Premium Clinical Minimal)
* **Fundo Principal:** Branco Puro (`#FFFFFF`) e Cinza de Fundo (`#F8FAFC`).
* **Superfícies (Cards/Modais):** `#FFFFFF` com bordas cirúrgicas sutilmente cinzas (`border-slate-100`).
* **Marca/Primária (60%):** Azul Noturno Profundo (`#0F172A`) ou Slate Profundo (`#1E293B`). Transmite confiança e seriedade.
* **Cores Clínicas de Apoio:**
  * **Recuperação Normal:** Verde Menta Suave (`#10B981`)
  * **Estado de Atenção (Dor 7-8):** Âmbar Clínico (`#F59E0B`)
  * **Alerta Crítico (Dor 9-10):** Carmesim Elegante (`#DC2626`) — usar apenas onde a atenção imediata é obrigatória.

### Tipografia
* **Família de Fontes:** `Inter` ou `Geist Sans` (Fontes geométricas de alta legibilidade).
* **Contraste de Pesos:** Títulos de seções em `font-bold` ou `font-extrabold` (peso 700/800) combinados com textos de apoio em `font-light` ou `font-normal` (peso 300/400) na cor `text-slate-500`.

### Sombras e Elevação (Taste Framework)
* Evitar sombras pretas ou pesadas. Usar a elevação mínima do Tailwind (`shadow-sm`) ou apenas bordas para separar componentes. O layout deve parecer plano, mas tridimensional nas interações.

---

## 🛠️ 4. Stack Tecnológica & Padrões de Código

* **Core:** React (Vite) + CommonJS/ESM conforme estrutura do app.
* **Estilização:** Tailwind CSS (Utilizar classes utilitárias puras, evitando valores arbitrários como `w-[321px]`. Seguir a escala padrão do Tailwind).
* **Ícones:** Lucide React (Configurados com espessura fina: `strokeWidth={1.5}` ou `2` no máximo).
* **Animações:** Framer Motion ou transições nativas do Tailwind (`transition-all duration-300 ease-in-out`).

---

## 📝 5. Diretrizes de Engenharia para o Claude

Ao gerar código para o AltaInteligente, você deve seguir estas regras:
1. **Semantic HTML:** Use `main`, `section`, `nav`, `aside` e `header`. Nada de criar layouts baseados em divs infinitas empilhadas.
2. **Loading States Elegantes:** Sempre prever estados de carregamento usando **Skeletons** (efeito pulsar cinza), nunca textos brutos como "Carregando...".
3. **Empty States Educacionais:** Quando uma lista de pacientes ou protocolos estiver vazia, renderize um card ilustrativo minimalista com um texto amigável e um botão de ação rápida (ex: "Nenhum paciente cadastrado ainda. Comece adicionando o seu primeiro paciente").
4. **Tratamento Visível de Erros:** Formulários devem exibir validações do Zod em tempo real abaixo dos inputs com cor carmesim suave, sem quebrar o layout.
5. **Clean Tailwind:** Agrupe classes logicamente (Layout -> Espaçamento -> Tipografia -> Efeitos -> Estados de Hover).

---

## 👁️ 6. Protocolo Playwright (Validação Visual pelo Usuário)
Como o ambiente de execução não possui preview em tempo real nativo na interface do chat, o desenvolvedor utilizará capturas de tela e descrições comportamentais para atuar como os "olhos" da skill Playwright. Cada componente gerado deve ser modular e isolado para facilitar correções cirúrgicas de layout com base no feedback visual do usuário.