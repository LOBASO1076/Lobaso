export const b2bGrowthAssumptions = {
  dailyRevenueTargetCents: 500000,
  estimatedTicketCents: 125000,
  leadToQuoteRate: 0.30,
  quoteToOrderRate: 0.25,
  targetCplCents: 3500,
  daysPerMonth: 30,
} as const;

export function getB2bGrowthTargets() {
  const ordersPerDay = Math.ceil(b2bGrowthAssumptions.dailyRevenueTargetCents / b2bGrowthAssumptions.estimatedTicketCents);
  const ordersPerMonth = ordersPerDay * b2bGrowthAssumptions.daysPerMonth;
  const leadsPerDayExact = ordersPerDay / (b2bGrowthAssumptions.leadToQuoteRate * b2bGrowthAssumptions.quoteToOrderRate);
  const plannedLeadsPerDay = Math.ceil(leadsPerDayExact);
  const plannedDailyMediaCents = plannedLeadsPerDay * b2bGrowthAssumptions.targetCplCents;
  const plannedCacCents = Math.round(plannedDailyMediaCents / ordersPerDay);
  const cacShareOfTicketPercent = (plannedCacCents / b2bGrowthAssumptions.estimatedTicketCents) * 100;
  return {
    mode: "reference" as const,
    targets: {
      dailyRevenueCents: b2bGrowthAssumptions.dailyRevenueTargetCents,
      dailyRepresentedCents: b2bGrowthAssumptions.dailyRevenueTargetCents,
      monthlyRevenueCents: b2bGrowthAssumptions.dailyRevenueTargetCents * b2bGrowthAssumptions.daysPerMonth,
      monthlyRepresentedCents: b2bGrowthAssumptions.dailyRevenueTargetCents * b2bGrowthAssumptions.daysPerMonth,
      estimatedTicketCents: b2bGrowthAssumptions.estimatedTicketCents,
      ordersPerDay,
      ordersPerMonth,
    },
    funnel: {
      leadToQuoteRate: b2bGrowthAssumptions.leadToQuoteRate,
      quoteToOrderRate: b2bGrowthAssumptions.quoteToOrderRate,
      leadsPerDayExact,
      plannedLeadsPerDay,
    },
    acquisition: {
      targetCplCents: b2bGrowthAssumptions.targetCplCents,
      plannedDailyMediaCents,
      plannedCacCents,
      cacShareOfTicketPercent,
    },
    gate: {
      status: "blocked_pending_contribution_margin" as const,
      reason: "Custo, frete, impostos, perdas, taxa de pagamento e margem de contribuição por pedido não foram reconciliados.",
      rule: "Não escalar mídia enquanto o CAC planejado não estiver abaixo da margem de contribuição comprovada por pedido.",
    },
  };
}
