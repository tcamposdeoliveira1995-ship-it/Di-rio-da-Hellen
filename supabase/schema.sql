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

do $$
declare
  tabela text;
begin
  foreach tabela in array array[
    'tratamento_info', 'ciclos', 'diario', 'sintomas',
    'exames', 'agenda', 'eventos_jornada', 'duvidas', 'documentos'
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
