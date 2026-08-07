import type { BaloisePremium } from '@/@types/baloise';
import type { InvestmentPosition, MonthlyInvestmentPlan } from '@/@types/investment';

export const TARGET_AT_40 = 100_000;
export const BIRTH_YEAR = 1994;
export const TARGET_AGE = 40;

export const START_YEAR = 2026;
export const END_YEAR = 2054;

export const INVESTMENT_POSITIONS: InvestmentPosition[] = [
  {
    name: 'Tourmaline Oil Corp',
    ticker: 'TOU.TO',
    amount: 10_000,
    shares: 250,
    dividendPerShare: 0.5,
    dividendFrequencyPerYear: 4,
    dividendReceived: 40,
  },
  { name: 'Ivanhoe Mines Ltd', ticker: 'IVN.TO', amount: 6_000, shares: 850 },
];

export const MONTHLY_INVESTMENT_PLANS: MonthlyInvestmentPlan[] = [
  {
    name: 'Amundi Funds China Equity A EUR Cap',
    isin: 'LU1882445569',
    monthlyAmount: 250,
    entryFeeRate: 0.025,
    exitFees: [
      { afterYears: 1, rate: 0.0618 },
      { afterYears: 3, rate: 0.0363 },
      { afterYears: 5, rate: 0.0312 },
    ],
    minimumHorizonYears: 10,
  },
  {
    name: 'Amundi Funds Global Equity A EUR (C)',
    isin: 'LU1883342377',
    monthlyAmount: 250,
    entryFeeRate: 0.025,
    exitFees: [
      { afterYears: 1, rate: 0.0664 },
      { afterYears: 3, rate: 0.0409 },
      { afterYears: 5, rate: 0.0359 },
    ],
    minimumHorizonYears: 10,
  },
];

export const CASH_RESERVE = 8_500;
export const INVESTMENT_FIRST_YEAR_MONTHS = 10; // mrt–dec
export const INVESTMENT_MONTHLY = 500;

export const CRELAN_PENSION_FUND_NAME = 'BNP Paribas B Pension Balanced Classic Cap';
export const CRELAN_PENSION_ISIN = 'BE0026480963';
export const CRELAN_RATE = 0.0261;

/** Fondseenheden volgens het Crelan-overzicht. */
export const CRELAN_UNITS = 33.463;
export const CRELAN_UNIT_DECIMALS = 3;

export const CRELAN_MONTHLY = 87.5;

/** Eerste maandelijkse storting. */
export const CRELAN_FIRST_DEPOSIT_ISO = '2019-12-06';

/**
 * Laatste storting. Er is fiscaal maar één pensioenspaarcontract per jaar mogelijk,
 * dus vanaf de start van Baloise (maart 2026) staat Crelan stil: geen nieuwe stortingen,
 * enkel nog rendement op wat er staat.
 */
export const CRELAN_LAST_DEPOSIT_ISO = '2026-02-16';

/**
 * Bruto gestort over de volledige looptijd. Dit is een reconstructie (75 × € 87,50) en geen
 * cijfer van het overzicht, want Crelan toont enkel de waarde en het aantal eenheden.
 *
 * Vermoedelijk staat het zo'n € 470 te laag: tegen de werkelijke fondskoersen kopen 75
 * stortingen van € 87,50 samen maar ~31,2 eenheden, terwijl er 33,463 op het overzicht
 * staan. Dat verschil wijst op een eenmalige inhaalstorting bij de opstart in december 2019.
 * Duikt het echte bedrag op een fiscaal attest (code 1361) op, vul het dan hier in. De
 * waarde van de positie verandert daar niet door — die hangt aan de eenheden — enkel de
 * winst en het rendement kloppen dan.
 */
export const CRELAN_INVESTED_TOTAL = 6_562.5;

/**
 * Terugval als de koers-API niets teruggeeft, zodat de projectie nooit op een laadtoestand
 * hoeft te wachten. Afgeleid uit het Crelan-overzicht: 8 239,59 / 33,463 = 246,23.
 */
export const CRELAN_LAST_KNOWN_NAV = 246.23;
export const CRELAN_LAST_KNOWN_NAV_DATE_ISO = '2026-08-06';

/** Morningstar-ID van het fonds; de Frankfurt-notering serveert wél een dagreeks. */
export const CRELAN_YAHOO_CHART_SYMBOL = '0P00000NCK.F';

export const CRELAN_YAHOO_QUOTE_URL = `https://finance.yahoo.com/quote/${encodeURIComponent(CRELAN_YAHOO_CHART_SYMBOL)}`;

/** Alleen de laatste koers telt: de stortingen zijn afgesloten, dus historiek is overbodig. */
export const CRELAN_YAHOO_CHART_RANGE = '1mo';

export const BALOISE_FUND_NAME = 'R-co Valor';
export const BALOISE_ISIN = 'FR0011253624';
export const BALOISE_RATE = 0.075;

/**
 * Yahoo Finance-symbool voor live NAV + historiek.
 * Voor R-co Valor C EUR geeft de Euronext Paris quote (`FR0011253624.PA`) alleen metadata
 * terug; de **Frankfurt/Xetra mutual-fund quote** `0P00017T6E.F` bevat wél een dagelijkse
 * tijdreeks die de chart-API kan serveren.
 */
export const BALOISE_YAHOO_CHART_SYMBOL = '0P00017T6E.F';

export const BALOISE_YAHOO_QUOTE_URL = `https://finance.yahoo.com/quote/${encodeURIComponent(BALOISE_YAHOO_CHART_SYMBOL)}`;

/**
 * Vijf jaar historiek. Bij `1y` zouden oudere stortingen na verloop van tijd buiten de
 * reeks vallen, waardoor hun aankoopkoers stilzwijgend naar de oudste beschikbare rij
 * zou klappen en het rendement zou wegdrijven.
 */
export const BALOISE_YAHOO_CHART_RANGE = '5y';

export const BALOISE_POLICY_NUMBER = '1C67741';

/** Aanvangsdatum polis (lokale kalenderdag). */
export const BALOISE_CONTRACT_START_ISO = '2026-03-13';

/** Poliseinde (lokale kalenderdag). */
export const BALOISE_CONTRACT_END_ISO = '2059-07-13';

/**
 * Instapkost op de periodieke premie (hoofdwaarborg exclusief taksen), per bijzondere
 * voorwaarden van polis 1C67741. Taksen zijn nul: pensioensparen is vrijgesteld van de
 * verzekeringstaks, dus dit is de enige aftrek vóór aankoop.
 */
export const BALOISE_ENTRY_COST_RATE = 0.02;

export const BALOISE_MONTHLY_2026 = 105;
export const BALOISE_MONTHLY_FROM_2027 = 87.5;
export const BALOISE_ANNUAL_CONTRIBUTION = BALOISE_MONTHLY_FROM_2027 * 12;

/** Eerste premieperiode van de polis: maart 2026, dus maandindex 2. */
export const BALOISE_FIRST_PERIOD_MONTH_INDEX = 2;

/** Tien maandpremies van €105 in 2026 (maart t/m december) = de maximale fiscale premie. */
export const BALOISE_FIRST_YEAR_INVESTED_TOTAL = (12 - BALOISE_FIRST_PERIOD_MONTH_INDEX) * BALOISE_MONTHLY_2026;

/**
 * Alle premieperiodes met hun werkelijke betaaldatum. Baloise levert enkel een jaarrapport,
 * dus dit is de enige administratie: vul elke maand één regel aan.
 *
 * Er is geen domiciliëring actief (het SEPA-mandaat is niet ondertekend), waardoor de
 * betaaldatum los staat van de periodestart. Een periode loopt van de 13e tot de 13e.
 */
export const BALOISE_PREMIUMS: readonly BaloisePremium[] = [
  { periodStartIso: '2026-03-13', amount: BALOISE_MONTHLY_2026, paidOnIso: '2026-03-31' },
  { periodStartIso: '2026-04-13', amount: BALOISE_MONTHLY_2026, paidOnIso: '2026-03-31' },
  { periodStartIso: '2026-05-13', amount: BALOISE_MONTHLY_2026, paidOnIso: '2026-05-29' },
  { periodStartIso: '2026-06-13', amount: BALOISE_MONTHLY_2026, paidOnIso: '2026-07-28' },
  { periodStartIso: '2026-07-13', amount: BALOISE_MONTHLY_2026, paidOnIso: null },
];

/** Bruto betaald over alle afgeronde premies. */
export const BALOISE_PAID_TOTAL = BALOISE_PREMIUMS.reduce((sum, p) => sum + (p.paidOnIso != null ? p.amount : 0), 0);

/** Premies die nog openstaan en dus nog niet belegd zijn. */
export const BALOISE_OPEN_TOTAL = BALOISE_PREMIUMS.reduce((sum, p) => sum + (p.paidOnIso == null ? p.amount : 0), 0);

export const BALOISE_FIRST_PERIOD_START_ISO = BALOISE_PREMIUMS[0]?.periodStartIso ?? BALOISE_CONTRACT_START_ISO;

export const BALOISE_LAST_PERIOD_START_ISO =
  BALOISE_PREMIUMS[BALOISE_PREMIUMS.length - 1]?.periodStartIso ?? BALOISE_CONTRACT_START_ISO;

/** Kalenderdag waarop een nieuwe premieperiode start. */
export const BALOISE_PERIOD_START_DAY = 13;

/** Binnen hoeveel dagen rond de betaaldatum een slotkoers nog als exact geldt. */
export const BALOISE_EXACT_NAV_WINDOW_DAYS = 5;

/** Decimalen waarmee fondseenheden getoond worden. */
export const BALOISE_UNIT_DECIMALS = 6;

export const CAD_TO_EUR = 0.67;

export const PENSION_RECAPTURE_RATE = 0.08;
export const INVESTMENT_TRANSACTION_FEE_RATE = 0.07;
export const CAPITAL_GAINS_TAX_RATE = 0.1;
export const CAPITAL_GAINS_TAX_THRESHOLD = 10_000;
