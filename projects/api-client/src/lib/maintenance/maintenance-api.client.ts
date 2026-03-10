import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MAINTENANCE_API_BASE_URL } from '../core/tokens';
import { Guid } from '../core/common';
import { toHttpParams } from './http-params';
import { MaintenanceQueryDto } from './models/query';
import {
  CreateMaintenanceBacklogDto,
  CreateMaintenanceStatusDto,
  UpdateMaintenanceBacklogDto,
  UpdateMaintenanceStatusDto,
} from './models/dtos';
import { ListView, MaintenanceBacklogView, MaintenanceStatusView } from './models/views';

@Injectable({ providedIn: 'root' })
export class MaintenanceApiClient {
  constructor(
    private readonly http: HttpClient,
    @Inject(MAINTENANCE_API_BASE_URL) private readonly baseUrl: string
  ) {}

  private url(path: string): string {
    const b = this.baseUrl?.replace(/\/+$/, '') ?? '';
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${b}${p}`;
  }

  // -------------------------
  // Backlog statuses (api/v1/maintenance/statuses)
  // -------------------------
  listStatuses(query: MaintenanceQueryDto = {}): Observable<MaintenanceStatusView[]> {
    return this.http.get<MaintenanceStatusView[]>(
      this.url('/api/v1/maintenance/statuses'),
      {
        params: toHttpParams({
          search: query.search ?? undefined,
          limit: query.limit,
          offset: query.offset,
          status_uuid: query.statusUuid ?? undefined,
          unresolved_only: query.unresolvedOnly,
        }),
      }
    );
  }

  getStatus(uuid: Guid): Observable<MaintenanceStatusView> {
    return this.http.get<MaintenanceStatusView>(this.url(`/api/v1/maintenance/statuses/${uuid}`));
  }

  createStatus(dto: CreateMaintenanceStatusDto): Observable<MaintenanceStatusView> {
    return this.http.put<MaintenanceStatusView>(this.url('/api/v1/maintenance/statuses'), dto);
  }

  updateStatus(uuid: Guid, dto: UpdateMaintenanceStatusDto): Observable<MaintenanceStatusView> {
    return this.http.patch<MaintenanceStatusView>(this.url(`/api/v1/maintenance/statuses/${uuid}`), dto);
  }

  deleteStatus(uuid: Guid): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/maintenance/statuses/${uuid}`));
  }

  // -------------------------
  // Backlog entries (api/v1/maintenance/backlogs)
  // -------------------------
  listBacklogs(query: MaintenanceQueryDto = {}): Observable<ListView<MaintenanceBacklogView>> {
    return this.http.get<ListView<MaintenanceBacklogView>>(
      this.url('/api/v1/maintenance/backlogs'),
      {
        params: toHttpParams({
          search: query.search ?? undefined,
          limit: query.limit,
          offset: query.offset,
          status_uuid: query.statusUuid ?? undefined,
          unresolved_only: query.unresolvedOnly,
        }),
      }
    );
  }

  getBacklog(uuid: Guid): Observable<MaintenanceBacklogView> {
    return this.http.get<MaintenanceBacklogView>(this.url(`/api/v1/maintenance/backlogs/${uuid}`));
  }

  getBacklogsByDevice(deviceUuid: Guid): Observable<MaintenanceBacklogView[]> {
    return this.http.get<MaintenanceBacklogView[]>(this.url(`/api/v1/maintenance/devices/${deviceUuid}/backlogs`));
  }

  createBacklog(dto: CreateMaintenanceBacklogDto): Observable<MaintenanceBacklogView> {
    return this.http.put<MaintenanceBacklogView>(this.url('/api/v1/maintenance/backlogs'), dto);
  }

  updateBacklog(uuid: Guid, dto: UpdateMaintenanceBacklogDto): Observable<MaintenanceBacklogView> {
    return this.http.patch<MaintenanceBacklogView>(this.url(`/api/v1/maintenance/backlogs/${uuid}`), dto);
  }

  deleteBacklog(uuid: Guid): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/maintenance/backlogs/${uuid}`));
  }
}
