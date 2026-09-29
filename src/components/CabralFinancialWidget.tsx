import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BadgeDollarSign, Building2, CircleDollarSign, Landmark, Loader2, WalletCards } from "lucide-react";

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CabralFinancialWidget() {
  const { isAuthenticated } = useAuth();
  const query = trpc.dashboard.cabralMetrics.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 30_000 });

  if (!isAuthenticated) return <Card className="border border-dashed border-[#dce7e1] bg-[#fbfdf9]"><CardContent className="flex items-center gap-3 p-5"><Landmark className="h-5 w-5 text-[#168267]"/><p className="text-xs leading-5 text-[#71847e]">Entre na conta operacional para acompanhar valor representado, receita própria e comissões de Representações.</p></CardContent></Card>;
  if (query.isLoading || !query.data) return <Card className="border-0 bg-white shadow-[0_14px_45px_rgba(14,49,52,0.06)]"><CardContent className="flex items-center gap-3 p-5 text-sm text-[#71847e]"><Loader2 className="h-4 w-4 animate-spin"/> Carregando a separação financeira de Representações…</CardContent></Card>;

  const data = query.data;
  const cards = [
    { label: "Valor representado", value: money(data.representedValueCents), hint: "Representações • não é receita Seafoods", icon: Building2, tone: "bg-[#e8f2fb] text-[#3c688a]" },
    { label: "Receita própria reconhecida", value: money(data.seafoodsRecognizedRevenueCents), hint: `margem projetada: ${money(data.projectedAdditionalMarginCents)}`, icon: CircleDollarSign, tone: "bg-[#e9f6e8] text-[#28703a]" },
    { label: "Comissão pendente", value: money(data.commissionPendingCents), hint: `${money(data.commissionReceivedCents)} recebida`, icon: WalletCards, tone: "bg-[#fff0cf] text-[#946422]" },
  ];

  return <Card className="border-0 bg-white shadow-[0_14px_45px_rgba(14,49,52,0.06)]"><CardHeader className="border-b border-[#edf2ef] pb-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="mb-2 flex flex-wrap gap-2"><Badge className="border-0 bg-[#e8f2fb] text-[#3c688a]"><BadgeDollarSign className="mr-1 h-3.5 w-3.5"/> Representações — simulação de staging</Badge><Badge className="border-0 bg-[#ffe1df] text-[#b74138]">sem persistência comercial</Badge>{data.source === "fixture" && <Badge className="border-0 bg-[#fff0cf] text-[#946422]">fixture de teste</Badge>}</div><CardTitle className="text-[17px] text-[#183b43]">Receita própria × receita representada</CardTitle><CardDescription className="mt-1">Atualização a cada 30 segundos. Valor representado não compõe receita Seafoods; comissão entra somente após recebimento auditado.</CardDescription></div><div className="rounded-xl bg-[#f4f8f4] px-3 py-2 text-right"><p className="text-lg font-semibold text-[#183b43]">{data.totalTerms}</p><p className="text-[10px] uppercase tracking-[0.1em] text-[#81918d]">termos B2B</p></div></div></CardHeader><CardContent className="p-5"><div className="grid gap-3 lg:grid-cols-3">{cards.map(({ label, value, hint, icon: Icon, tone }) => <div key={label} className="rounded-2xl border border-[#e8eeea] bg-[#fbfdf9] p-4"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4"/></div><p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71847e]">{label}</p><p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#183b43]">{value}</p><p className="mt-1 text-[11px] leading-4 text-[#81918d]">{hint}</p></div>)}</div><div className="mt-4 flex flex-wrap gap-2 text-[11px]"><Badge className="border-0 bg-[#ffe1df] text-[#b74138]">{data.status.referenceBlocked} bloqueado(s)</Badge><Badge className="border-0 bg-[#fff0cf] text-[#946422]">{data.status.approved + data.status.invoiced} aprovado(s)/faturado(s)</Badge><Badge className="border-0 bg-[#daf4e9] text-[#187254]">{data.status.commissionReceived} comissão(ões) recebida(s)</Badge></div>{data.source === "fixture" && <p className="mt-4 rounded-xl bg-[#f7faf6] p-3 text-xs leading-5 text-[#71847e]">Cenário controlado: {data.fixtureLabel}. Ele exercita desconto e comissão sem criar pedido, alterar estoque ou reconhecer receita.</p>}{data.source === "persisted" && data.totalTerms === 0 && <p className="mt-4 rounded-xl bg-[#f7faf6] p-3 text-xs leading-5 text-[#71847e]">Não há termos de Representações persistidos neste tenant.</p>}</CardContent></Card>;
}
