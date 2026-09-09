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
  memorias: [],
  mural: [],
  contatosApoio: [],
  criancas: [],
  carinhos: [],
  perfis: [],
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
      // Sem .eq("user_id", uid) de propósito: quem está logado pode não
      // ser a dona dos dados (um familiar aprovado como visualizador
      // olha os dados DA HELLEN, não os próprios — que nem existem).
      // Quem decide o que cada um vê é o RLS lá no banco
      // (pode_visualizar()/is_admin(), ver supabase/schema.sql), não um
      // filtro daqui. "perfis" é a exceção: sempre filtramos pelo
      // próprio uid primeiro pra saber se essa conta já foi aprovada,
      // antes de tentar carregar o resto.
      const meuPerfil = await supabase.from("perfis").select("*").eq("id", uid).maybeSingle();
      if (meuPerfil.error) throw meuPerfil.error;

      const souAprovada = meuPerfil.data?.papel === "admin" || meuPerfil.data?.papel === "visualizador";
      if (!souAprovada) {
        setDados({ ...ESTADO_VAZIO, perfis: meuPerfil.data ? [meuPerfil.data] : [] });
        return;
      }

      const [
        tratamento, ciclos, diario, sintomas, exames, agenda, eventosJornada,
        duvidas, documentos, memorias, mural, contatosApoio, criancas, carinhos, perfis,
      ] = await Promise.all([
        supabase.from("tratamento_info").select("*").maybeSingle(),
        supabase.from("ciclos").select("*").order("numero"),
        supabase.from("diario").select("*").order("data", { ascending: false }),
        supabase.from("sintomas").select("*").order("data", { ascending: false }),
        supabase.from("exames").select("*").order("data", { ascending: false }),
        supabase.from("agenda").select("*").order("data"),
        supabase.from("eventos_jornada").select("*").order("data"),
        supabase.from("duvidas").select("*").order("data", { ascending: false }),
        supabase.from("documentos").select("*").order("data", { ascending: false }),
        supabase.from("memorias").select("*").order("data", { ascending: false }),
        supabase.from("mural").select("*").order("data", { ascending: false }),
        supabase.from("contatos_apoio").select("*").order("nome"),
        supabase.from("criancas").select("*").order("nome"),
        supabase.from("carinhos").select("*").order("created_at", { ascending: false }),
        supabase.from("perfis").select("*").order("created_at"),
      ]);

      const primeiroErro = [
        tratamento, ciclos, diario, sintomas, exames, agenda, eventosJornada,
        duvidas, documentos, memorias, mural, contatosApoio, criancas, carinhos, perfis,
      ].map((r) => r.error).find(Boolean);
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
        memorias: memorias.data || [],
        mural: mural.data || [],
        contatosApoio: contatosApoio.data || [],
        criancas: criancas.data || [],
        carinhos: carinhos.data || [],
        perfis: perfis.data || [],
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

      async adicionarMemoria(memoria, arquivo) {
        const foto_path = await enviarArquivo(supabase, userId, arquivo);
        const data = await tratarErro(
          supabase.from("memorias").insert({ ...memoria, foto_path, user_id: userId }).select().single(),
          "Não foi possível adicionar a memória."
        );
        setDados((d) => ({ ...d, memorias: [data, ...d.memorias] }));
      },

      async adicionarMural(mensagem, arquivo) {
        let foto_path = null;
        if (arquivo) foto_path = await enviarArquivo(supabase, userId, arquivo);
        const data = await tratarErro(
          supabase.from("mural").insert({ ...mensagem, foto_path, user_id: userId }).select().single(),
          "Não foi possível adicionar a mensagem."
        );
        setDados((d) => ({ ...d, mural: [data, ...d.mural] }));
      },

      async adicionarContato(contato) {
        const data = await tratarErro(
          supabase.from("contatos_apoio").insert({ ...contato, user_id: userId }).select().single(),
          "Não foi possível adicionar o contato."
        );
        setDados((d) => ({
          ...d,
          contatosApoio: [...d.contatosApoio, data].sort((a, b) => a.nome.localeCompare(b.nome)),
        }));
      },

      async removerContato(id) {
        await tratarErro(
          supabase.from("contatos_apoio").delete().eq("id", id),
          "Não foi possível remover o contato."
        );
        setDados((d) => ({ ...d, contatosApoio: d.contatosApoio.filter((c) => c.id !== id) }));
      },

      async adicionarCrianca(crianca) {
        const data = await tratarErro(
          supabase.from("criancas").insert({ ...crianca, user_id: userId }).select().single(),
          "Não foi possível adicionar."
        );
        setDados((d) => ({
          ...d,
          criancas: [...d.criancas, data].sort((a, b) => a.nome.localeCompare(b.nome)),
        }));
      },

      async atualizarCrianca(id, parcial) {
        const data = await tratarErro(
          supabase.from("criancas").update(parcial).eq("id", id).select().single(),
          "Não foi possível atualizar."
        );
        setDados((d) => ({ ...d, criancas: d.criancas.map((c) => (c.id === id ? data : c)) }));
      },

      async reagirCarinho(id, reacao) {
        const data = await tratarErro(
          supabase.from("carinhos").update({ reacao, visualizado: true }).eq("id", id).select().single(),
          "Não foi possível reagir."
        );
        setDados((d) => ({ ...d, carinhos: d.carinhos.map((c) => (c.id === id ? data : c)) }));
      },

      async favoritarCarinho(id, favorito) {
        const data = await tratarErro(
          supabase.from("carinhos").update({ favorito, visualizado: true }).eq("id", id).select().single(),
          "Não foi possível favoritar."
        );
        setDados((d) => ({ ...d, carinhos: d.carinhos.map((c) => (c.id === id ? data : c)) }));
      },

      async marcarCarinhoVisualizado(id) {
        const data = await tratarErro(
          supabase.from("carinhos").update({ visualizado: true }).eq("id", id).select().single(),
          "Não foi possível atualizar."
        );
        setDados((d) => ({ ...d, carinhos: d.carinhos.map((c) => (c.id === id ? data : c)) }));
      },

      // Admin aprova (ou reprova/revoga) alguém — só quem já é admin
      // consegue de fato gravar isso, o RLS que garante (ver
      // "perfis_update" no schema.sql).
      async definirPapel(id, papel) {
        const data = await tratarErro(
          supabase.from("perfis").update({ papel }).eq("id", id).select().single(),
          "Não foi possível atualizar essa pessoa."
        );
        setDados((d) => ({ ...d, perfis: d.perfis.map((p) => (p.id === id ? data : p)) }));
      },
    };
  }, [supabase, userId, dados]);

  const meuPerfil = useMemo(() => dados.perfis.find((p) => p.id === userId) || null, [dados.perfis, userId]);
  const souAdmin = meuPerfil?.papel === "admin";
  const souPendente = userId != null && meuPerfil?.papel !== "admin" && meuPerfil?.papel !== "visualizador";

  const valor = useMemo(
    () => ({
      ...dados,
      ...acoes,
      carregando,
      erro,
      userId,
      meuPerfil,
      souAdmin,
      souPendente,
      recarregar: () => userId && carregarTudo(userId),
    }),
    [dados, acoes, carregando, erro, userId, meuPerfil, souAdmin, souPendente, carregarTudo]
  );

  return <StoreContext.Provider value={valor}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de <StoreProvider>");
  return ctx;
}
