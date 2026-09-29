import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowUpRight, BellRing, CheckCircle2, CircleDollarSign, PackageSearch, Repeat2, Truck } from "lucide-react";

const fallbackActions = [
  { key: "unpaid", label: "Pedidos sem pagamento", count: 2, tone: "warning" },
  { key: "delivery", label: "Entregas em risco", count: 1, tone: "danger" },
  { key: "repeat", label: "Clientes prontos para recompra", count: 4, tone: "good" },
  { key: "stock", label: "Estoque crítico", count: 7, tone: "warning" },
];

const iconFor = (key: string) => key === "unpaid" ? CircleDollarSign : key === "delivery" ? Truck : key === "repeat" ? Repeat2 : PackageSearch;

export default function ControlTower() {
  const { user } = useAuth();
  const { data, isLoading } = trpc.commerce.controlTower.useQuery(undefined, { enabled: Boolean(user) });
  const actions = data?.actions ?? fallbackActions;
  const total = actions.reduce((sum, action) => sum + action.count, 0);

  return <Card className="overflow-hidden border-0 bg-white shadow-[0_14px_45px_rgba(14,49,52,0.06)]"><CardHeader className="border-b border-[#edf2ef] pb-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><CardTitle className="text-[17px] text-[#183b43]">Control Tower</CardTitle><Badge className="border-0 bg-[#fff0cf] text-[#946422]">{data?.mode === "live" ? "ao vivo" : "demo"}</Badge></div><CardDescription className="mt-1">O que precisa de ação agora — não um dashboard decorativo.</CardDescription></div><div className="flex items-center gap-2 text-xs font-semibold text-[#81918d]"><BellRing className="h-4 w-4 text-[#168267]" /> {isLoading ? "Lendo sinais..." : `${total} sinais`}</div></div></CardHeader><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">{actions.map((action) => { const Icon = iconFor(action.key); const danger = action.tone === "danger"; const good = action.tone === "good"; return <div key={action.key} className={`rounded-2xl border p-4 ${danger ? "border-[#ffd9d4] bg-[#fff7f4]" : good ? "border-[#d7ecd7] bg-[#f7fbf5]" : "border-[#f4e4bd] bg-[#fffcf4]"}`}><div className="flex items-start justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${danger ? "bg-[#ffe1df] text-[#b74138]" : good ? "bg-[#daf4e9] text-[#187254]" : "bg-[#fff0cf] text-[#946422]"}`}><Icon className="h-4 w-4" /></div>{action.count === 0 ? <CheckCircle2 className="h-4 w-4 text-[#4c9c65]" /> : <AlertTriangle className={`h-4 w-4 ${danger ? "text-[#b74138]" : "text-[#bd812e]"}`} />}</div><p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#183b43]">{action.count.toString().padStart(2, "0")}</p><p className="mt-1 text-xs font-semibold leading-5 text-[#5f746d]">{action.label}</p><button className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#168267]" onClick={() => undefined}>Abrir fila <ArrowUpRight className="h-3 w-3" /></button></div>; })}</CardContent></Card>;
}
