"use client";

// Store do diário: busca e grava tudo no Supabase (ver
// supabase/schema.sql). Fica atrás de hooks (useStore) pra que as telas
// nunca chamem o cliente Supabase direto — só usam ações como
// adicionarDiario, adicionarSintoma etc.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "./supabase/client";
import { enviarArquivo } from "./supabase/storage";
import { hoje } from "./date";

const StoreContext = createContext(null);

const ESTADO_VAZIO = {
  tratamentoInfo: null,
  ciclos: [],
  diario: [],
  sintomas: [],
  exames: [],
  agenda: [],
  eventosJornada: [],
  duvidas: [],
  documentos: [],
};

export function StoreProvider({ children }) {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState(null);
  const [dados, setDados] = useState(ESTADO_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarTudo = useCallback(async (uid) => {
    setCarregando(true);
    setErro("");
    try {
      const [tratamento, ciclos, diario, sintomas, exames, agenda, eventosJornada, duvidas, documentos] =
        await Promise.all([
          supabase.from("tratamento_info").select("*").eq("user_id", uid).maybeSingle(),
          supabase.from("ciclos").select("*").eq("user_id", uid).order("numero"),
          supabase.from("diario").select("*").eq("user_id", uid).order("data", { ascending: false }),
          supabase.from("sintomas").select("*").eq("user_id", uid).order("data", { ascending: false }),
          supabase.from("exames").select("*").eq("user_id", uid).order("data", { ascending: false }),
          supabase.from("agenda").select("*").eq("user_id", uid).order("data"),
          supabase.from("eventos_jornada").select("*").eq("user_id", uid).order("data"),
          supabase.from("duvidas").select("*").eq("user_id", uid).order("data", { ascending: false }),
          supabase.from("documentos").select("*").eq("user_id", uid).order("data", { ascending: false }),
        ]);

      const primeiroErro = [tratamento, ciclos, diario, sintomas, exames, agenda, eventosJornada, duvidas, documentos]
        .map((r) => r.error)
        .find(Boolean);
      if (primeiroErro) throw primeiroErro;

      setDados({
        tratamentoInfo: tratamento.data,
        ciclos: ciclos.data || [],
        diario: diario.data || [],
        sintomas: sintomas.data || [],
        exames: exames.data || [],
        agenda: agenda.data || [],
        eventosJornada: eventosJornada.data || [],
        duvidas: duvidas.data || [],
        documentos: documentos.data || [],
      });
    } catch (err) {
      console.error("Erro ao carregar os dados do Supabase:", err);
      setErro(
        "Não foi possível carregar os dados. Verifique se o schema do Supabase foi aplicado e se as variáveis de ambiente estão configuradas."
      );
    } finally {
      setCarregando(false);
    }
  }, [supabase]);

  useEffect(() => {
    let cancelado = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelado) return;
      const uid = data.user?.id || null;
      setUserId(uid);
      if (uid) carregarTudo(uid);
      else setCarregando(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      const uid = sessao?.user?.id || null;
      setUserId(uid);
      if (uid) carregarTudo(uid);
      else setDados(ESTADO_VAZIO);
    });

    return () => {
      cancelado = true;
      subscription?.subscription?.unsubscribe();
    };
  }, [supabase, carregarTudo]);

  const acoes = useMemo(() => {
    async function tratarErro(promessa, mensagem) {
      const { data, error } = await promessa;
      if (error) {
        console.error(mensagem, error);
        throw new Error(mensagem);
      }
      return data;
    }

    // Compartilhada por salvarDiario e atualizarHumorHoje — definida como
    // função nomeada (não como método) pra continuar funcionando mesmo
    // quando a tela desestrutura só um pedaço do useStore(), ex.:
    // `const { atualizarHumorHoje } = useStore()`.
    async function salvarDiario(entrada, arquivoFoto) {
      let foto_path = entrada.foto_path;
      if (arquivoFoto) {
        foto_path = await enviarArquivo(supabase, userId, arquivoFoto);
      }
      const linha = { ...entrada, foto_path, user_id: userId };
      const data = await tratarErro(
        supabase.from("diario").upsert(linha, { onConflict: "user_id,data" }).select().single(),
        "Não foi possível salvar o registro do diário."
      );
      setDados((d) => ({
        ...d,
        diario: [data, ...d.diario.filter((e) => e.data !== data.data)].sort((a, b) =>
          b.data.localeCompare(a.data)
        ),
      }));
    }

    return {
      salvarDiario,

      async atualizarHumorHoje(humor) {
        const data = hoje();
        const existente = dados.diario.find((e) => e.data === data);
        await salvarDiario({ ...(existente || { data }), humor });
      },

      async salvarTratamentoInfo(parcial) {
        const linha = { ...dados.tratamentoInfo, ...parcial, user_id: userId };
        const data = await tratarErro(
          supabase.from("tratamento_info").upsert(linha).select().single(),
          "Não foi possível salvar as informações do tratamento."
        );
        setDados((d) => ({ ...d, tratamentoInfo: data }));
      },

      async adicionarCiclo(ciclo) {
        const data = await tratarErro(
          supabase.from("ciclos").insert({ ...ciclo, user_id: userId }).select().single(),
          "Não foi possível adicionar o ciclo."
        );
        setDados((d) => ({ ...d, ciclos: [...d.ciclos, data].sort((a, b) => a.numero - b.numero) }));
      },

      async atualizarCiclo(id, parcial) {
        const data = await tratarErro(
          supabase.from("ciclos").update(parcial).eq("id", id).select().single(),
          "Não foi possível atualizar o ciclo."
        );
        setDados((d) => ({ ...d, ciclos: d.ciclos.map((c) => (c.id === id ? data : c)) }));
      },

      async adicionarSintoma(sintoma) {
        const data = await tratarErro(
          supabase.from("sintomas").insert({ ...sintoma, user_id: userId }).select().single(),
          "Não foi possível registrar o sintoma."
        );
        setDados((d) => ({ ...d, sintomas: [data, ...d.sintomas] }));
      },

      async adicionarExame(exame, arquivo) {
        let arquivo_path = null;
        if (arquivo) arquivo_path = await enviarArquivo(supabase, userId, arquivo);
        const data = await tratarErro(
          supabase.from("exames").insert({ ...exame, arquivo_path, user_id: userId }).select().single(),
          "Não foi possível adicionar o exame."
        );
        setDados((d) => ({ ...d, exames: [data, ...d.exames] }));
      },

      async adicionarAgenda(evento) {
        const data = await tratarErro(
          supabase.from("agenda").insert({ ...evento, user_id: userId }).select().single(),
          "Não foi possível adicionar o compromisso."
        );
        setDados((d) => ({
          ...d,
          agenda: [...d.agenda, data].sort((a, b) => a.data.localeCompare(b.data)),
        }));
      },

      async removerAgenda(id) {
        await tratarErro(
          supabase.from("agenda").delete().eq("id", id),
          "Não foi possível remover o compromisso."
        );
        setDados((d) => ({ ...d, agenda: d.agenda.filter((e) => e.id !== id) }));
      },

      async adicionarEventoJornada(evento) {
        const data = await tratarErro(
          supabase.from("eventos_jornada").insert({ ...evento, user_id: userId }).select().single(),
          "Não foi possível adicionar o evento à jornada."
        );
        setDados((d) => ({
          ...d,
          eventosJornada: [...d.eventosJornada, data].sort((a, b) => a.data.localeCompare(b.data)),
        }));
      },

      async adicionarDuvida(duvida) {
        const data = await tratarErro(
          supabase.from("duvidas").insert({ ...duvida, user_id: userId }).select().single(),
          "Não foi possível registrar a dúvida."
        );
        setDados((d) => ({ ...d, duvidas: [data, ...d.duvidas] }));
      },

      async atualizarDuvida(id, parcial) {
        const data = await tratarErro(
          supabase.from("duvidas").update(parcial).eq("id", id).select().single(),
          "Não foi possível atualizar a dúvida."
        );
        setDados((d) => ({ ...d, duvidas: d.duvidas.map((x) => (x.id === id ? data : x)) }));
      },

      async adicionarDocumento(documento, arquivo) {
        let arquivo_path = null;
        if (arquivo) arquivo_path = await enviarArquivo(supabase, userId, arquivo);
        const data = await tratarErro(
          supabase.from("documentos").insert({ ...documento, arquivo_path, user_id: userId }).select().single(),
          "Não foi possível adicionar o documento."
        );
        setDados((d) => ({ ...d, documentos: [data, ...d.documentos] }));
      },
    };
  }, [supabase, userId, dados]);

  const valor = useMemo(
    () => ({ ...dados, ...acoes, carregando, erro, userId, recarregar: () => userId && carregarTudo(userId) }),
    [dados, acoes, carregando, erro, userId, carregarTudo]
  );

  return <StoreContext.Provider value={valor}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de <StoreProvider>");
  return ctx;
}
