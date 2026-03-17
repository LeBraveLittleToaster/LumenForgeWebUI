import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { CatalogueApiClient, CatalogueItemView } from '@lumenforge/api-client';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';

export interface RentalRequestDeviceItem {
  item: CatalogueItemView;
}

export class RentalRequestDevicesDataSource implements DataSource<RentalRequestDeviceItem> {
  private readonly devicesSubject = new BehaviorSubject<RentalRequestDeviceItem[]>([]);
  private readonly totalSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly total$ = this.totalSubject.asObservable();

  constructor(private readonly catalogueApiClient: CatalogueApiClient) {}

  connect(_: CollectionViewer): Observable<readonly RentalRequestDeviceItem[]> {
    return this.devicesSubject.asObservable();
  }

  disconnect(_: CollectionViewer): void {
    this.devicesSubject.complete();
    this.totalSubject.complete();
    this.loadingSubject.complete();
  }

  loadDevices(filter: string, _sortDirection: 'asc' | 'desc', pageIndex: number, pageSize: number): void {
    this.loadingSubject.next(true);

    this.catalogueApiClient.listItems({
      search: filter || null,
      limit: pageSize,
      offset: pageIndex * pageSize,
      publishedOnly: true,
    }).pipe(
      catchError(() => of({ list: [] as CatalogueItemView[], total: 0 })),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.devicesSubject.next(result.list.map(item => ({ item })));
      this.totalSubject.next(result.total);
    });
  }

  getLength(): number {
    return this.totalSubject.value;
  }
}
