import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { b2bReferencePrices, b2cReferencePrices } from "../shared/commercialReference";

type AuditItem = { description: string; package_or_weight?: string; parsed_price_cents: number | null; source_price?: string; status: string };
type CatalogRecord = {
  ordinal: number;
  referenceCode: string;
  sourceName: string;
  sourceType: "commercial_reference" | "docx_intake";
  channel: "b2c" | "b2b" | "unassigned";
  unitOrPackage: string;
  baseReferenceCents: number | null;
  cabralPlus18Cents: number | null;
  commissionRange: "2%–5%";
  trafficLight: "RED";
  status: "blocked";
  publication: "quarantine_only";
};

const root = new URL("..", import.meta.url).pathname;
const releaseDir = join(root, "release");
const sourceAuditPath = "/tmp/seafoods_cost_audit.json";
const csvEscape = (value: string | number | null) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
const brl = (cents: number | null) => cents === null ? "Não informado" : (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function main() {
  const audit = JSON.parse(await readFile(sourceAuditPath, "utf8")) as { items: AuditItem[] };
  const commercial = [
    ...b2cReferencePrices.map(([sourceName, baseReferenceCents]) => ({ sourceName, baseReferenceCents, channel: "b2c" as const, unitOrPackage: "kg" })),
    ...b2bReferencePrices.map(([sourceName, baseReferenceCents]) => ({ sourceName, baseReferenceCents, channel: "b2b" as const, unitOrPackage: "kg" })),
  ];
  const seen = new Set<string>();
  const documentRows = audit.items.filter((item) => {
    const key = normalize(item.description);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (commercial.length !== 30 || documentRows.length !== 121) throw new Error(`Esperado 30+121 referências; encontrado ${commercial.length}+${documentRows.length}.`);

  const records: CatalogRecord[] = [
    ...commercial.map((item) => ({ sourceName: item.sourceName, sourceType: "commercial_reference" as const, channel: item.channel, unitOrPackage: item.unitOrPackage, baseReferenceCents: item.baseReferenceCents })),
    ...documentRows.map((item) => ({ sourceName: item.description, sourceType: "docx_intake" as const, channel: "unassigned" as const, unitOrPackage: item.package_or_weight ?? "Não informado", baseReferenceCents: item.parsed_price_cents })),
  ].map((item, index) => {
    const ordinal = index + 1;
    return {
      ordinal,
      referenceCode: ordinal >= 123 ? `CABRAL-IMP-${String(ordinal).padStart(3, "0")}` : `SFP-REF-${String(ordinal).padStart(3, "0")}`,
      sourceName: item.sourceName,
      sourceType: item.sourceType,
      channel: item.channel,
      unitOrPackage: item.unitOrPackage,
      baseReferenceCents: item.baseReferenceCents,
      cabralPlus18Cents: item.baseReferenceCents === null ? null : Math.round(item.baseReferenceCents * 1.18),
      commissionRange: "2%–5%" as const,
      trafficLight: "RED" as const,
      status: "blocked" as const,
      publication: "quarantine_only" as const,
    };
  });
  if (records.length !== 151 || !records.some((row) => row.referenceCode === "CABRAL-IMP-123") || !records.some((row) => row.referenceCode === "CABRAL-IMP-151")) throw new Error("Manifesto 151/CABRAL-IMP inválido.");

  await mkdir(releaseDir, { recursive: true });
  const manifest = `/** Gerado do DOCX e referências fornecidas. Não é catálogo publicado nem fonte de preço/estoque. */\nexport const catalog151References = ${JSON.stringify(records, null, 2)} as const;\nexport const catalog151ReferenceCount = catalog151References.length;\n`;
  await writeFile(join(root, "shared/catalog151References.ts"), manifest);

  const csvHeaders = ["ordinal", "reference_code", "source_name", "source_type", "channel", "unit_or_package", "base_reference_brl", "cabral_plus_18_brl", "commission_range", "traffic_light", "status", "publication"];
  const csvRows = records.map((row) => [row.ordinal, row.referenceCode, row.sourceName, row.sourceType, row.channel, row.unitOrPackage, brl(row.baseReferenceCents), brl(row.cabralPlus18Cents), row.commissionRange, row.trafficLight, row.status, row.publication].map(csvEscape).join(","));
  await writeFile(join(releaseDir, "CATALOGO_151_REFERENCIAS_COMPLETO.csv"), `\uFEFF${csvHeaders.join(",")}\n${csvRows.join("\n")}\n`);

  const htmlShell = (title: string, body: string) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;background:#f5f7f3;color:#13313a;font:16px Inter,Arial,sans-serif}main{max-width:960px;margin:48px auto;padding:0 24px}.flag{display:inline-block;padding:7px 11px;border-radius:99px;background:#ffe1df;color:#a1342b;font-weight:700;font-size:12px;letter-spacing:.08em}.card{margin-top:22px;padding:24px;border-radius:20px;background:#fff;box-shadow:0 10px 35px #173c4812}h1{font-size:36px;margin:18px 0 10px}h2{font-size:20px;margin-top:0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.metric{padding:16px;border-radius:14px;background:#f7faf6}.metric b{display:block;font-size:23px;margin:8px 0}table{border-collapse:collapse;width:100%;font-size:13px}th,td{padding:10px;border-bottom:1px solid #e7eeea;text-align:left}.muted{color:#71847e;line-height:1.6}@media(max-width:640px){.grid{grid-template-columns:1fr}}</style></head><body><main>${body}</main></body></html>`;
  const totals = { b2c: records.filter((row) => row.channel === "b2c").length, b2b: records.filter((row) => row.channel === "b2b").length, unassigned: records.filter((row) => row.channel === "unassigned").length, cabralCodes: records.filter((row) => row.referenceCode.startsWith("CABRAL-IMP-")).length };
  await writeFile(join(releaseDir, "SFP-OS-1.2-COMMERCE-V2-PRODUCTION-FINAL.html"), htmlShell("SFP-OS 1.2 — Release Candidate", `<span class="flag">STAGING ATIVO · PRODUÇÃO BLOQUEADA</span><h1>Seafoods Premium Commerce V2</h1><p class="muted">Artefato consolidado da release candidate. O runtime de staging permite persistência técnica, mas o catálogo comercial continua em quarentena RED e nenhum item é publicável ou vendável sem aprovação.</p><section class="card"><div class="grid"><div class="metric">Referências bloqueadas<b>151</b>quarentena RED</div><div class="metric">IDs Cabral<b>29</b>CABRAL-IMP-123…151</div><div class="metric">Persistência<b>Staging</b>catalog guard ativo</div></div></section><section class="card"><h2>Estado de catálogo</h2><table><tr><th>Canal</th><th>Itens</th><th>Status</th></tr><tr><td>B2C</td><td>${totals.b2c}</td><td>RED / blocked</td></tr><tr><td>B2B</td><td>${totals.b2b}</td><td>RED / blocked</td></tr><tr><td>Documental sem canal</td><td>${totals.unassigned}</td><td>RED / blocked</td></tr></table></section><p class="muted">Este HTML não publica catálogo, não movimenta estoque e não representa autorização de venda. Consulte o dashboard staging para a aplicação interativa.</p>`));
  await writeFile(join(releaseDir, "SFP-CONTROL-TOWER-RECEITA-PRODUCTION-FINAL.html"), htmlShell("SFP Control Tower — Release Candidate", `<span class="flag">STAGING ATIVO · SEM RECEITA REAL</span><h1>Control Tower — Receita Cabral</h1><p class="muted">Separação financeira implementada para impedir que valor representado seja confundido com receita Seafoods.</p><section class="card"><div class="grid"><div class="metric">Valor representado<b>Separado</b>não é receita própria</div><div class="metric">Margem adicional<b>Projetada</b>reconhece somente em evento válido</div><div class="metric">Comissão<b>2%–5%</b>esperada e recebida separadas</div></div></section><section class="card"><h2>Controle de staging</h2><p class="muted">A fixture de 5 kg valida +18% e desconto máximo de 10% no dashboard sem criar pedido, alterar estoque, confirmar pagamento, disparar WhatsApp ou reconhecer receita. A ativação real requer contrato Cabral, tabela vigente, catálogo aprovado e evidência de recebimento.</p></section>`));
  await writeFile(join(releaseDir, "README_RELEASE_CANDIDATE.md"), `# Seafoods Premium — Release Candidate\n\nOs HTMLs e CSV são artefatos de staging e auditoria, não páginas publicadas. O CSV contém 151 referências RED; CABRAL-IMP-123 a CABRAL-IMP-151 identificam 29 referências existentes, sem adicionar linhas ou inventar preços.\n`);
  console.log(JSON.stringify({ records: records.length, cabralImported: totals.cabralCodes, ...totals }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
