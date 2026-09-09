-- Diário da Hellen 🌷 — schema (Etapa 1 + Etapa 2)
--
-- Como aplicar: Supabase → SQL Editor → cole este arquivo inteiro → Run.
-- Pode rodar de novo sem problema (tudo usa "if not exists" / "or replace") —
-- se você já rodou a versão da Etapa 1, rodar de novo só adiciona as
-- tabelas novas (duvidas, documentos) sem tocar no que já existe.
--
-- Cada tabela guarda user_id (o id do usuário logado no Supabase Auth) e
-- tem Row Level Security ligada: cada pessoa só vê e edita as próprias
-- linhas. Como é um diário pessoal, crie o usuário da Hellen em
-- Authentication → Users → Add user (com o e-mail e senha dela).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tratamento (informações gerais + data de início da jornada)
-- ---------------------------------------------------------------------
create table if not exists public.tratamento_info (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  data_inicio date,
  quantidade_ciclos int,
  equipe_responsavel text,
  hospital text,
  jornada_data_inicio date,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Ciclos de tratamento
-- ---------------------------------------------------------------------
create table if not exists public.ciclos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  numero int not null,
  data date,
  status text not null default 'aguardando', -- concluido | em_andamento | aguardando
  local text,
  horario text,
  duracao text,
  medicamentos text,
  como_chegou text,
  como_saiu text,
  sintomas text,
  observacoes text,
  intercorrencias text,
  acompanhante text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Diário pessoal (uma entrada por dia)
-- ---------------------------------------------------------------------
create table if not exists public.diario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  humor text, -- bem | indo | maisOuMenos | dificil | muitoDificil
  energia int,
  texto text,
  algo_bom text,
  dificuldade text,
  quero_lembrar text,
  foto_path text, -- caminho no Storage (bucket hellen-arquivos)
  created_at timestamptz not null default now(),
  unique (user_id, data)
);

-- ---------------------------------------------------------------------
-- Sintomas
-- ---------------------------------------------------------------------
create table if not exists public.sintomas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  horario text,
  sintoma text not null,
  intensidade int not null default 0,
  duracao text,
  observacao text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Exames
-- ---------------------------------------------------------------------
create table if not exists public.exames (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tipo text,
  data date,
  local text,
  medico_solicitante text,
  observacao text,
  arquivo_path text, -- caminho no Storage (bucket hellen-arquivos)
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Agenda
-- ---------------------------------------------------------------------
create table if not exists public.agenda (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null,
  data date not null,
  horario text,
  local text,
  descricao text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Minha Jornada (linha do tempo)
-- ---------------------------------------------------------------------
create table if not exists public.eventos_jornada (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  titulo text not null,
  categoria text not null default 'pessoal',
  descricao text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Minhas Dúvidas (Etapa 2)
-- ---------------------------------------------------------------------
create table if not exists public.duvidas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  pergunta text not null,
  status text not null default 'quero_perguntar', -- quero_perguntar | respondida
  resposta text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Documentos (Etapa 2) — pasta digital, além dos arquivos de exame
-- ---------------------------------------------------------------------
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  categoria text not null default 'outros',
  nome text not null,
  data date,
  observacao text,
  arquivo_path text, -- caminho no Storage (bucket hellen-arquivos)
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Memórias (Etapa 3) — galeria da jornada, nem tudo precisa ser sobre
-- tratamento
-- ---------------------------------------------------------------------
create table if not exists public.memorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date,
  foto_path text not null, -- caminho no Storage (bucket hellen-arquivos)
  legenda text,
  descricao text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Mural (Etapa 3) — mensagens de quem é próximo da Hellen. Como só ela
-- tem login por enquanto (acesso familiar é Etapa 4), as mensagens são
-- registradas por ela mesma (ou por quem estiver ajudando), em nome de
-- quem escreveu.
-- ---------------------------------------------------------------------
create table if not exists public.mural (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  autor text not null,
  mensagem text not null,
  foto_path text, -- caminho no Storage (bucket hellen-arquivos)
  data date not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Minha Rede de Apoio (Etapa 3) — família, equipe médica, contatos úteis
-- ---------------------------------------------------------------------
create table if not exists public.contatos_apoio (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  categoria text not null, -- familia | equipe_medica | util
  nome text not null,
  telefone text,
  relacao text,       -- só categoria = familia
  especialidade text, -- só categoria = equipe_medica
  hospital text,      -- só categoria = equipe_medica
  tipo_util text,     -- só categoria = util (hospital | laboratorio | convenio | farmacia)
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Cantinho da Helô — crianças autorizadas a mandar carinho (desenhos e
-- recadinhos) pra Hellen. Elas não têm login: quem gerencia essa lista
-- é a própria Hellen, autenticada. As gravações feitas PELA criança
-- (inserir em "carinhos") passam por uma rota do servidor usando a
-- chave secreta do Supabase — por isso não existe policy de "insert"
-- pública aqui, só as de leitura/atualização da Hellen.
-- ---------------------------------------------------------------------
create table if not exists public.criancas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade, -- quem recebe os carinhos (Hellen)
  nome text not null,
  avatar_emoji text not null default '🌸',
  ativo boolean not null default true,
  pode_desenhar boolean not null default true,
  pode_enviar_recado boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.carinhos (
  id uuid primary key default gen_random_uuid(),
  destinatario_user_id uuid not null references auth.users (id) on delete cascade,
  crianca_id uuid not null references public.criancas (id) on delete cascade,
  tipo text not null, -- desenho | recado
  mensagem text,
  arquivo_path text, -- caminho no Storage (bucket hellen-arquivos), só quando tipo = desenho
  visualizado boolean not null default false,
  favorito boolean not null default false,
  reacao text, -- ex: 'amei', ou null
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security — cada usuário só acessa as próprias linhas.
-- ---------------------------------------------------------------------
alter table public.tratamento_info enable row level security;
alter table public.ciclos enable row level security;
alter table public.diario enable row level security;
alter table public.sintomas enable row level security;
alter table public.exames enable row level security;
alter table public.agenda enable row level security;
alter table public.eventos_jornada enable row level security;
alter table public.duvidas enable row level security;
alter table public.documentos enable row level security;
alter table public.memorias enable row level security;
alter table public.mural enable row level security;
alter table public.contatos_apoio enable row level security;
alter table public.criancas enable row level security;
alter table public.carinhos enable row level security;

do $$
declare
  tabela text;
begin
  foreach tabela in array array[
    'tratamento_info', 'ciclos', 'diario', 'sintomas',
    'exames', 'agenda', 'eventos_jornada', 'duvidas', 'documentos',
    'memorias', 'mural', 'contatos_apoio', 'criancas'
  ]
  loop
    execute format('drop policy if exists "dono_select" on public.%I', tabela);
    execute format('drop policy if exists "dono_insert" on public.%I', tabela);
    execute format('drop policy if exists "dono_update" on public.%I', tabela);
    execute format('drop policy if exists "dono_delete" on public.%I', tabela);

    execute format(
      'create policy "dono_select" on public.%I for select using (auth.uid() = user_id)',
      tabela
    );
    execute format(
      'create policy "dono_insert" on public.%I for insert with check (auth.uid() = user_id)',
      tabela
    );
    execute format(
      'create policy "dono_update" on public.%I for update using (auth.uid() = user_id)',
      tabela
    );
    execute format(
      'create policy "dono_delete" on public.%I for delete using (auth.uid() = user_id)',
      tabela
    );
  end loop;
end $$;

-- "carinhos" usa destinatario_user_id (não user_id) e não tem policy de
-- insert — só a Hellen lê/atualiza (reação, favorito, visualizado); quem
-- grava um carinho novo é a rota do servidor, com a service role key,
-- que ignora RLS.
drop policy if exists "dono_select" on public.carinhos;
drop policy if exists "dono_update" on public.carinhos;
drop policy if exists "dono_delete" on public.carinhos;

create policy "dono_select" on public.carinhos for select
  using (auth.uid() = destinatario_user_id);
create policy "dono_update" on public.carinhos for update
  using (auth.uid() = destinatario_user_id);
create policy "dono_delete" on public.carinhos for delete
  using (auth.uid() = destinatario_user_id);

-- ---------------------------------------------------------------------
-- Storage — fotos do diário e arquivos de exames, em bucket privado.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('hellen-arquivos', 'hellen-arquivos', false)
on conflict (id) do nothing;

drop policy if exists "hellen_arquivos_select" on storage.objects;
drop policy if exists "hellen_arquivos_insert" on storage.objects;
drop policy if exists "hellen_arquivos_delete" on storage.objects;

-- Os arquivos são guardados em caminhos "<user_id>/...", então cada
-- usuário só acessa a própria pasta dentro do bucket.
create policy "hellen_arquivos_select" on storage.objects for select
  using (bucket_id = 'hellen-arquivos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "hellen_arquivos_insert" on storage.objects for insert
  with check (bucket_id = 'hellen-arquivos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "hellen_arquivos_delete" on storage.objects for delete
  using (bucket_id = 'hellen-arquivos' and (storage.foldername(name))[1] = auth.uid()::text);
