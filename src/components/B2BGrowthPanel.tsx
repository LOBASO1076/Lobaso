import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BadgeDollarSign, Ban, Building2, CircleAlert, FileCheck2, MessageCircleMore, ShieldCheck, UsersRound } from "lucide-react";

const money = (cents: number, decimals = 0) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export default function B2BGrowthPanel() {
  const { data } = trpc.dashboard.b2bGrowthTargets.useQuery();
  if (!data) return null;
  const cards = [
    ["Meta representada", money(data.targets.dailyRevenueCents), "4 pedidos de R$ 1.250", Building2, "bg-[#e8f2fb] text-[#3c688a]"],
    ["Leads / dia", String(data.funnel.plannedLeadsPerDay), "com funil 30% → 25%", UsersRound, "bg-[#edf6e8] text-[#47713e]"],
    ["CAC implícito", money(data.acquisition.plannedCacCents, 2), `${data.acquisition.cacShareOfTicketPercent.toFixed(1).replace(".", ",")}% do ticket`, BadgeDollarSign, "bg-[#fff0df] text-[#9d6334]"],
  ] as const;
  return <Card className="overflow-hidden border-0 bg-white shadow-[0_14px_45px_rgba(14,49,52,0.06)]">
    <CardHeader className="border-b border-[#edf2ef] bg-[#fbfdf9] pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#102c36] text-[#c8f36b]"><Building2 className="h-4 w-4" /></div><Badge className="border-0 bg-[#e8f2fb] text-[#3c688a]">Seafoods Brazil B2B</Badge></div>
          <CardTitle className="text-[18px] text-[#183b43]">Aquisição B2B: crescimento com limite financeiro.</CardTitle>
          <CardDescription className="mt-1 max-w-2xl">Meta de valor representado e funil de aquisição para DF. Os valores são premissas de teste; não representam campanhas ativas, gasto aprovado, receita própria ou resultado realizado.</CardDescription>
        </div>
        <Badge className="w-fit border-0 bg-[#fff0cf] text-[#946422]"><CircleAlert className="mr-1 h-3.5 w-3.5" /> Gate de contribuição</Badge>
      </div>
    </CardHeader>
    <CardContent className="p-5 sm:p-6">
      <div className="grid gap-3 md:grid-cols-3">{cards.map(([label, value, detail, Icon, tone]) => <div key={label} className="rounded-2xl bg-[#f7faf6] p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#81918d]">{label}</p><div className={`flex h-8 w-8 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></div></div><p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[#183b43]">{value}</p><p className="mt-1 text-[10px] text-[#8b9b96]">{detail}</p></div>)}</div>
      <div className="mt-5 rounded-2xl border border-[#e4ece7] bg-[#fbfdf9] p-4"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#168267]" /><p className="text-sm font-semibold text-[#183b43]">Política B2B · Representações</p></div><p className="mt-2 text-xs leading-5 text-[#71847e]">Pacotes fechados de 5–6 kg. A Representações fornece, fatura, recebe e executa fulfillment; a Seafoods controla oportunidade, margem adicional e comissão. O valor representado não é receita própria.</p></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-[#e4ece7] p-4"><div className="flex items-center gap-2"><MessageCircleMore className="h-4 w-4 text-[#168267]" /><p className="text-sm font-semibold text-[#183b43]">Ritmo do funil</p></div><div className="mt-4 grid gap-2 sm:grid-cols-3"><Metric label="Lead → cotação" value={`${Math.round(data.funnel.leadToQuoteRate * 100)}%`} /><Metric label="Cotação → pedido" value={`${Math.round(data.funnel.quoteToOrderRate * 100)}%`} /><Metric label="CPL de teste" value={money(data.acquisition.targetCplCents, 2)} /></div><p className="mt-4 text-xs leading-5 text-[#71847e]">Com 54 leads/dia e CPL de {money(data.acquisition.targetCplCents, 2)}, o orçamento implícito é {money(data.acquisition.plannedDailyMediaCents, 2)}/dia. Antes de ativar mídia, registre margem de contribuição por pedido e defina o CAC máximo.</p></div>
        <div className="rounded-2xl bg-[#102c36] p-4 text-white"><div className="flex items-center gap-2"><Ban className="h-4 w-4 text-[#ffce76]" /><p className="text-sm font-semibold">Escala bloqueada até prova</p></div><p className="mt-3 text-xs leading-5 text-white/60">{data.gate.reason}</p><div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-[10px] text-[#c8f36b]"><FileCheck2 className="h-3.5 w-3.5" /> {data.gate.rule}</div></div>
      </div>
    </CardContent>
  </Card>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#f7faf6] p-3"><p className="text-[10px] uppercase tracking-[0.1em] text-[#81918d]">{label}</p><p className="mt-1 text-sm font-semibold text-[#183b43]">{value}</p></div>; }
