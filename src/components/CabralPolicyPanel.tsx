import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Building2, CircleAlert, Scale, ShieldCheck } from "lucide-react";

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CabralPolicyPanel() {
  const { data } = trpc.dashboard.cabralPolicy.useQuery();
  if (!data) return null;
  return <Card className="overflow-hidden border-0 bg-white shadow-[0_14px_45px_rgba(14,49,52,0.06)]">
    <CardHeader className="border-b border-[#edf2ef] bg-[#fbfdf9] pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#102c36] text-[#c8f36b]"><Building2 className="h-4 w-4" /></div><Badge className="border-0 bg-[#e8f2fb] text-[#3c688a]">B2B · Representações</Badge></div>
          <CardTitle className="text-[18px] text-[#183b43]">Representação comercial com receita separada.</CardTitle>
          <CardDescription className="mt-1 max-w-2xl">Operação de representação comercial segregada da Seafoods Premium, com negociação somente dentro das autorizações registradas.</CardDescription>
        </div>
        <Badge className="w-fit border-0 bg-[#fff0cf] text-[#946422]"><CircleAlert className="mr-1 h-3.5 w-3.5" /> Referência bloqueada</Badge>
      </div>
    </CardHeader>
    <CardContent className="p-5 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Term label="Acréscimo B2B" value={`${data.markupPercent}%`} detail="sobre a tabela" />
        <Term label="Desconto máximo" value={`${data.maxDiscountPercent}%`} detail="mediante aprovação" />
        <Term label="Pacote atacado" value={`${data.packageWeightKg.min}–${data.packageWeightKg.max} kg`} detail="fechado" />
        <Term label="Comissão" value={`${data.commissionPercent.min}–${data.commissionPercent.max}%`} detail="termos da representação" />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e4ece7] p-4"><div className="flex items-center gap-2"><Scale className="h-4 w-4 text-[#168267]" /><p className="text-sm font-semibold text-[#183b43]">Mecânica de preço</p></div><div className="mt-3 space-y-2 text-xs text-[#5f756e]"><Row label="Tabela" value={money(10_000)} /><Row label="+ 18%" value={money(1_800)} /><Row label="Preço referência" value={money(11_800)} /><Row label="Desconto 5%" value={`− ${money(590)}`} /><Row label="Preço final" value={money(11_210)} strong /><Row label="Acima da tabela" value={money(1_210)} strong /></div><p className="mt-3 text-[10px] leading-4 text-[#8a9b96]">Exemplo auditável do briefing; não é cotação nem preço publicado.</p></div>
        <div className="rounded-2xl bg-[#102c36] p-4 text-white"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#c8f36b]" /><p className="text-sm font-semibold">Regra de reconhecimento</p></div><p className="mt-3 text-xs leading-5 text-white/65">O valor representado não entra como receita própria Seafoods. O painel deve registrar separadamente margem adicional, comissão esperada/recebida e valor representado.</p><div className="mt-4 border-t border-white/10 pt-3 text-[10px] text-[#c8f36b]">Nenhum valor é liberado sem catálogo, autorização e evidência.</div></div>
      </div>
    </CardContent>
  </Card>;
}

function Term({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="rounded-2xl bg-[#f7faf6] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#81918d]">{label}</p><p className="mt-2 text-xl font-semibold text-[#183b43]">{value}</p><p className="mt-1 text-[10px] text-[#8b9b96]">{detail}</p></div>; }
function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <div className={`flex justify-between border-b border-[#edf2ef] pb-2 last:border-0 last:pb-0 ${strong ? "font-bold text-[#183b43]" : ""}`}><span>{label}</span><span>{value}</span></div>; }
