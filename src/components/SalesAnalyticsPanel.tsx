import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Filter, LineChart as LineChartIcon, PackageOpen, ShoppingCart, WalletCards } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const channelLabel: Record<string, string> = { whatsapp: "WhatsApp", store: "Loja", instagram: "Instagram", other: "Outros" };

export default function SalesAnalyticsPanel() {
  const [filters, setFilters] = useState<{ periodDays: 7 | 14 | 30; channel: "all" | "whatsapp" | "store" | "instagram" | "other"; status: "all" | "pending" | "confirmed" | "fulfilled" | "cancelled"; minTotalCents: string }>({ periodDays: 14, channel: "all", status: "all", minTotalCents: "" });
  const { data, isFetching } = trpc.dashboard.salesAnalytics.useQuery({
    periodDays: filters.periodDays,
    channel: filters.channel,
    status: filters.status,
    minTotalCents: filters.minTotalCents ? Math.round(Number(filters.minTotalCents.replace(",", ".")) * 100) : undefined,
  });
  const analytics = data;
  const hasData = Boolean(analytics?.daily.some((point) => point.orders > 0));
  const update = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => setFilters((current) => ({ ...current, [key]: value }));

  return <Card className="overflow-hidden border-0 bg-white shadow-[0_14px_45px_rgba(14,49,52,0.06)]">
    <CardHeader className="border-b border-[#edf2ef] pb-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#d8f1ed] text-[#168267]"><BarChart3 className="h-4 w-4" /></div><Badge className="border-0 bg-[#edf6e8] text-[#47713e]">Analytics operacional</Badge></div>
          <CardTitle className="text-[18px] text-[#183b43]">Vendas diárias, sem ponto cego.</CardTitle>
          <CardDescription className="mt-1 max-w-2xl">Filtre a fonte oficial por período, canal, status e valor mínimo. Resultados live permanecem isolados no tenant da sessão.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#f6f9f6] p-2">
          <Filter className="ml-1 h-3.5 w-3.5 text-[#6f8581]" />
          <select aria-label="Período" value={filters.periodDays} onChange={(event) => update("periodDays", Number(event.target.value) as 7 | 14 | 30)} className="h-8 rounded-lg border border-[#dce8e1] bg-white px-2 text-xs font-medium text-[#49625d]">
            <option value={7}>7 dias</option><option value={14}>14 dias</option><option value={30}>30 dias</option>
          </select>
          <select aria-label="Canal" value={filters.channel} onChange={(event) => update("channel", event.target.value as typeof filters.channel)} className="h-8 rounded-lg border border-[#dce8e1] bg-white px-2 text-xs font-medium text-[#49625d]">
            <option value="all">Todos os canais</option><option value="whatsapp">WhatsApp</option><option value="store">Loja</option><option value="instagram">Instagram</option><option value="other">Outros</option>
          </select>
          <select aria-label="Status" value={filters.status} onChange={(event) => update("status", event.target.value as typeof filters.status)} className="h-8 rounded-lg border border-[#dce8e1] bg-white px-2 text-xs font-medium text-[#49625d]">
            <option value="all">Não canceladas</option><option value="pending">Pendentes</option><option value="confirmed">Confirmadas</option><option value="fulfilled">Concluídas</option><option value="cancelled">Canceladas</option>
          </select>
          <input aria-label="Valor mínimo em reais" value={filters.minTotalCents} onChange={(event) => update("minTotalCents", event.target.value.replace(/[^\d,.]/g, ""))} inputMode="decimal" placeholder="Mín. R$" className="h-8 w-20 rounded-lg border border-[#dce8e1] bg-white px-2 text-xs font-medium text-[#49625d] outline-none focus:ring-2 focus:ring-[#c8f36b]" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-5 sm:p-6">
      {analytics?.mode === "demo" ? <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d6e4db] bg-[#fbfdf9] px-6 text-center"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf5e7] text-[#47713e]"><PackageOpen className="h-5 w-5" /></div><h3 className="mt-4 text-sm font-semibold text-[#183b43]">Analytics aguarda um tenant operacional.</h3><p className="mt-1 max-w-md text-xs leading-5 text-[#71847e]">O painel não preenche gráficos com dados fictícios. Quando vendas reais autorizadas existirem no tenant, os filtros e gráficos serão ativados automaticamente.</p></div> : !hasData ? <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d6e4db] bg-[#fbfdf9] px-6 text-center"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf5e7] text-[#47713e]"><LineChartIcon className="h-5 w-5" /></div><h3 className="mt-4 text-sm font-semibold text-[#183b43]">Nenhuma venda corresponde aos filtros.</h3><p className="mt-1 max-w-md text-xs leading-5 text-[#71847e]">Ajuste o período, o canal, o status ou o valor mínimo. Nenhum dado foi inventado para preencher esta visualização.</p></div> : <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={WalletCards} label="Receita filtrada" value={money(analytics?.metrics.revenueCents ?? 0)} />
          <Metric icon={ShoppingCart} label="Pedidos filtrados" value={(analytics?.metrics.orders ?? 0).toLocaleString("pt-BR")} />
          <Metric icon={LineChartIcon} label="Ticket médio" value={money(analytics?.metrics.averageTicketCents ?? 0)} />
          <Metric icon={BarChart3} label="Margem média" value={`${(analytics?.metrics.marginPercent ?? 0).toFixed(1).replace(".", ",")}%`} />
        </div>
        <div className="mt-6 grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
          <div className="rounded-2xl border border-[#edf2ef] p-4"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-[#183b43]">Receita por dia</p><p className="text-[11px] text-[#82938e]">Total confirmado pelo banco</p></div>{isFetching && <span className="text-[10px] font-semibold text-[#168267]">Atualizando…</span>}</div><div className="h-60"><ResponsiveContainer width="100%" height="100%"><AreaChart data={analytics?.daily ?? []} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}><defs><linearGradient id="sfpRevenue" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#77d7c5" stopOpacity={0.45}/><stop offset="95%" stopColor="#77d7c5" stopOpacity={0.03}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf2ef"/><XAxis dataKey="label" tick={{ fontSize: 10, fill: "#82938e" }} tickLine={false} axisLine={false} minTickGap={22}/><YAxis tickFormatter={(value) => `R$${Math.round(Number(value) / 100)}`} tick={{ fontSize: 10, fill: "#82938e" }} tickLine={false} axisLine={false} width={42}/><Tooltip formatter={(value: number) => money(value)} labelStyle={{ color: "#183b43" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2ebe5", fontSize: 12 }}/><Area type="monotone" dataKey="revenueCents" stroke="#168267" fill="url(#sfpRevenue)" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div></div>
          <div className="rounded-2xl border border-[#edf2ef] p-4"><div className="mb-4"><p className="text-sm font-semibold text-[#183b43]">Mix por canal</p><p className="text-[11px] text-[#82938e]">Receita dos canais filtrados</p></div><div className="h-60"><ResponsiveContainer width="100%" height="100%"><BarChart data={(analytics?.channels ?? []).map((row) => ({ ...row, label: channelLabel[row.channel] ?? row.channel }))} margin={{ top: 10, right: 5, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="#edf2ef"/><XAxis dataKey="label" tick={{ fontSize: 10, fill: "#82938e" }} tickLine={false} axisLine={false}/><YAxis tickFormatter={(value) => `R$${Math.round(Number(value) / 100)}`} tick={{ fontSize: 10, fill: "#82938e" }} tickLine={false} axisLine={false} width={42}/><Tooltip formatter={(value: number) => money(value)} labelStyle={{ color: "#183b43" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2ebe5", fontSize: 12 }}/><Bar dataKey="revenueCents" radius={[7, 7, 0, 0]} fill="#c8f36b"/></BarChart></ResponsiveContainer></div></div>
        </div>
      </>}
    </CardContent>
  </Card>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: string }) {
  return <div className="rounded-2xl bg-[#f7faf6] p-3.5"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#81918d]">{label}</p><Icon className="h-3.5 w-3.5 text-[#168267]" /></div><p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#183b43]">{value}</p></div>;
}
