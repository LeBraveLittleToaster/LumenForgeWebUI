import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CATALOGUE_API_BASE_URL } from '../core/tokens';
import { Guid } from '../core/common';
import { toHttpParams } from './http-params';
import { CreateCatalogueItemDto, UpdateCatalogueItemDto } from './models/dtos';
import { CatalogueItemQueryDto, CatalogueListQueryDto } from './models/query';
import { CatalogueItemView, CatalogueListOrPaginatedList } from './models/views';

@Injectable({ providedIn: 'root' })
export class CatalogueApiClient {
  constructor(
    private readonly http: HttpClient,
    @Inject(CATALOGUE_API_BASE_URL) private readonly baseUrl: string
  ) {}

  private url(path: string): string {
    const b = this.baseUrl?.replace(/\/+$/, '') ?? '';
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${b}${p}`;
  }

  listItems(query: CatalogueListQueryDto = {}): Observable<CatalogueListOrPaginatedList> {
    return this.http.get<CatalogueListOrPaginatedList>(
      this.url('/api/v1/catalogue/items'),
      {
        params: toHttpParams({
          Search: query.search ?? undefined,
          Limit: query.limit,
          Offset: query.offset,
          PublishedOnly: query.publishedOnly ?? undefined,
        }),
      }
    );
  }

  getItem(itemGuid: Guid, query: CatalogueItemQueryDto = {}): Observable<CatalogueItemView> {
    return this.http.get<CatalogueItemView>(
      this.url(`/api/v1/catalogue/items/${itemGuid}`),
      {
        params: toHttpParams({
          include_unpublished: query.includeUnpublished ?? undefined,
        }),
      }
    );
  }

  createItem(dto: CreateCatalogueItemDto): Observable<CatalogueItemView> {
    return this.http.put<CatalogueItemView>(this.url('/api/v1/catalogue/items'), dto);
  }

  updateItem(itemGuid: Guid, dto: UpdateCatalogueItemDto): Observable<CatalogueItemView> {
    return this.http.patch<CatalogueItemView>(this.url(`/api/v1/catalogue/items/${itemGuid}`), dto);
  }

  deleteItem(itemGuid: Guid): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/catalogue/items/${itemGuid}`));
  }
}