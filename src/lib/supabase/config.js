// URL e chave "anon/publishable" do projeto Supabase.
//
// Essas duas coisas são feitas pra serem públicas — quem protege os dados
// da Hellen é o Row Level Security configurado em supabase/schema.sql, não
// o segredo dessa chave (bem diferente da sb_secret_/service_role, essa
// sim nunca deve aparecer aqui). Por isso é seguro deixar um valor padrão
// direto no código: assim o app não depende de as variáveis de ambiente
// chegarem certinho em toda plataforma de deploy. Se um dia for preciso
// apontar para outro projeto Supabase (ex: um ambiente de teste), basta
// configurar as variáveis de ambiente — elas continuam tendo prioridade.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pojqwgiwecmtwdopcmfa.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_hRTdz6-5llmXd49pqJRY_g_bqMXKwUt";
