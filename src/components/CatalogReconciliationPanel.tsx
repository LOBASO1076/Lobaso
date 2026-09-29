import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CameraOff, CircleAlert, DatabaseZap, PackageSearch, Search, ShieldCheck, Tag } from "lucide-react";
import { useMemo, useState } from "react";

type ChannelFilter = "all" | "b2c" | "b2b" | "unassigned";
type TrafficFilter = "all" | "red";
const currency = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CatalogReconciliationPanel() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [trafficLight, setTrafficLight] = useState<TrafficFilter>("red");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const query = trpc.dashboard.catalogReconciliation.useQuery({ channel, trafficLight }, { enabled: isAuthenticated });
  const data = query.data;
  const rows = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("pt-BR");
    return (data?.items ?? []).filter((item) => !normalized || item.sourceName.toLocaleLowerCase("pt-BR").includes(normalized));
  }, [data?.items, search]);
  const importReferences = trpc.dashboard.seedCatalogReconciliation.useMutation({
    onSuccess: async (result) => {
      await utils.dashboard.catalogReconciliation.invalidate();
      setNotice(result.persisted
        ? `Importação concluída: ${result.inserted} novas referências bloqueadas; ${result.alreadyPresent} já estavam registradas.`
        : "Banco indisponível: nenhuma referência foi gravada.");
    },
    onError: (error) => setNotice(error.message),
  });

  if (!isAuthenticated) return <Card className="border border-dashed border-[#dce7e1] bg-[#fbfdf9]"><CardContent className="flex items-center gap-3 p-5"><ShieldCheck className="h-5 w-5 text-[#168267]"/><p className="text-xs leading-5 text-[#71847e]">A fila de reconciliação existe no tenant de staging. Entre com a conta operacional para visualizar os campos pendentes.</p></CardContent></Card>;
  if (!data) return null;
  const counters = [["SKU", data.missing.sku, Tag], ["Custo", data.missing.cost, DatabaseZap], ["Estoque", data.missing.stock, PackageSearch], ["Foto real", data.missing.photo, CameraOff]] as const;
  const filterButton = (active: boolean) => `rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-all ${active ? "bg-[#102c36] text-white shadow-sm" : "text-[#71847e] hover:bg-[#edf5f1]"}`;

  return <Card className="border-0 bg-white shadow-[0_14px_45px_rgba(14,49,52,0.06)]">
    <CardHeader className="border-b border-[#edf2ef] pb-4"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start"><div><div className="mb-2 flex flex-wrap items-center gap-2"><Badge className="border-0 bg-[#ffe1df] text-[#b74138]"><CircleAlert className="mr-1 h-3.5 w-3.5"/> BLOQUEADO — REFERÊNCIA RED</Badge><Badge className="border-0 bg-[#fff0cf] text-[#946422]">staging / sem promoção</Badge></div><CardTitle className="text-[17px] text-[#183b43]">Catálogo B2B: quarentena controlada.</CardTitle><CardDescription className="mt-1 max-w-2xl">Referências são visíveis apenas para revisão interna. Nenhum item será ativado sem SKU comercial, custo posto, estoque, lote, validade, foto, impostos, logística e aprovação.</CardDescription></div><div className="rounded-xl bg-[#fff4f3] px-3 py-2 text-right"><p className="text-lg font-semibold text-[#b74138]">{rows.length}</p><p className="text-[10px] uppercase tracking-[0.1em] text-[#9a736f]">resultado filtrado</p></div></div></CardHeader>
    <CardContent className="p-5">
      <div className="mb-4 flex flex-col gap-3 rounded-xl bg-[#f7faf6] p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71847e]">Filtros internos</p><p className="mt-1 text-xs text-[#81918d]">Busca, canal e risco não alteram a quarentena.</p></div><div className="flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-sm"><button onClick={() => setChannel("all")} className={filterButton(channel === "all")}>Todos</button><button onClick={() => setChannel("b2c")} className={filterButton(channel === "b2c")}>B2C</button><button onClick={() => setChannel("b2b")} className={filterButton(channel === "b2b")}>B2B</button><button onClick={() => setChannel("unassigned")} className={filterButton(channel === "unassigned")}>Sem canal</button><button onClick={() => setTrafficLight(trafficLight === "red" ? "all" : "red")} className={filterButton(trafficLight === "red")}>BLOQUEADO · RED</button></div></div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row"><label className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#8a9b96]"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Localizar produto ou corte" className="h-9 w-full rounded-lg border border-[#dfe9e2] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#168267]"/></label><Button onClick={() => importReferences.mutate()} disabled={importReferences.isPending} variant="outline" className="h-9 shrink-0 border-[#cbded5] text-xs"><DatabaseZap className="mr-2 h-3.5 w-3.5"/>{importReferences.isPending ? "Registrando…" : "Registrar 151 referências bloqueadas"}</Button></div>
      {notice && <p role="status" className="mb-3 rounded-lg bg-[#edf5f1] px-3 py-2 text-xs text-[#49625d]">{notice}</p>}
      <div className="grid gap-2 sm:grid-cols-4">{counters.map(([label, count, Icon]) => <div key={label} className="rounded-xl bg-[#f7faf6] p-3"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[0.1em] text-[#81918d]">Sem {label}</p><Icon className="h-3.5 w-3.5 text-[#9d6334]"/></div><p className="mt-2 text-lg font-semibold text-[#183b43]">{count}</p></div>)}</div>
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#f7faf6] p-3 text-center"><div><p className="text-lg font-semibold text-[#b74138]">{data.traffic.red}</p><p className="text-[10px] uppercase tracking-[0.08em] text-[#8a9b96]">RED</p></div><div><p className="text-lg font-semibold text-[#946422]">{data.traffic.yellow}</p><p className="text-[10px] uppercase tracking-[0.08em] text-[#8a9b96]">YELLOW</p></div><div><p className="text-lg font-semibold text-[#187254]">{data.traffic.green}</p><p className="text-[10px] uppercase tracking-[0.08em] text-[#8a9b96]">GREEN</p></div></div>
      <p className="mt-3 text-[10px] leading-4 text-[#8a9b96]">Pendências no resultado: lote {data.missing.lot}, validade {data.missing.expiry}, impostos {data.missing.tax} e logística {data.missing.logistics}.</p>
      <div className="mt-4 divide-y divide-[#edf2ef] rounded-xl border border-[#e8eeea]">{rows.length ? rows.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-semibold text-[#183b43]">{item.sourceName}</p><p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[#8a9b96]">{item.channel} · referência interna {item.referencePriceCents === null ? "· sem valor" : `· ${currency(item.referencePriceCents)}`}</p></div><Badge className="shrink-0 border-0 bg-[#ffe1df] text-[10px] text-[#b74138]">BLOQUEADO · {item.trafficLight.toUpperCase()}</Badge></div>) : <p className="px-3 py-5 text-center text-xs text-[#81918d]">Nenhum item corresponde ao filtro selecionado.</p>}</div>
      <p className="mt-3 text-[10px] leading-4 text-[#8a9b96]">As 151 referências permanecem fora da vitrine. Preço de referência, inclusive a coluna B2B, não é preço liberado para venda.</p>
    </CardContent>
  </Card>;
}
