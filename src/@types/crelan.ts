/**
 * De Crelan-positie, gewaardeerd als aantal eenheden maal de laatste slotkoers.
 *
 * Anders dan bij Baloise wordt hier niet per storting een aankoopkoers opgezocht: het
 * contract loopt sinds 2019 en reikt dus verder terug dan de koersreeks, terwijl het
 * totale aantal eenheden gewoon op het Crelan-overzicht staat.
 */
export interface CrelanPosition {
  /** Bruto gestort over alle maandelijkse stortingen. */
  invested: number;
  units: number;
  value: number;
  pnl: number;
  returnPercent: number | null;
  /** Inleg gedeeld door eenheden: je gemiddelde aankoopkoers. */
  averageCostNav: number | null;
  /** Koers waarop gewaardeerd is. */
  nav: number;
  /** Datum van die koers, of `null` als ze uit de config-terugval komt. */
  navDateMs: number | null;
  /** Waar zolang de live koers niet geladen is en de laatst bekende koers geldt. */
  navIsFallback: boolean;
}
