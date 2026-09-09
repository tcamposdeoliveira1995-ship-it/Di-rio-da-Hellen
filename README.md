# Diário da Hellen 🌻

Painel pessoal para acompanhamento da jornada de tratamento — diário,
sintomas, tratamento, exames, agenda, dúvidas, evolução e resumo para
consulta, tudo num só lugar, privado e acolhedor.

Identidade visual em tema girassol 🌻 (a Hellen ama girassol) — paleta
amarelo/dourado/laranja-queimado com uma marca d'água sutil de girassóis
no fundo.

Já implementado, das **Etapas 1 e 2** do escopo do projeto:

- **Etapa 1**: Login, Início ("Meu Dia"), Minha Jornada, Diário,
  Tratamento, Sintomas, Exames, Agenda.
- **Etapa 2**: Minhas Dúvidas, Minha Evolução (gráficos), Resumo para
  Consulta (com impressão/PDF), Documentos.

Memórias, Conquistas, Mural e Rede de Apoio ficam para a Etapa 3; ver
seção 24 do escopo do projeto.

## Stack

- **Next.js** (App Router) + React
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth + Storage) como banco de dados, login e
  guarda de fotos/arquivos
- **lucide-react** para ícones
- Gráficos da Evolução em SVG feito à mão (sem biblioteca de charts),
  seguindo a metodologia de acessibilidade de cor da skill de dataviz

## Como rodar localmente

### 1. Configurar o Supabase

O projeto já existe em https://supabase.com/dashboard/project/pojqwgiwecmtwdopcmfa.

1. Abra o **SQL Editor** do projeto e cole o conteúdo de
   `supabase/schema.sql` inteiro → **Run**. Isso cria as tabelas, ativa o
   RLS (cada pessoa só vê os próprios dados) e cria o bucket privado
   `hellen-arquivos` para fotos e arquivos. Pode rodar de novo mesmo já
   tendo rodado a versão da Etapa 1 — só adiciona o que falta.
2. Em **Authentication → Users → Add user**, crie o usuário da Hellen
   (e-mail + senha). Esse é o login dela no app — não existe cadastro
   público.
3. Em **Project Settings → API**, copie a **Project URL** e a chave
   **anon public** (ou **publishable**).

### 2. Configurar o projeto

```bash
cp .env.example .env.local
# preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Abra `http://localhost:3000` — você será redirecionada para `/login`.

> As duas variáveis também têm um valor padrão embutido em
> `src/lib/supabase/config.js` (a URL e a chave anon são públicas por
> design — o RLS é o que protege os dados). Isso faz o app funcionar
> mesmo se a plataforma de deploy tiver algum problema para repassar as
> variáveis de ambiente no build.

## Arquitetura

- `middleware.js` + `src/lib/supabase/middleware.js`: em toda
  requisição, confirma a sessão do Supabase e redireciona para `/login`
  quem não estiver autenticado (e o contrário, tira quem já está logado
  da tela de login).
- `src/lib/supabase/client.js` / `server.js` / `config.js`: fábricas do
  cliente Supabase para o navegador e para o servidor (Server
  Components, rotas, middleware), seguindo o padrão oficial do
  `@supabase/ssr`.
- `src/lib/store.js`: um único hook (`useStore`) por trás do qual vivem
  todas as leituras e gravações no Supabase — diário, sintomas, ciclos de
  tratamento, exames, agenda, eventos da jornada, dúvidas e documentos.
  As telas nunca chamam o Supabase direto.
- `src/lib/supabase/storage.js` + `src/components/FotoPrivada.jsx`:
  upload de fotos/arquivos para o bucket privado e exibição via URL
  assinada (o bucket não é público).
- `src/lib/periodo.js` + `src/components/SeletorPeriodo.jsx`: seleção de
  período (7/15/30 dias ou personalizado), compartilhada pela Evolução e
  pelo Resumo para Consulta.
- `src/components/charts/`: gráfico de linha (Humor, Energia) e de
  barras (frequência de sintomas), em SVG simples com crosshair/tooltip
  no hover.
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

## O que ainda não está aqui (próxima etapa)

- **Etapa 3**: Mural, Memórias, Conquistas, Rede de Apoio.
- **Etapa 4**: Notificações, controle de acesso familiar, backup
  automático.

Além disso, hoje só existe um usuário (a Hellen). Acesso familiar
compartilhado é parte da Etapa 4.
