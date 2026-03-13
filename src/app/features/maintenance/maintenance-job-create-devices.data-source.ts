import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { DeviceView, InventoryApiClient } from '@lumenforge/api-client';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';

export interface MaintenanceJobCreateDeviceItem {
  device: DeviceView;
}

export class MaintenanceJobCreateDevicesDataSource implements DataSource<MaintenanceJobCreateDeviceItem> {
  private readonly devicesSubject = new BehaviorSubject<MaintenanceJobCreateDeviceItem[]>([]);
  private readonly totalSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly total$ = this.totalSubject.asObservable();

  constructor(private readonly inventoryApiClient: InventoryApiClient) {}

  connect(_: CollectionViewer): Observable<readonly MaintenanceJobCreateDeviceItem[]> {
    return this.devicesSubject.asObservable();
  }

  disconnect(_: CollectionViewer): void {
    this.devicesSubject.complete();
    this.totalSubject.complete();
    this.loadingSubject.complete();
  }

  loadDevices(filter: string, _sortDirection: 'asc' | 'desc', pageIndex: number, pageSize: number): void {
    this.loadingSubject.next(true);

    this.inventoryApiClient.listDevices({
      search: filter,
      limit: pageSize + 1,
      offset: pageIndex * pageSize,
    }).pipe(
      catchError(() => of([] as DeviceView[])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(devices => {
      const hasMore = devices.length > pageSize;
      const items = hasMore ? devices.slice(0, pageSize) : devices;
      this.devicesSubject.next(items.map(device => ({ device })));
      const total = hasMore ? (pageIndex + 2) * pageSize : pageIndex * pageSize + items.length;
      this.totalSubject.next(total);
    });
  }
}
