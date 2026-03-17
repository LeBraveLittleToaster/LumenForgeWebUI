import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { RentalApiClient, RentalView } from '@lumenforge/api-client';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';

export interface RentalDataItem {
  rental: RentalView;
}

export class RentalDataSource implements DataSource<RentalDataItem> {
  private readonly rentalsSubject = new BehaviorSubject<RentalDataItem[]>([]);
  private readonly totalSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly total$ = this.totalSubject.asObservable();

  constructor(private readonly rentalApiClient: RentalApiClient) {}

  connect(_: CollectionViewer): Observable<readonly RentalDataItem[]> {
    return this.rentalsSubject.asObservable();
  }

  disconnect(_: CollectionViewer): void {
    this.rentalsSubject.complete();
    this.totalSubject.complete();
    this.loadingSubject.complete();
  }

  loadRentals(search: string, pageIndex: number, pageSize: number): void {
    this.loadingSubject.next(true);

    this.rentalApiClient.listRentals({
      search: search.trim() || undefined,
      limit: pageSize,
      offset: pageIndex * pageSize,
    }).pipe(
      catchError(() => of({ list: [] as RentalView[], total: 0 })),
      finalize(() => this.loadingSubject.next(false)),
    ).subscribe(result => {
      this.rentalsSubject.next(result.list.map(rental => ({ rental })));
      this.totalSubject.next(result.total);
    });
  }
}
