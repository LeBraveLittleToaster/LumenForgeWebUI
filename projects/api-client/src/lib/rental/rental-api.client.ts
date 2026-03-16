import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Guid } from '../core/common';
import { toHttpParams } from '../core/http-params';
import { RENTAL_API_BASE_URL } from '../core/tokens';

export interface RentalQuestionView {
  question_guid?: Guid;
  question_uuid?: Guid;
  question_text?: string;
  text?: string;
  category?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface RentalQuestionsQueryDto {
  search?: string | null;
  limit?: number;
  offset?: number;
}

export interface CreateQuestionDto {
  question_text: string;
  category?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export type SurveyAnswerResponse = 'Yes' | 'No' | 'NotImportant' | 'Unknown';

export interface SubmitAnswerDto {
  question_uuid: Guid;
  response: SurveyAnswerResponse;
  comment?: string | null;
  rental_uuid?: Guid | null;
}

export interface RecommendQuestionsInputDto {
  name?: string | null;
  shortDescription?: string | null;
  eventStart?: string | null;
  eventEnd?: string | null;
  location?: string | null;
  event_name?: string | null;
  request_description?: string | null;
  delivery_address?: string | null;
  planned_pickup_at?: string | null;
  planned_return_at?: string | null;
}

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

  private normalizeQuestionArray(value: unknown): RentalQuestionView[] {
    if (Array.isArray(value)) {
      return value.filter((x): x is RentalQuestionView => !!x && typeof x === 'object');
    }

    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const candidates = [obj['list'], obj['items'], obj['data'], obj['questions']];
      const found = candidates.find(Array.isArray);
      if (Array.isArray(found)) {
        return found.filter((x): x is RentalQuestionView => !!x && typeof x === 'object');
      }
    }

    return [];
  }

  private extractQuestionTexts(value: unknown): string[] {
    if (Array.isArray(value) && value.every(x => typeof x === 'string')) {
      return value as string[];
    }

    const questions = this.normalizeQuestionArray(value);
    return questions
      .map(q => q.question_text ?? q.text)
      .filter((text): text is string => typeof text === 'string' && text.length > 0);
  }

  getCommonQuestions(input: RecommendQuestionsInputDto = {}): Observable<string[]> {
    return this.http
      .post<unknown>(this.url('/api/v1/rentals/surveys/questions/recommend'), input)
      .pipe(map(result => this.extractQuestionTexts(result)));
  }

  getQuestions(): Observable<string[]> {
    return this.getCommonQuestions();
  }

  createQuestion(dto: CreateQuestionDto): Observable<void> {
    return this.http.put<void>(this.url('/api/v1/rentals/surveys/questions'), dto);
  }

  getQuestion(questionGuid: Guid): Observable<RentalQuestionView> {
    return this.http.get<RentalQuestionView>(this.url(`/api/v1/rentals/surveys/questions/${questionGuid}`));
  }

  deleteQuestion(questionGuid: Guid): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/rentals/surveys/questions/${questionGuid}`));
  }

  listQuestions(query: RentalQuestionsQueryDto = {}): Observable<RentalQuestionView[]> {
    return this.http
      .get<unknown>(
        this.url('/api/v1/rentals/surveys/questions/all'),
        {
          params: toHttpParams({
            search: query.search ?? undefined,
            limit: query.limit,
            offset: query.offset,
          }),
        }
      )
      .pipe(map(result => this.normalizeQuestionArray(result)));
  }

  getQuestionRecommendations(query: RentalQuestionsQueryDto = {}): Observable<RentalQuestionView[]> {
    return this.http
      .post<unknown>(
        this.url('/api/v1/rentals/surveys/questions/recommend'),
        {
          search: query.search ?? undefined,
          limit: query.limit,
          offset: query.offset,
        }
      )
      .pipe(map(result => this.normalizeQuestionArray(result)));
  }

  submitQuestionAnswer(questionGuid: Guid, dto: SubmitAnswerDto): Observable<void> {
    return this.http.post<void>(this.url(`/api/v1/rentals/surveys/questions/${questionGuid}/answers`), dto);
  }

  getQuestionAnswers(questionGuid: Guid, rentalGuid?: Guid): Observable<unknown> {
    return this.http.get<unknown>(
      this.url(`/api/v1/rentals/surveys/questions/${questionGuid}/answers`),
      {
        params: toHttpParams({ rentalGuid: rentalGuid ?? undefined }),
      }
    );
  }

  getAnswer(answerGuid: Guid): Observable<unknown> {
    return this.http.get<unknown>(this.url(`/api/v1/rentals/surveys/answers/${answerGuid}`));
  }

  deleteAnswer(answerGuid: Guid): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/rentals/surveys/answers/${answerGuid}`));
  }
}
