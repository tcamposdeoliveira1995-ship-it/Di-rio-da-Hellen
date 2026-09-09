"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, ChevronDown, ChevronUp, Loader2, Pencil } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { formatarDataLonga, hoje } from "@/lib/date";
import { STATUS_CICLO, statusCicloPorId } from "@/lib/constants";

export default function TratamentoClient() {
  const searchParams = useSearchParams();
  const { tratamentoInfo, ciclos, salvarTratamentoInfo, adicionarCiclo, atualizarCiclo } = useStore();
  const [editandoInfo, setEditandoInfo] = useState(!tratamentoInfo);
  const [novoAberto, setNovoAberto] = useState(searchParams.get("novo") === "1" && !!tratamentoInfo);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl text-ink">Tratamento 💊</h1>
        <p className="text-sm text-muted">Acompanhe as etapas, um ciclo por vez.</p>
      </header>

      <Card
        title="Informações gerais"
        icon="📋"
        action={
          !editandoInfo && (
            <button onClick={() => setEditandoInfo(true)} className="text-burnt text-sm flex items-center gap-1">
              <Pencil size={14} /> Editar
            </button>
          )
        }
      >
        {editandoInfo ? (
          <FormularioInfo
            info={tratamentoInfo}
            onSalvar={async (dados) => {
              await salvarTratamentoInfo(dados);
              setEditandoInfo(false);
            }}
            onCancelar={() => setEditandoInfo(false)}
            permiteCancelar={!!tratamentoInfo}
          />
        ) : (
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <Info label="Nome do tratamento" valor={tratamentoInfo.nome} />
            <Info label="Data de início" valor={tratamentoInfo.data_inicio && formatarDataLonga(tratamentoInfo.data_inicio)} />
            <Info label="Quantidade de ciclos" valor={tratamentoInfo.quantidade_ciclos} />
            <Info label="Equipe responsável" valor={tratamentoInfo.equipe_responsavel} />
            <Info label="Hospital / unidade" valor={tratamentoInfo.hospital} />
            <Info
              label="Início da jornada"
              valor={tratamentoInfo.jornada_data_inicio && formatarDataLonga(tratamentoInfo.jornada_data_inicio)}
            />
          </dl>
        )}
      </Card>

      {tratamentoInfo && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Ciclos</h2>
            {!novoAberto && (
              <button
                onClick={() => setNovoAberto(true)}
                className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90"
              >
                <Plus size={16} /> Adicionar ciclo
              </button>
            )}
          </div>

          {novoAberto && (
            <FormularioNovoCiclo
              proximoNumero={(ciclos[ciclos.length - 1]?.numero || 0) + 1}
              onSalvar={async (ciclo) => {
                await adicionarCiclo(ciclo);
                setNovoAberto(false);
              }}
              onCancelar={() => setNovoAberto(false)}
            />
          )}

          {ciclos.length === 0 ? (
            <Card>
              <EmptyState titulo="Nenhum ciclo cadastrado ainda" emoji="💊" />
            </Card>
          ) : (
            <div className="space-y-3">
              {ciclos.map((ciclo) => (
                <CicloCard key={ciclo.id} ciclo={ciclo} onAtualizar={atualizarCiclo} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Info({ label, valor }) {
  if (!valor) return null;
  return (
    <div>
      <dt className="text-muted text-xs">{label}</dt>
      <dd className="text-ink">{valor}</dd>
    </div>
  );
}

function FormularioInfo({ info, onSalvar, onCancelar, permiteCancelar }) {
  const [nome, setNome] = useState(info?.nome || "");
  const [dataInicio, setDataInicio] = useState(info?.data_inicio || "");
  const [quantidadeCiclos, setQuantidadeCiclos] = useState(info?.quantidade_ciclos || "");
  const [equipeResponsavel, setEquipeResponsavel] = useState(info?.equipe_responsavel || "");
  const [hospital, setHospital] = useState(info?.hospital || "");
  const [jornadaDataInicio, setJornadaDataInicio] = useState(info?.jornada_data_inicio || hoje());
  const [salvando, setSalvando] = useState(false);

  async function aoSalvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await onSalvar({
        nome,
        data_inicio: dataInicio || null,
        quantidade_ciclos: quantidadeCiclos ? Number(quantidadeCiclos) : null,
        equipe_responsavel: equipeResponsavel,
        hospital,
        jornada_data_inicio: jornadaDataInicio || null,
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={aoSalvar} className="space-y-3">
      <CampoTexto label="Nome do tratamento" valor={nome} onChange={setNome} />
      <div className="grid grid-cols-2 gap-3">
        <CampoData label="Data de início do tratamento" valor={dataInicio} onChange={setDataInicio} />
        <CampoTexto
          label="Quantidade de ciclos"
          valor={quantidadeCiclos}
          onChange={setQuantidadeCiclos}
          type="number"
        />
      </div>
      <CampoTexto label="Equipe responsável" valor={equipeResponsavel} onChange={setEquipeResponsavel} />
      <CampoTexto label="Hospital / unidade" valor={hospital} onChange={setHospital} />
      <CampoData
        label="Data de início da sua jornada (para o contador 'Dia N')"
        valor={jornadaDataInicio}
        onChange={setJornadaDataInicio}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-2 rounded-xl bg-burnt text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {salvando && <Loader2 size={16} className="animate-spin" />}
          Salvar
        </button>
        {permiteCancelar && (
          <button type="button" onClick={onCancelar} className="text-sm text-muted">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function FormularioNovoCiclo({ proximoNumero, onSalvar, onCancelar }) {
  const [numero, setNumero] = useState(proximoNumero);
  const [data, setData] = useState("");
  const [status, setStatus] = useState("aguardando");
  const [salvando, setSalvando] = useState(false);

  async function aoSalvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await onSalvar({ numero: Number(numero), data: data || null, status });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card>
      <form onSubmit={aoSalvar} className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <CampoTexto label="Ciclo nº" valor={numero} onChange={setNumero} type="number" />
          <CampoData label="Data" valor={data} onChange={setData} />
          <div>
            <label className="block text-sm text-muted mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
            >
              {STATUS_CICLO.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="flex items-center gap-2 rounded-xl bg-burnt text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {salvando && <Loader2 size={16} className="animate-spin" />}
            Adicionar
          </button>
          <button type="button" onClick={onCancelar} className="text-sm text-muted">
            Cancelar
          </button>
        </div>
      </form>
    </Card>
  );
}

const CAMPOS_DETALHE_CICLO = [
  ["local", "Local"],
  ["horario", "Horário"],
  ["duracao", "Duração"],
  ["medicamentos", "Medicamentos"],
  ["como_chegou", "Como chegou"],
  ["como_saiu", "Como saiu"],
  ["sintomas", "Sintomas"],
  ["observacoes", "Observações"],
  ["intercorrencias", "Intercorrências"],
  ["acompanhante", "Acompanhante"],
];

function CicloCard({ ciclo, onAtualizar }) {
  const [aberto, setAberto] = useState(false);
  const [valores, setValores] = useState(() =>
    Object.fromEntries(CAMPOS_DETALHE_CICLO.map(([campo]) => [campo, ciclo[campo] || ""]))
  );
  const [status, setStatus] = useState(ciclo.status);
  const [salvando, setSalvando] = useState(false);
  const statusInfo = statusCicloPorId(status);

  async function aoSalvar() {
    setSalvando(true);
    try {
      await onAtualizar(ciclo.id, { ...valores, status });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card className="!p-4">
      <button
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span aria-hidden>{statusInfo.emoji}</span>
          <div>
            <p className="font-medium text-ink">Ciclo {ciclo.numero}</p>
            <p className="text-xs text-muted">
              {ciclo.data ? formatarDataLonga(ciclo.data) : "Sem data prevista"} · {statusInfo.label}
            </p>
          </div>
        </div>
        {aberto ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
      </button>

      {aberto && (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          <div>
            <label className="block text-sm text-muted mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
            >
              {STATUS_CICLO.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {CAMPOS_DETALHE_CICLO.map(([campo, label]) => (
              <div key={campo}>
                <label className="block text-sm text-muted mb-1">{label}</label>
                <input
                  value={valores[campo]}
                  onChange={(e) => setValores((v) => ({ ...v, [campo]: e.target.value }))}
                  className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>

          <button
            onClick={aoSalvar}
            disabled={salvando}
            className="flex items-center gap-2 rounded-xl bg-burnt text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {salvando && <Loader2 size={16} className="animate-spin" />}
            Salvar detalhes
          </button>
        </div>
      )}
    </Card>
  );
}

function CampoTexto({ label, valor, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm text-muted mb-1">{label}</label>
      <input
        type={type}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
      />
    </div>
  );
}

function CampoData({ label, valor, onChange }) {
  return (
    <div>
      <label className="block text-sm text-muted mb-1">{label}</label>
      <input
        type="date"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
      />
    </div>
  );
}
