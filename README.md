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

O login é feito pelo Supabase Auth (e-mail + senha). "Esqueci minha
senha" dispara o e-mail de redefinição do próprio Supabase; ao clicar no
link, a mesma tela de login reconhece a sessão de recuperação e mostra o
formulário de nova senha.

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

- **Etapa 4**: Notificações, controle de acesso familiar (múltiplos
  usuários de verdade, com login), backup automático.
- Evoluções futuras do Cantinho da Helô: recado de voz, vídeo curto,
  álbum da jornada, cartões de datas especiais, desenhos pra colorir,
  impressão e álbum em PDF (o próprio escopo do módulo já lista essas
  como próximos passos, não como parte da primeira versão).

Além disso, hoje só existe um usuário de verdade no sistema (a Hellen) —
acesso familiar multiusuário de verdade é parte da Etapa 4.
