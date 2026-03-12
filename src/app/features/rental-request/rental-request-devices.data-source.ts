import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { DeviceView, InventoryApiClient } from '@lumenforge/api-client';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';

export interface RentalRequestDeviceItem {
  device: DeviceView;
}

export class RentalRequestDevicesDataSource implements DataSource<RentalRequestDeviceItem> {
  private readonly devicesSubject = new BehaviorSubject<RentalRequestDeviceItem[]>([]);
  private readonly totalSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly total$ = this.totalSubject.asObservable();

  constructor(private readonly inventoryApiClient: InventoryApiClient) {}

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

    this.inventoryApiClient.listPublicDevices({
      search: filter,
      limit: pageSize,
      offset: pageIndex * pageSize,
    }).pipe(
      catchError(() => of({ list: [], total: 0 })),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.devicesSubject.next(result.list.map(device => ({ device })));
      this.totalSubject.next(result.total);
    });
  }

  getLength(): number {
    return this.totalSubject.value;
  }
}
