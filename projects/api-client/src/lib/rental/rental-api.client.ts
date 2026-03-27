import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Guid } from '../core/common';
import { toHttpParams } from '../core/http-params';
import { RENTAL_API_BASE_URL } from '../core/tokens';
import { PaginatedList } from '../inventory/models/views';
import {
  CreateRentalFormInput,
  CreateRentalDto,
  ApproveItemsDto,
  ApproveRequestDto,
  ApproveExtensionDto,
  AssignItemsDto,
  CancelRentalDto,
  CompleteRentalDto,
  CreateMaintenanceJobsDto,
  GenerateInvoiceDto,
  GenerateChecklistDto,
  GenerateReportDto,
  RecordDamagesDto,
  RecordPaymentDto,
  RecordPickupDto,
  RecordReturnDto,
  RejectExtensionDto,
  RejectItemsDto,
  RejectRequestDto,
  RemoveItemsDto,
  RequestExtensionDto,
  ScanChecklistDto,
  ScrapRentalDto,
  SignChecklistDto,
} from './models/dtos';
import {
  QuestionView,
  RentalActionView,
  RentalActionLogView,
  RentalProcessView,
  RentalProcessSummaryView,
  ChecklistView,
  ActionResultView,
  CreateRentalResultView,
  GenerateChecklistResultView,
  GenerateInvoiceResultView,
  RequestExtensionResultView,
  CreateMaintenanceJobsResultView,
  GenerateReportResultView,
  RentalOverviewDto,
  RentalRecentActivityDto,
} from './models/views';
import {
  RentalQueryDto,
  RentalHistoryQueryDto,
  RentalInclude,
} from './models/query';

@Injectable({ providedIn: 'root' })
export class RentalApiClient {
  constructor(
    private readonly http: HttpClient,
    @Inject(RENTAL_API_BASE_URL) private readonly baseUrl: string
  ) {}

  private url(path: string): string {
    const b = this.baseUrl?.replace(/\/+$/, '') ?? '';
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${b}${p}`;
  }

  private actionUrl(processGuid: Guid, action: string): string {
    return this.url(`/api/v1/rentals/actions/${processGuid}/${action}`);
  }

  private callAction<TResponse>(processGuid: Guid, action: string, dto?: object): Observable<TResponse> {
    return this.http.post<TResponse>(this.actionUrl(processGuid, action), dto ?? {});
  }

  private normalizeAvailableActions(response: unknown): RentalActionView[] {
    if (Array.isArray(response)) {
      return response as RentalActionView[];
    }

    if (response && typeof response === 'object') {
      const record = response as Record<string, unknown>;
      const availableActions = record['available_actions'];
      if (Array.isArray(availableActions)) {
        return availableActions as RentalActionView[];
      }

      const actions = record['actions'];
      if (Array.isArray(actions)) {
        return actions as RentalActionView[];
      }
    }

    return [];
  }

  private normalizeHistory(response: unknown): PaginatedList<RentalActionLogView> {
    if (response && typeof response === 'object') {
      const record = response as Record<string, unknown>;
      if (Array.isArray(record['list']) && typeof record['total'] === 'number') {
        return response as PaginatedList<RentalActionLogView>;
      }

      if (Array.isArray(record['history'])) {
        const history = record['history'] as RentalActionLogView[];
        return { list: history, total: history.length };
      }
    }

    return { list: [], total: 0 };
  }

  private normalizeQuestions(response: unknown): QuestionView[] {
    if (!response || typeof response !== 'object') {
      return [];
    }

    const record = response as Record<string, unknown>;
    const questions = record['questions'];
    return Array.isArray(questions) ? questions as QuestionView[] : [];
  }

  // =========================================================================
  // Rental Questions
  // =========================================================================

  /** Loads the question set for creating a rental request. */
  listQuestions(input: CreateRentalFormInput): Observable<QuestionView[]> {
    return this.http.post<unknown>(
      this.url('/api/v1/rentals/questions'),
      input,
    ).pipe(map(response => this.normalizeQuestions(response)));
  }

  // =========================================================================
  // Rental Processes - Overview
  // =========================================================================

  listRentals(query: RentalQueryDto = {}): Observable<PaginatedList<RentalProcessSummaryView>> {
    return this.http.get<PaginatedList<RentalProcessSummaryView>>(
      this.url('/api/v1/rentals'),
      {
        params: toHttpParams({
          Search: query.search ?? undefined,
          Limit: query.limit,
          Offset: query.offset,
          Stages: query.stages?.join(',') ?? undefined,
          SortBy: query.sortBy,
          Ascending: query.ascending,
          CreatedAfter: query.createdAfter ?? undefined,
          CreatedBefore: query.createdBefore ?? undefined,
          OwnerKcId: query.ownerKcId ?? undefined,
        }),
      }
    );
  }

  listMyRentals(query: RentalQueryDto = {}): Observable<PaginatedList<RentalProcessSummaryView>> {
    return this.http.get<PaginatedList<RentalProcessSummaryView>>(
      this.url('/api/v1/rentals/my'),
      {
        params: toHttpParams({
          Search: query.search ?? undefined,
          Limit: query.limit,
          Offset: query.offset,
          Stages: query.stages?.join(',') ?? undefined,
          SortBy: query.sortBy,
          Ascending: query.ascending,
          CreatedAfter: query.createdAfter ?? undefined,
          CreatedBefore: query.createdBefore ?? undefined,
          OwnerKcId: query.ownerKcId ?? undefined,
        }),
      }
    );
  }

  getRental(processGuid: Guid, include?: RentalInclude[]): Observable<RentalProcessView> {
    return this.http.get<RentalProcessView>(
      this.url(`/api/v1/rentals/${processGuid}`),
      { params: toHttpParams({ include: include?.join(',') ?? undefined }) }
    );
  }

  listRentalHistory(processGuid: Guid, query: RentalHistoryQueryDto = {}): Observable<PaginatedList<RentalActionLogView>> {
    return this.http.get<unknown>(
      this.url(`/api/v1/rentals/${processGuid}/history`),
      {
        params: toHttpParams({
          limit: query.limit,
          offset: query.offset,
        }),
      }
    ).pipe(map(response => this.normalizeHistory(response)));
  }

  listAvailableActions(processGuid: Guid): Observable<RentalActionView[]> {
    return this.http.get<unknown>(this.url(`/api/v1/rentals/actions/${processGuid}/available`)).pipe(
      map(response => this.normalizeAvailableActions(response))
    );
  }

  // =========================================================================
  // Rental Actions
  // =========================================================================

  createRental(dto: CreateRentalDto): Observable<CreateRentalResultView> {
    return this.http.post<CreateRentalResultView>(this.url('/api/v1/rentals/actions/create'), dto);
  }

  approveRequest(processGuid: Guid, dto: ApproveRequestDto = {}): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'approve-request', dto);
  }

  rejectRequest(processGuid: Guid, dto: RejectRequestDto): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'reject-request', dto);
  }

  assignItems(processGuid: Guid, dto: AssignItemsDto): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'assign-items', dto);
  }

  removeItems(processGuid: Guid, dto: RemoveItemsDto): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'remove-items', dto);
  }

  approveItems(processGuid: Guid, dto: ApproveItemsDto = {}): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'approve-items', dto);
  }

  rejectItems(processGuid: Guid, dto: RejectItemsDto): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'reject-items', dto);
  }

  generateChecklist(processGuid: Guid, dto: GenerateChecklistDto): Observable<GenerateChecklistResultView> {
    return this.callAction<GenerateChecklistResultView>(processGuid, 'generate-checklist', dto);
  }

  scanChecklist(processGuid: Guid, dto: ScanChecklistDto): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'scan-checklist', dto);
  }

  signChecklist(processGuid: Guid, dto: SignChecklistDto): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'sign-checklist', dto);
  }

  recordPickup(processGuid: Guid, dto: RecordPickupDto = {}): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'record-pickup', dto);
  }

  recordReturn(processGuid: Guid, dto: RecordReturnDto = {}): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'record-return', dto);
  }

  requestExtension(processGuid: Guid, dto: RequestExtensionDto): Observable<RequestExtensionResultView> {
    return this.callAction<RequestExtensionResultView>(processGuid, 'request-extension', dto);
  }

  approveExtension(processGuid: Guid, dto: ApproveExtensionDto): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'approve-extension', dto);
  }

  rejectExtension(processGuid: Guid, dto: RejectExtensionDto): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'reject-extension', dto);
  }

  recordDamages(processGuid: Guid, dto: RecordDamagesDto): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'record-damages', dto);
  }

  createMaintenanceJobs(processGuid: Guid, dto: CreateMaintenanceJobsDto): Observable<CreateMaintenanceJobsResultView> {
    return this.callAction<CreateMaintenanceJobsResultView>(processGuid, 'create-maintenance-jobs', dto);
  }

  generateInvoice(processGuid: Guid, dto: GenerateInvoiceDto = {}): Observable<GenerateInvoiceResultView> {
    return this.callAction<GenerateInvoiceResultView>(processGuid, 'generate-invoice', dto);
  }

  recordPayment(processGuid: Guid, dto: RecordPaymentDto): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'record-payment', dto);
  }

  generateReport(processGuid: Guid, dto: GenerateReportDto = {}): Observable<GenerateReportResultView> {
    return this.callAction<GenerateReportResultView>(processGuid, 'generate-report', dto);
  }

  complete(processGuid: Guid, dto: CompleteRentalDto = {}): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'complete', dto);
  }

  cancel(processGuid: Guid, dto: CancelRentalDto): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'cancel', dto);
  }

  scrap(processGuid: Guid, dto: ScrapRentalDto): Observable<ActionResultView> {
    return this.callAction<ActionResultView>(processGuid, 'scrap', dto);
  }

  // =========================================================================
  // Rental Overview / Statistics
  // =========================================================================

  getRentalOverview(): Observable<RentalOverviewDto> {
    return this.http.get<RentalOverviewDto>(this.url('/api/v1/rentals/overview'));
  }

  getRecentActivity(days = 7): Observable<RentalRecentActivityDto> {
    return this.http.get<RentalRecentActivityDto>(
      this.url('/api/v1/rentals/overview/recent'),
      { params: toHttpParams({ days }) }
    );
  }
}
