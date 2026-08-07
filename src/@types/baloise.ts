/**
 * Eén premieperiode uit de ledger. Een periode loopt van de 13e tot de 13e van de
 * volgende maand; `paidOnIso` is de dag waarop je effectief gestort hebt en kan dus
 * ruim naast de periodestart liggen.
 */
export interface BaloisePremium {
  /** Start dekkingsperiode (13e). */
  periodStartIso: string;
  /** Brutopremie zoals afgeschreven; de instapkost gaat hier nog af. */
  amount: number;
  /** Dag waarop de premie op de Baloise-rekening stond; `null` = nog open. */
  paidOnIso: string | null;
  /** Vastgeklikte aankoopkoers, zodra je die uit het jaarrapport van Baloise kent. */
  purchaseNavOverride?: number;
}

/** Eén premie uit de ledger, doorgerekend tegen de laatste slotkoers. */
export interface BaloisePremiumRow {
  periodStartIso: string;
  /** Einde dekkingsperiode: de 13e van de volgende maand. */
  periodEndIso: string;
  paidOnIso: string | null;
  isPaid: boolean;
  /** Brutobedrag dat je betaalde. */
  amount: number;
  entryCost: number;
  /** Wat er na instapkost effectief belegd is. */
  netInvested: number;
  /** Slotkoers op de betaaldag (of de laatste handelsdag ervóór). */
  navSameDay: number | null;
  /** Slotkoers op de eerste handelsdag ná de betaaldag. */
  navNextDay: number | null;
  /** Gemiddelde van `navSameDay` en `navNextDay`, of de override. */
  purchaseNav: number | null;
  /** Waar zolang `navNextDay` nog ontbreekt of de reeks te ver van de betaaldag ligt. */
  navIsApproximate: boolean;
  units: number;
  valueNow: number;
  /** Winst of verlies tegenover het brutobedrag, dus inclusief instapkost. */
  pnl: number;
  netReturnPercent: number | null;
  /** Brutorendement van het fonds sinds de instap, zonder kosten. */
  fundReturnPercent: number | null;
  daysHeld: number | null;
}

/** De volledige Baloise-positie, berekend uit de ledger en de fondsreeks. */
export interface BaloisePosition {
  premiums: BaloisePremiumRow[];
  /** Bruto betaald over alle afgeronde premies. */
  paidTotal: number;
  /** Premies die nog openstaan en dus nog niet belegd zijn. */
  openAmount: number;
  totalEntryCost: number;
  totalNetInvested: number;
  units: number;
  value: number;
  pnl: number;
  netReturnPercent: number | null;
  fundReturnPercent: number | null;
  /** Nettobelegd gedeeld door eenheden: je gemiddelde instapkoers. */
  averageCostNav: number | null;
  /** Laatste gepubliceerde dagslotkoers waarop gewaardeerd is. */
  closeNav: number | null;
  closeDateMs: number | null;
  bestPremium: BaloisePremiumRow | null;
  worstPremium: BaloisePremiumRow | null;
  /** Waar zodra de huidige premieperiode nog niet in de ledger staat. */
  hasMissingPeriod: boolean;
}
