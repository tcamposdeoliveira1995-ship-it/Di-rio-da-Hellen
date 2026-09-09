"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { telefoneParaEmail } from "@/lib/contaFamiliar";

export default function CadastroForm() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cadastrado, setCadastrado] = useState(false);

  async function aoEnviar(e) {
    e.preventDefault();
    setErro("");

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }
    const digitos = telefone.replace(/\D/g, "");
    if (digitos.length < 10) {
      setErro("Digita um telefone válido, com DDD.");
      return;
    }

    setEnviando(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: telefoneParaEmail(telefone),
        password: senha,
        options: { data: { nome, telefone } },
      });
      if (error) {
        setErro(
          error.message?.includes("already registered") || error.status === 422
            ? "Já existe uma conta com esse telefone."
            : `Não foi possível criar a conta. (${error.message || "erro desconhecido"})`
        );
        return;
      }
      setCadastrado(true);
    } catch (err) {
      setErro(`Não foi possível conectar. (${err?.message || "erro desconhecido"})`);
    } finally {
      setEnviando(false);
    }
  }

  if (cadastrado) {
    return (
      <div className="text-center space-y-4">
        <p className="text-3xl">🌻</p>
        <p className="font-medium text-ink">Conta criada!</p>
        <p className="text-sm text-muted">
          Agora é só esperar a Hellen aprovar seu acesso — sem isso você ainda não
          consegue ver nada.
        </p>
        <Link href="/login" className="inline-block text-sm text-burnt hover:underline">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={aoEnviar} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm text-muted mb-1">Nome</label>
        <input
          id="nome"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-burnt"
        />
      </div>

      <div>
        <label htmlFor="telefone" className="block text-sm text-muted mb-1">Telefone</label>
        <input
          id="telefone"
          type="tel"
          required
          placeholder="(11) 91234-5678"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-burnt"
        />
      </div>

      <div>
        <label htmlFor="senha" className="block text-sm text-muted mb-1">Senha</label>
        <input
          id="senha"
          type="password"
          required
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-burnt"
        />
      </div>

      <div>
        <label htmlFor="confirmar" className="block text-sm text-muted mb-1">Confirmar senha</label>
        <input
          id="confirmar"
          type="password"
          required
          autoComplete="new-password"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          className="w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-burnt"
        />
      </div>

      {erro && <p className="text-sm text-burnt">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-burnt text-white py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {enviando && <Loader2 size={16} className="animate-spin" />}
        Criar conta
      </button>

      <p className="text-center text-xs text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="text-burnt hover:underline">Entrar</Link>
      </p>
    </form>
  );
}
