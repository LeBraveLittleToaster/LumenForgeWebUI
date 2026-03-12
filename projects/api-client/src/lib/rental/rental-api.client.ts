import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RENTAL_API_BASE_URL } from '../core/tokens';

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

  getQuestions(): Observable<string[]> {
    return this.http.get<string[]>(this.url('/api/v1/rental/questions'));
  }
}
