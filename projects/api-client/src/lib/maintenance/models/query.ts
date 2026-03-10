import { Guid } from '../../core/common';

export interface MaintenanceQueryDto {
  /** default 50; range 1..200 */
  limit?: number;
  /** default 0 */
  offset?: number;
  /** max length 128 */
  search?: string | null;
  /** optional filter for backlog/status queries */
  statusUuid?: Guid | null;
  /** when true, only unresolved backlogs are returned */
  unresolvedOnly?: boolean;
}
