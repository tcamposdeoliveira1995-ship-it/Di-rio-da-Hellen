# Diário da Hellen 🌻

Painel pessoal para acompanhamento da jornada de tratamento — diário,
sintomas, tratamento, exames, agenda, dúvidas, evolução, resumo para
consulta e mais, tudo num só lugar, privado e acolhedor. Tem também o
**Cantinho da Helô**, um espaço infantil separado onde uma criança da
família manda desenhos e recadinhos pra Hellen.

Identidade visual em tema girassol 🌻 (a Hellen ama girassol) — paleta
amarelo/dourado/laranja-queimado com uma marca d'água sutil de girassóis
no fundo.

Já implementado, das **Etapas 1, 2 e 3** do escopo do projeto, mais o
módulo **Cantinho da Helô**:

- **Etapa 1**: Login, Início ("Meu Dia"), Minha Jornada, Diário,
  Tratamento, Sintomas, Exames, Agenda.
- **Etapa 2**: Minhas Dúvidas, Minha Evolução (gráficos), Resumo para
  Consulta (com impressão/PDF), Documentos.
- **Etapa 3**: Memórias, Conquistas (calculadas automaticamente),
  Mural, Minha Rede de Apoio.
- **Cantinho da Helô**: área infantil (sem login) pra desenhar e mandar
  recadinhos — ver seção própria abaixo.

## Stack

- **Next.js** (App Router) + React
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth + Storage) como banco de dados, login e
  guarda de fotos/arquivos
- **lucide-react** para ícones
- Gráficos da Evolução em SVG feito à mão (sem biblioteca de charts),
  seguindo a metodologia de acessibilidade de cor da skill de dataviz
- Paint do Cantinho da Helô em `<canvas>` puro, com eventos de ponteiro
  (funciona igual pra dedo, mouse ou caneta)

## Como rodar localmente

### 1. Configurar o Supabase

O projeto já existe em https://supabase.com/dashboard/project/pojqwgiwecmtwdopcmfa.

1. Abra o **SQL Editor** do projeto e cole o conteúdo de
   `supabase/schema.sql` inteiro → **Run**. Isso cria as tabelas, ativa o
   RLS (cada pessoa só vê os próprios dados) e cria o bucket privado
   `hellen-arquivos` para fotos e arquivos. Pode rodar de novo sem
   problema — só adiciona o que falta.
2. Em **Authentication → Users → Add user**, crie o usuário da Hellen
   (e-mail + senha). Esse é o login dela no app — não existe cadastro
   público.
3. Em **Project Settings → API**, copie a **Project URL**, a chave
   **anon public** (ou **publishable**) e a chave **secret** (service
   role) — essa última só é usada no servidor, nunca no navegador.

### 2. Configurar o projeto

```bash
cp .env.example .env.local
# preencha NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# e SUPABASE_SECRET_KEY

npm install
npm run dev
```

Abra `http://localhost:3000` — você será redirecionada para `/login`.

> As duas variáveis públicas também têm um valor padrão embutido em
> `src/lib/supabase/config.js` (a URL e a chave anon são públicas por
> design — o RLS é o que protege os dados). Isso faz o app funcionar
> mesmo se a plataforma de deploy tiver algum problema para repassar as
> variáveis de ambiente no build. `SUPABASE_SECRET_KEY` **não** tem
> valor padrão — sem ela, o resto do app funciona normal, só o Cantinho
> da Helô que não consegue salvar nada.

## Arquitetura

- `middleware.js` + `src/lib/supabase/middleware.js`: em toda
  requisição, confirma a sessão do Supabase e redireciona para `/login`
  quem não estiver autenticado — exceto `/login` e `/cantinho/*` (e as
  rotas `/api/cantinho/*`), que são públicas de propósito.
- `src/lib/supabase/client.js` / `server.js` / `config.js`: fábricas do
  cliente Supabase para o navegador e para o servidor (Server
  Components, rotas, middleware), seguindo o padrão oficial do
  `@supabase/ssr`.
- `src/lib/supabase/admin.js`: cliente com a chave **secreta**
  (service role, ignora RLS) — só usado dentro das rotas de servidor em
  `src/app/api/cantinho/*`. Nunca importar de um componente "use client".
- `src/lib/store.js`: um único hook (`useStore`) por trás do qual vivem
  todas as leituras e gravações no Supabase — diário, sintomas, ciclos de
  tratamento, exames, agenda, eventos da jornada, dúvidas, documentos,
  memórias, mural, contatos de apoio, crianças autorizadas e carinhos
  recebidos. As telas nunca chamam o Supabase direto.
- `src/lib/supabase/storage.js` + `src/components/FotoPrivada.jsx`:
  upload de fotos/arquivos para o bucket privado e exibição via URL
  assinada (o bucket não é público).
- `src/components/CampoArquivo.jsx`: campo de foto/arquivo com duas
  opções — tirar foto agora (abre a câmera do celular) ou escolher da
  galeria/arquivos — com pré-visualização.
- `src/lib/periodo.js` + `src/components/SeletorPeriodo.jsx`: seleção de
  período (7/15/30 dias ou personalizado), compartilhada pela Evolução e
  pelo Resumo para Consulta.
- `src/components/charts/`: gráfico de linha (Humor, Energia) e de
  barras (frequência de sintomas), em SVG simples com crosshair/tooltip
  no hover.
- `src/lib/conquistas.js`: as medalhas da tela Conquistas são calculadas
  a partir dos dados que já existem (diário, ciclos, exames) — não tem
  tabela própria, nem botão de "desbloquear".
- `supabase/schema.sql`: schema completo — tabelas, Row Level Security e
  bucket de Storage. Pode rodar de novo sem problema.

## Login e "Esqueci minha senha"

O login é feito pelo Supabase Auth, e aceita e-mail **ou** telefone (quem
se cadastra por telefone recebe por baixo dos panos um e-mail sintético,
só pro Supabase Auth aceitar — ver seção "Contas da família" abaixo).
"Esqueci minha senha" dispara o e-mail de redefinição do próprio
Supabase quando a conta usa e-mail de verdade; contas por telefone não
têm e-mail real pra receber esse link, então a tela orienta a pessoa a
pedir pra Hellen redefinir manualmente.

## Contas da família 👪

Além da Hellen, outras pessoas da família podem ter login — mas só ela
edita; o resto só visualiza.

- **Cadastro** (`/cadastro`, público): nome, telefone e senha. Não
  precisa de e-mail — o app gera um e-mail sintético a partir do
  telefone (`src/lib/contaFamiliar.js`) só pra satisfazer o Supabase
  Auth, que exige um e-mail pra criar a conta.
- **Papéis**, guardados na tabela `perfis`:
  - `pendente` (padrão ao se cadastrar): não vê nada, só uma tela de
    "aguardando aprovação".
  - `visualizador`: vê tudo (diário, tratamento, exames, agenda...),
    mas todo botão de criar/editar/excluir some ou fica desabilitado.
  - `admin`: só a Hellen. Edita tudo. Quem já tinha conta antes dessa
    versão vira admin automaticamente ao rodar o schema (backfill).
- **Aprovação manual**: a Hellen aprova cada pessoa em `/pessoas` (só
  admin vê essa tela) — promove pra visualizador, ou revoga o acesso.
  Não existe cadastro livre com acesso automático, de propósito: são
  dados de saúde.
- **Segurança é toda via RLS**: as políticas do Postgres (`is_admin()` e
  `pode_visualizar()`, funções `security definer` que consultam
  `perfis`) são a barreira de verdade — as telas escondem os botões de
  edição por usabilidade, mas quem garante que um visualizador não
  consiga gravar nada é o banco, não a interface.
- **A Helô não entra aqui.** O Cantinho da Helô continua sem login,
  como sempre foi — esse sistema de contas é só pro resto da família.

⚠️ **Necessário no painel do Supabase**: em Authentication → Providers →
Email, desligue "Confirm email" (confirmação de e-mail). Como o
cadastro por telefone usa um e-mail sintético que ninguém realmente
recebe, deixar a confirmação ligada trava essas contas pra sempre — elas
nunca conseguem confirmar e nunca conseguem logar.

## Resumo para Consulta

A tela `/resumo` organiza estado geral, sintomas, tratamentos,
medicamentos, dúvidas abertas e observações do diário num período
escolhido. O botão "Imprimir / Salvar PDF" usa a impressão nativa do
navegador (`window.print()`) — a navegação some da página impressa via
CSS (`@media print`).

## Cantinho da Helô 🎨

Área infantil separada do resto do painel — quem usa (ex: a Helô) não
tem login, não vê nada médico e só consegue desenhar/mandar recadinhos.

- **Sem senha, de propósito**: em `/cantinho`, a criança só escolhe o
  próprio nome/avatar numa lista (cadastrada por você em **Carinhos →
  Pessoas autorizadas**, no painel da Hellen). Fica salvo no navegador
  do aparelho dela, então não precisa escolher de novo a cada vez.
- **Como a gravação funciona sem login**: as rotas em
  `src/app/api/cantinho/*` usam a chave secreta do Supabase, no
  servidor, pra gravar em nome da criança — o RLS que protege os dados
  médicos da Hellen nunca é tocado por esse caminho (a tabela
  `carinhos` nem tem uma policy de "insert" pública; só a rota do
  servidor grava).
- **Paint**: `<canvas>` com lápis/pincel, borracha, carimbos (❤️⭐🌸🌈☀️🦋😊✨🎈💗),
  texto e foto de fundo, desfazer/refazer, tudo com botões grandes
  pensados pra toque.
- **O que ficou simplificado** (o resto do escopo do módulo já marca
  como "evoluções futuras", ou eu simplifiquei mesmo para essa
  primeira versão): carimbos são colocados num tamanho fixo por toque
  (sem arrastar/girar depois), texto usa uma caixinha de digitação
  simples (não um campo arrastável), e o download de imagem, gravação
  de voz e álbum em PDF não existem ainda.
- No painel da Hellen, `/carinhos` mostra a galeria recebida (com
  filtros de favoritos/amados), as reações (❤️ Amei, ⭐ Favorito,
  ⬇️ Salvar imagem) e o gerenciamento de quem pode mandar carinho.

## O que ainda não está aqui (próxima etapa)

- **Etapa 4**: Notificações, backup automático.
- Evoluções futuras do Cantinho da Helô: recado de voz, vídeo curto,
  álbum da jornada, cartões de datas especiais, desenhos pra colorir,
  impressão e álbum em PDF (o próprio escopo do módulo já lista essas
  como próximos passos, não como parte da primeira versão).
