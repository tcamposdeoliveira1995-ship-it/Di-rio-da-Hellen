// Cliente Supabase para uso em Server Components, Route Handlers e no
// middleware — lê/grava a sessão nos cookies da requisição.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Em Server Components (fora de rotas/middleware) não é possível
          // escrever cookies — isso é esperado, o middleware já cuida de
          // renovar a sessão em toda requisição.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignorar
          }
        },
      },
    }
  );
}
