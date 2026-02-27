export type Guid = string;

/**
 * Server uses DateOnly + NodaTime Instant. In JSON these are typically ISO strings.
 */
export type IsoDate = string;
export type IsoInstant = string;

/**
 * The backend uses LumenForgeServer.Common.StockUnitType.
 */
export type StockUnitType = string;