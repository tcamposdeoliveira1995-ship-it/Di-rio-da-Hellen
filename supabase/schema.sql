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
  foto_path text, -- caminho no Storage (bucket hellen-arquivos) — mantida por compatibilidade, não é mais escrita; ver fotos_paths
  fotos_paths text[] not null default '{}', -- várias fotos por dia (bucket hellen-arquivos)
  created_at timestamptz not null default now(),
  unique (user_id, data)
);

alter table public.diario add column if not exists fotos_paths text[] not null default '{}';

-- migra a foto única de quem já usava o diário antes de existirem várias
-- fotos por dia — idempotente: só mexe em quem ainda não tem a foto
-- antiga dentro do array novo.
update public.diario
set fotos_paths = array[foto_path]
where foto_path is not null and not (foto_path = any(fotos_paths));

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
  -- Por padrão um carinho é só da Hellen ver (é endereçado a ela). Ela
  -- decide, um a um, se libera pra família visualizadora ver também.
  visivel_para_familia boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.carinhos add column if not exists visivel_para_familia boolean not null default false;

-- ---------------------------------------------------------------------
-- Acesso familiar — vários usuários de verdade (nome + telefone + senha,
-- por baixo dos panos um e-mail sintético gerado a partir do telefone).
-- Todo mundo que se cadastra vira "pendente" até a Hellen aprovar; só
-- ela é "admin" (edita tudo); quem for aprovado como "visualizador" vê
-- tudo, mas não edita nada. A Helô não entra aqui — ela usa o Cantinho,
-- que nem precisa de login.
-- ---------------------------------------------------------------------
create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  telefone text,
  papel text not null default 'pendente', -- admin | visualizador | pendente
  created_at timestamptz not null default now()
);

alter table public.perfis enable row level security;

-- security definer: consulta "perfis" ignorando o próprio RLS da
-- tabela, pra evitar recursão infinita (uma policy de "perfis" que
-- precisasse consultar "perfis" de novo pra saber se auth.uid() é
-- admin, entraria em loop).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfis where id = auth.uid() and papel = 'admin'
  );
$$;

create or replace function public.pode_visualizar()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfis where id = auth.uid() and papel in ('admin', 'visualizador')
  );
$$;

drop policy if exists "perfis_select" on public.perfis;
create policy "perfis_select" on public.perfis for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "perfis_update" on public.perfis;
create policy "perfis_update" on public.perfis for update
  using (public.is_admin());

-- Cria o perfil (sempre "pendente") assim que alguém se cadastra —
-- roda com privilégio de dono da função, então funciona mesmo antes da
-- sessão da pessoa existir de verdade.
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, nome, telefone, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    new.raw_user_meta_data->>'telefone',
    'pendente'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

-- Backfill: quem já tinha conta antes desse schema existir (ou seja, só
-- a Hellen, já que até aqui era um app de usuário único) vira admin
-- automaticamente. Rodar de novo não faz nada de diferente — só quem
-- ainda não tem perfil ganha um, e só o primeiro rodar encontra alguém
-- nessa situação.
insert into public.perfis (id, nome, papel)
select id, coalesce(raw_user_meta_data->>'nome', 'Hellen'), 'admin'
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Row Level Security — a Hellen (admin) edita tudo; quem for aprovado
-- como visualizador vê tudo, mas não grava nada; "pendente" não vê
-- nada.
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
    execute format('drop policy if exists "familia_select" on public.%I', tabela);
    execute format('drop policy if exists "admin_insert" on public.%I', tabela);
    execute format('drop policy if exists "admin_update" on public.%I', tabela);
    execute format('drop policy if exists "admin_delete" on public.%I', tabela);

    execute format(
      'create policy "familia_select" on public.%I for select using (public.pode_visualizar())',
      tabela
    );
    execute format(
      'create policy "admin_insert" on public.%I for insert with check (public.is_admin())',
      tabela
    );
    execute format(
      'create policy "admin_update" on public.%I for update using (public.is_admin())',
      tabela
    );
    execute format(
      'create policy "admin_delete" on public.%I for delete using (public.is_admin())',
      tabela
    );
  end loop;
end $$;

-- "carinhos" é parecido, mas com uma diferença: um carinho é endereçado
-- à Hellen, então por padrão só ela (admin) vê. Quem é "visualizador"
-- só enxerga um carinho se ela marcou visivel_para_familia = true nele
-- — e essa regra é aplicada aqui no banco, não só escondida na tela.
-- Reagir, favoritar, apagar e tornar visível continuam só admin.
-- Continua sem policy de insert: quem grava um carinho novo é a rota do
-- servidor, com a service role key, que ignora RLS.
drop policy if exists "dono_select" on public.carinhos;
drop policy if exists "dono_update" on public.carinhos;
drop policy if exists "dono_delete" on public.carinhos;
drop policy if exists "familia_select" on public.carinhos;
drop policy if exists "admin_update" on public.carinhos;
drop policy if exists "admin_delete" on public.carinhos;

create policy "familia_select" on public.carinhos for select
  using (public.is_admin() or (public.pode_visualizar() and visivel_para_familia));
create policy "admin_update" on public.carinhos for update
  using (public.is_admin());
create policy "admin_delete" on public.carinhos for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- Storage — fotos do diário e arquivos de exames, em bucket privado.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('hellen-arquivos', 'hellen-arquivos', false)
on conflict (id) do nothing;

drop policy if exists "hellen_arquivos_select" on storage.objects;
drop policy if exists "hellen_arquivos_insert" on storage.objects;
drop policy if exists "hellen_arquivos_delete" on storage.objects;

-- Os arquivos são guardados em caminhos "<user_id>/...". Ver é pra
-- quem pode visualizar (admin ou visualizador aprovado); gravar/apagar
-- é só admin. (A pasta em si continua sendo sempre a da Hellen — é o
-- único "dono" de dados que existe — o caminho não muda.)
create policy "hellen_arquivos_select" on storage.objects for select
  using (bucket_id = 'hellen-arquivos' and public.pode_visualizar());

create policy "hellen_arquivos_insert" on storage.objects for insert
  with check (bucket_id = 'hellen-arquivos' and public.is_admin());

create policy "hellen_arquivos_delete" on storage.objects for delete
  using (bucket_id = 'hellen-arquivos' and public.is_admin());
