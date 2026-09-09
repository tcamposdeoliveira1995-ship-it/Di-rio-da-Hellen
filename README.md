# Diário da Hellen 🌷

Painel pessoal para acompanhamento da jornada de tratamento — diário,
sintomas, tratamento, exames, agenda e a linha do tempo da jornada, tudo
num só lugar, privado e acolhedor.

Esta é a **Etapa 1 (MVP)**: Login, Início ("Meu Dia"), Minha Jornada,
Diário, Tratamento, Sintomas, Exames e Agenda. Dúvidas, Evolução,
Memórias, Conquistas, Mural, Rede de apoio e Documentos ficam para as
próximas etapas (ver seção 24 do escopo do projeto).

## Stack

- **Next.js** (App Router) + React
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth + Storage) como banco de dados, login e
  guarda de fotos/arquivos
- **lucide-react** para ícones

## Como rodar localmente

### 1. Configurar o Supabase

O projeto já existe em https://supabase.com/dashboard/project/pojqwgiwecmtwdopcmfa.

1. Abra o **SQL Editor** do projeto e cole o conteúdo de
   `supabase/schema.sql` inteiro → **Run**. Isso cria as tabelas, ativa o
   RLS (cada pessoa só vê os próprios dados) e cria o bucket privado
   `hellen-arquivos` para fotos e arquivos.
2. Em **Authentication → Users → Add user**, crie o usuário da Hellen
   (e-mail + senha). Esse é o login dela no app — não existe cadastro
   público.
3. Em **Project Settings → API**, copie a **Project URL** e a chave
   **anon public**.

### 2. Configurar o projeto

```bash
cp .env.example .env.local
# preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Abra `http://localhost:3000` — você será redirecionada para `/login`.

## Arquitetura

- `middleware.js` + `src/lib/supabase/middleware.js`: em toda
  requisição, confirma a sessão do Supabase e redireciona para `/login`
  quem não estiver autenticado (e o contrário, tira quem já está logado
  da tela de login).
- `src/lib/supabase/client.js` / `server.js`: fábricas do cliente
  Supabase para o navegador e para o servidor (Server Components, rotas,
  middleware), seguindo o padrão oficial do `@supabase/ssr`.
- `src/lib/store.js`: um único hook (`useStore`) por trás do qual vivem
  todas as leituras e gravações no Supabase — diário, sintomas, ciclos de
  tratamento, exames, agenda e eventos da jornada. As telas nunca chamam
  o Supabase direto.
- `src/lib/supabase/storage.js` + `src/components/FotoPrivada.jsx`:
  upload de fotos/arquivos para o bucket privado e exibição via URL
  assinada (o bucket não é público).
- `supabase/schema.sql`: schema completo — tabelas, Row Level Security e
  bucket de Storage. Pode rodar de novo sem problema.

## Login e "Esqueci minha senha"

O login é feito pelo Supabase Auth (e-mail + senha). "Esqueci minha
senha" dispara o e-mail de redefinição do próprio Supabase; ao clicar no
link, a mesma tela de login reconhece a sessão de recuperação e mostra o
formulário de nova senha.

## O que ainda não está aqui (próximas etapas)

- **Etapa 2**: Dashboard de evolução, Resumo para consulta, Minhas
  Dúvidas, Documentos.
- **Etapa 3**: Mural, Memórias, Conquistas, Rede de apoio.
- **Etapa 4**: Notificações, relatórios em PDF, controle de acesso
  familiar, backup automático.

Além disso, hoje só existe um usuário (a Hellen). Acesso familiar
compartilhado é parte da Etapa 4.
