import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Guid } from '../core/common';
import { toHttpParams } from '../core/http-params';
import { RENTAL_API_BASE_URL } from '../core/tokens';
import { PaginatedList } from '../inventory/models/views';
import {
  CreateQuestionDto,
  EventContextDto,
  SubmitAnswerDto,
  SubmitAnswersBulkDto,
  CreateRentalDto,
  UpdateRentalDto,
  GenerateChecklistDto,
  SignChecklistDto,
  UpdateChecklistItemDto,
  TransitionRentalStatusDto,
} from './models/dtos';
import {
  QuestionView,
  AnswerView,
  RentalView,
  RentalStatusView,
  RentalTransitionsView,
  ChecklistView,
  ChecklistItemView,
  StockBindingConflictView,
} from './models/views';
import {
  RentalQuestionsQueryDto,
  RentalQueryDto,
  RentalConflictQueryDto,
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

  // =========================================================================
  // Survey Questions
  // =========================================================================

  /** Lists all active questions (paginated). */
  listActiveQuestions(limit = 50, offset = 0): Observable<PaginatedList<QuestionView>> {
    return this.http.get<PaginatedList<QuestionView>>(
      this.url('/api/v1/rentals/surveys/questions'),
      { params: toHttpParams({ limit, offset }) }
    );
  }

  /** Lists all questions including inactive (admin, paginated). */
  listQuestions(query: RentalQuestionsQueryDto = {}): Observable<PaginatedList<QuestionView>> {
    return this.http.get<PaginatedList<QuestionView>>(
      this.url('/api/v1/rentals/surveys/questions/all'),
      { params: toHttpParams({ search: query.search ?? undefined, limit: query.limit, offset: query.offset }) }
    );
  }

  getQuestion(questionGuid: Guid): Observable<QuestionView> {
    return this.http.get<QuestionView>(this.url(`/api/v1/rentals/surveys/questions/${questionGuid}`));
  }

  createQuestion(dto: CreateQuestionDto): Observable<QuestionView> {
    return this.http.put<QuestionView>(this.url('/api/v1/rentals/surveys/questions'), dto);
  }

  deleteQuestion(questionGuid: Guid): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/rentals/surveys/questions/${questionGuid}`));
  }

  /** Returns AI-recommended questions for an event context. */
  recommendQuestions(dto: EventContextDto): Observable<QuestionView[]> {
    return this.http.post<QuestionView[]>(this.url('/api/v1/rentals/surveys/questions/recommend'), dto);
  }

  // =========================================================================
  // Answers
  // =========================================================================

  submitAnswer(questionGuid: Guid, dto: SubmitAnswerDto): Observable<AnswerView> {
    return this.http.post<AnswerView>(this.url(`/api/v1/rentals/surveys/questions/${questionGuid}/answers`), dto);
  }

  listAnswersForQuestion(questionGuid: Guid, rentalGuid?: Guid, limit = 50, offset = 0): Observable<PaginatedList<AnswerView>> {
    return this.http.get<PaginatedList<AnswerView>>(
      this.url(`/api/v1/rentals/surveys/questions/${questionGuid}/answers`),
      { params: toHttpParams({ rentalGuid: rentalGuid ?? undefined, limit, offset }) }
    );
  }

  submitAnswersBulk(dto: SubmitAnswersBulkDto): Observable<AnswerView[]> {
    return this.http.post<AnswerView[]>(this.url('/api/v1/rentals/surveys/answers/bulk'), dto);
  }

  getAnswer(answerGuid: Guid): Observable<AnswerView> {
    return this.http.get<AnswerView>(this.url(`/api/v1/rentals/surveys/answers/${answerGuid}`));
  }

  deleteAnswer(answerGuid: Guid): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/rentals/surveys/answers/${answerGuid}`));
  }

  // =========================================================================
  // Rentals
  // =========================================================================

  listRentals(query: RentalQueryDto = {}, include?: RentalInclude[]): Observable<PaginatedList<RentalView>> {
    return this.http.get<PaginatedList<RentalView>>(
      this.url('/api/v1/rentals'),
      { params: toHttpParams({ ...query, include: include?.join(',') ?? undefined }) }
    );
  }

  getRental(rentalGuid: Guid, include?: RentalInclude[]): Observable<RentalView> {
    return this.http.get<RentalView>(
      this.url(`/api/v1/rentals/${rentalGuid}`),
      { params: toHttpParams({ include: include?.join(',') ?? undefined }) }
    );
  }

  createRental(dto: CreateRentalDto): Observable<RentalView> {
    console.log('Creating rental with DTO:', dto);
    return this.http.put<RentalView>(this.url('/api/v1/rentals'), dto);
  }

  updateRental(rentalGuid: Guid, dto: UpdateRentalDto): Observable<RentalView> {
    return this.http.patch<RentalView>(this.url(`/api/v1/rentals/${rentalGuid}`), dto);
  }

  deleteRental(rentalGuid: Guid): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/rentals/${rentalGuid}`));
  }

  listConflicts(query: RentalConflictQueryDto): Observable<PaginatedList<StockBindingConflictView>> {
    return this.http.get<PaginatedList<StockBindingConflictView>>(
      this.url('/api/v1/rentals/conflicts'),
      {
        params: toHttpParams({
          device_guid: query.device_guid,
          start: query.start,
          end: query.end,
          binding_type: query.binding_type,
          limit: query.limit,
          offset: query.offset,
        }),
      }
    );
  }

  // =========================================================================
  // Rental Statuses
  // =========================================================================

  listRentalStatuses(): Observable<PaginatedList<RentalStatusView>> {
    return this.http.get<PaginatedList<RentalStatusView>>(this.url('/api/v1/rentals/statuses'));
  }

  listAllowedTransitions(rentalGuid: Guid): Observable<RentalTransitionsView> {
    return this.http.get<RentalTransitionsView>(this.url(`/api/v1/rentals/${rentalGuid}/transitions`));
  }

  transitionRentalStatus(rentalGuid: Guid, dto: TransitionRentalStatusDto): Observable<RentalView> {
    return this.http.post<RentalView>(this.url(`/api/v1/rentals/${rentalGuid}/transitions`), dto);
  }

  // =========================================================================
  // Checklists
  // =========================================================================

  listChecklists(rentalGuid: Guid, limit = 50, offset = 0): Observable<PaginatedList<ChecklistView>> {
    return this.http.get<PaginatedList<ChecklistView>>(
      this.url(`/api/v1/rentals/${rentalGuid}/checklists`),
      { params: toHttpParams({ limit, offset }) }
    );
  }

  generateChecklist(rentalGuid: Guid, dto: GenerateChecklistDto): Observable<ChecklistView> {
    return this.http.post<ChecklistView>(this.url(`/api/v1/rentals/${rentalGuid}/checklists/generate`), dto);
  }

  getChecklist(rentalGuid: Guid, checklistGuid: Guid): Observable<ChecklistView> {
    return this.http.get<ChecklistView>(this.url(`/api/v1/rentals/${rentalGuid}/checklists/${checklistGuid}`));
  }

  updateChecklistItem(rentalGuid: Guid, checklistGuid: Guid, itemGuid: Guid, dto: UpdateChecklistItemDto): Observable<ChecklistItemView> {
    return this.http.patch<ChecklistItemView>(this.url(`/api/v1/rentals/${rentalGuid}/checklists/${checklistGuid}/items/${itemGuid}`), dto);
  }

  signChecklist(rentalGuid: Guid, checklistGuid: Guid, dto: SignChecklistDto): Observable<ChecklistView> {
    return this.http.post<ChecklistView>(this.url(`/api/v1/rentals/${rentalGuid}/checklists/${checklistGuid}/sign`), dto);
  }
}
