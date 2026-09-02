/**
 * De Crelan-positie, gewaardeerd als aantal eenheden maal de laatste slotkoers.
 *
 * Anders dan bij Baloise wordt hier niet per storting een aankoopkoers opgezocht: het
 * contract loopt sinds 2019 en reikt dus verder terug dan de koersreeks, terwijl het
 * totale aantal eenheden gewoon op het Crelan-overzicht staat. Zolang dat overzicht na de
 * fondswissel nog geen eenheden toont, wordt het aantal uit de overgedragen waarde afgeleid.
 */
export interface CrelanPosition {
  /** Bruto gestort over alle maandelijkse stortingen. */
  invested: number;
  units: number;
  /** Waar zolang het aantal eenheden uit de overgedragen waarde afgeleid is. */
  unitsAreEstimated: boolean;
  value: number;
  pnl: number;
  returnPercent: number | null;
  /**
   * Inleg gedeeld door eenheden. Sinds de fondswissel is dat geen aankoopkoers meer maar een
   * break-evenkoers: de inleg liep bij het oude fonds, de eenheden staan bij het nieuwe.
   */
  averageCostNav: number | null;
  /** Koers waarop gewaardeerd is. */
  nav: number;
  /** Datum van die koers, of `null` als ze uit de config-terugval komt. */
  navDateMs: number | null;
  /** Waar zolang de live koers niet geladen is en de laatst bekende koers geldt. */
  navIsFallback: boolean;
}
