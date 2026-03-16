export interface CatalogueListQueryDto {
  /** default 50; range 1..200 */
  limit?: number;
  /** default 0 */
  offset?: number;
  /** max length 128 */
  search?: string | null;
  publishedOnly?: boolean | null;
}

export interface CatalogueItemQueryDto {
  includeUnpublished?: boolean | null;
}