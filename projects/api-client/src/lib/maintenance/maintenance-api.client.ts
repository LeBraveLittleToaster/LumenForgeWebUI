import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MAINTENANCE_API_BASE_URL } from '../core/tokens';
import { Guid } from '../core/common';
import { toHttpParams } from './http-params';
import { MaintenanceQueryDto } from './models/query';
import {
  CreateMaintenanceJobDto,
  CreateMaintenanceBacklogDto,
  CreateMaintenanceStatusDto,
  UpdateMaintenanceJobDto,
  UpdateMaintenanceBacklogDto,
  UpdateMaintenanceStatusDto,
} from './models/dtos';
import { ListView, MaintenanceBacklogView, MaintenanceJobView, MaintenanceStatusView, MaintenanceTaskView } from './models/views';

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

  // -------------------------
  // Jobs (api/v1/maintenance/jobs)
  // -------------------------
  createJob(dto: CreateMaintenanceJobDto): Observable<MaintenanceJobView> {
    return this.http.put<MaintenanceJobView>(this.url('/api/v1/maintenance/jobs'), dto);
  }

  getJob(jobGuid: Guid, include?: string): Observable<MaintenanceJobView> {
    const query = include ? `?include=${encodeURIComponent(include)}` : '';
    return this.http.get<MaintenanceJobView>(this.url(`/api/v1/maintenance/jobs/${jobGuid}${query}`));
  }

  listJobs(query: MaintenanceQueryDto = {}): Observable<ListView<MaintenanceJobView>> {
    return this.http.get<ListView<MaintenanceJobView>>(
      this.url('/api/v1/maintenance/jobs'),
      {
        params: toHttpParams({
          search: query.search ?? undefined,
          limit: query.limit,
          offset: query.offset,
          status: query.status ?? undefined,
          unresolvedOnly: query.unresolvedOnly,
        }),
      }
    );
  }

  updateJob(jobGuid: Guid, dto: UpdateMaintenanceJobDto): Observable<MaintenanceJobView> {
    return this.http.patch<MaintenanceJobView>(this.url(`/api/v1/maintenance/jobs/${jobGuid}`), dto);
  }

  deleteJob(jobGuid: Guid): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/maintenance/jobs/${jobGuid}`));
  }

  listJobTasks(jobGuid: Guid, query: MaintenanceQueryDto = {}): Observable<ListView<MaintenanceTaskView>> {
    return this.http.get<ListView<MaintenanceTaskView>>(
      this.url(`/api/v1/maintenance/jobs/${jobGuid}/tasks`),
      {
        params: toHttpParams({
          limit: query.limit,
          offset: query.offset,
        }),
      }
    );
  }
}
