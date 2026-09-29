export const CABRAL_MARKUP_PERCENT = 18;
export const CABRAL_MAX_DISCOUNT_PERCENT = 5;
export const CABRAL_MIN_PACKAGE_KG = 5;
export const CABRAL_MAX_PACKAGE_KG = 6;
export const CABRAL_MIN_COMMISSION_PERCENT = 2;
export const CABRAL_MAX_COMMISSION_PERCENT = 5;

export type B2BPolicyInput = {
  tableValueCents: number;
  discountPercent?: number;
  commissionPercent?: number;
  packageWeightKg: number;
};

export type B2BPolicyTerms = {
  model: "b2b_cabral_representation";
  tableValueCents: number;
  markupPercent: number;
  markupCents: number;
  commercialReferenceCents: number;
  discountPercent: number;
  discountCents: number;
  finalPriceCents: number;
  valueAboveTableCents: number;
  additionalMarginCents: number;
  commissionPercent: number;
  commissionExpectedCents: number;
  commissionReceivedCents: number;
  representedValueCents: number;
  seafoodsRecognizedRevenueCents: number;
  potentialSeafoodsEarningsCents: number;
  packageWeightKg: number;
  status: "reference_blocked";
};

const finiteMoney = (value: number, field: string) => {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${field} deve ser um valor inteiro não negativo em centavos.`);
  return value;
};

const finitePercent = (value: number, field: string) => {
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error(`${field} deve estar entre 0 e 100.`);
  return value;
};

export function validateCabralPackageWeight(packageWeightKg: number) {
  if (!Number.isFinite(packageWeightKg) || packageWeightKg < CABRAL_MIN_PACKAGE_KG || packageWeightKg > CABRAL_MAX_PACKAGE_KG) {
    throw new Error(`A operação de Representações exige pacote fechado entre ${CABRAL_MIN_PACKAGE_KG} e ${CABRAL_MAX_PACKAGE_KG} kg.`);
  }
  return packageWeightKg;
}

export function calculateCabralTerms(input: B2BPolicyInput): B2BPolicyTerms {
  const tableValueCents = finiteMoney(input.tableValueCents, "Valor da tabela");
  if (tableValueCents <= 0) throw new Error("Valor da tabela deve ser maior que zero.");
  const packageWeightKg = validateCabralPackageWeight(input.packageWeightKg);
  const discountPercent = finitePercent(input.discountPercent ?? 0, "Desconto");
  const commissionPercent = finitePercent(input.commissionPercent ?? CABRAL_MIN_COMMISSION_PERCENT, "Comissão");
  if (discountPercent > CABRAL_MAX_DISCOUNT_PERCENT) throw new Error(`O desconto máximo autorizado é ${CABRAL_MAX_DISCOUNT_PERCENT}%.`);
  if (commissionPercent < CABRAL_MIN_COMMISSION_PERCENT || commissionPercent > CABRAL_MAX_COMMISSION_PERCENT) {
    throw new Error(`A comissão deve estar entre ${CABRAL_MIN_COMMISSION_PERCENT}% e ${CABRAL_MAX_COMMISSION_PERCENT}%.`);
  }

  const markupCents = Math.round(tableValueCents * CABRAL_MARKUP_PERCENT / 100);
  const commercialReferenceCents = tableValueCents + markupCents;
  const discountCents = Math.round(commercialReferenceCents * discountPercent / 100);
  const finalPriceCents = commercialReferenceCents - discountCents;
  const valueAboveTableCents = finalPriceCents - tableValueCents;
  const additionalMarginCents = Math.max(0, valueAboveTableCents);
  const commissionExpectedCents = Math.round(tableValueCents * commissionPercent / 100);

  return {
    model: "b2b_cabral_representation",
    tableValueCents,
    markupPercent: CABRAL_MARKUP_PERCENT,
    markupCents,
    commercialReferenceCents,
    discountPercent,
    discountCents,
    finalPriceCents,
    valueAboveTableCents,
    additionalMarginCents,
    commissionPercent,
    commissionExpectedCents,
    commissionReceivedCents: 0,
    representedValueCents: tableValueCents,
    seafoodsRecognizedRevenueCents: additionalMarginCents,
    potentialSeafoodsEarningsCents: additionalMarginCents + commissionExpectedCents,
    packageWeightKg,
    status: "reference_blocked",
  };
}

export function getB2BPolicyReference() {
  return {
    model: "b2b_cabral_representation" as const,
    supplier: "Representações",
    representationResponsibilities: ["fornecimento", "faturamento", "recebimento", "logística", "prazos", "fulfillment"],
    seafoodsResponsibilities: ["prospecção", "apresentação", "negociação autorizada", "oportunidade", "relacionamento", "comissão", "margem adicional"],
    markupPercent: CABRAL_MARKUP_PERCENT,
    maxDiscountPercent: CABRAL_MAX_DISCOUNT_PERCENT,
    packageWeightKg: { min: CABRAL_MIN_PACKAGE_KG, max: CABRAL_MAX_PACKAGE_KG },
    commissionPercent: { min: CABRAL_MIN_COMMISSION_PERCENT, max: CABRAL_MAX_COMMISSION_PERCENT },
    revenueRule: "O faturamento representado não é receita própria Seafoods; receita Seafoods é margem adicional mais comissão esperada/recebida.",
    status: "reference_blocked" as const,
  };
}
