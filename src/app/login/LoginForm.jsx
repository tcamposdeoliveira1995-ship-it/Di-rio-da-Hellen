"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { identificadorParaEmail } from "@/lib/contaFamiliar";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destino = searchParams.get("from") || "/";

  const [modoRecuperacao, setModoRecuperacao] = useState(false);

  // Quando a Hellen clica no link do e-mail de redefinição de senha, o
  // Supabase abre essa mesma tela já autenticada numa sessão temporária de
  // recuperação — é esse evento que dispara a troca de senha em vez do login.
  useEffect(() => {
    const supabase = createClient();
    const { data: subscription } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "PASSWORD_RECOVERY") setModoRecuperacao(true);
    });
    return () => subscription?.subscription?.unsubscribe();
  }, []);

  if (modoRecuperacao) {
    return <FormularioNovaSenha onConcluido={() => { router.push("/"); router.refresh(); }} />;
  }

  return <FormularioLogin destino={destino} router={router} />;
}

function FormularioLogin({ destino, router }) {
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviandoReset, setEnviandoReset] = useState(false);

  async function aoEnviar(e) {
    e.preventDefault();
    setErro("");
    setAviso("");
    setEnviando(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: identificadorParaEmail(identificador),
        password,
      });
      if (error) {
        setErro("E-mail/telefone ou senha incorretos.");
        return;
      }
      router.push(destino);
      router.refresh();
    } catch {
      setErro("Não foi possível conectar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function aoEsqueciSenha() {
    setErro("");
    setAviso("");
    if (!identificador) {
      setErro("Digite seu e-mail ou telefone acima e clique em \"Esqueci minha senha\" de novo.");
      return;
    }
    if (!identificador.includes("@")) {
      setErro("Contas cadastradas com telefone precisam pedir pra Hellen redefinir a senha direto no Supabase.");
      return;
    }
    setEnviandoReset(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(identificador, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      });
      if (error) {
        setErro("Não foi possível enviar o e-mail de redefinição.");
        return;
      }
      setAviso("Se esse e-mail estiver cadastrado, enviamos um link para redefinir a senha.");
    } finally {
      setEnviandoReset(false);
    }
  }

  return (
    <form onSubmit={aoEnviar} className="space-y-4">
      <div>
        <label htmlFor="identificador" className="block text-sm text-muted mb-1">E-mail ou telefone</label>
        <input
          id="identificador"
          required
          autoComplete="username"
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          className="w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-burnt"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm text-muted mb-1">Senha</label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-burnt"
        />
      </div>

      {erro && <p className="text-sm text-burnt">{erro}</p>}
      {aviso && <p className="text-sm text-ink bg-blush-soft rounded-xl px-3 py-2">{aviso}</p>}

      <div className="flex items-center justify-end text-sm">
        <button
          type="button"
          onClick={aoEsqueciSenha}
          disabled={enviandoReset}
          className="text-burnt hover:underline disabled:opacity-60"
        >
          Esqueci minha senha
        </button>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-burnt text-white py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {enviando && <Loader2 size={16} className="animate-spin" />}
        Entrar
      </button>

      <p className="text-center text-xs text-muted">
        É da família e ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-burnt hover:underline">Criar conta</Link>
      </p>
    </form>
  );
}

function FormularioNovaSenha({ onConcluido }) {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(e) {
    e.preventDefault();
    setErro("");
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não são iguais.");
      return;
    }
    setEnviando(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) {
        setErro("Não foi possível trocar a senha. Tente pedir um novo link.");
        return;
      }
      onConcluido();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={aoEnviar} className="space-y-4">
      <p className="text-sm text-ink">Escolha sua nova senha.</p>
      <div>
        <label htmlFor="nova-senha" className="block text-sm text-muted mb-1">Nova senha</label>
        <input
          id="nova-senha"
          type="password"
          required
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-burnt"
        />
      </div>
      <div>
        <label htmlFor="confirmar-senha" className="block text-sm text-muted mb-1">Confirmar senha</label>
        <input
          id="confirmar-senha"
          type="password"
          required
          autoComplete="new-password"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
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
        Salvar nova senha
      </button>
    </form>
  );
}
