import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { DeviceView, InventoryApiClient } from "@lumenforge/api-client";
import { BehaviorSubject, catchError, finalize, Observable, of } from "rxjs";

export class InventoryDataSource implements DataSource<InventoryDataItem> {

    private devicesSubject = new BehaviorSubject<InventoryDataItem[]>([]);
    private totalSubject = new BehaviorSubject<number>(0);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    readonly loading$ = this.loadingSubject.asObservable();
    readonly total$ = this.totalSubject.asObservable();

    constructor(private inventoryApiClient: InventoryApiClient) {}

    connect(collectionViewer: CollectionViewer): Observable<readonly InventoryDataItem[]> {
        return this.devicesSubject.asObservable();
    }
    disconnect(collectionViewer: CollectionViewer): void {
            this.devicesSubject.complete();
            this.loadingSubject.complete();
    }

    loadDevices(filter: string, sortDirection: 'asc' | 'desc', pageIndex: number, pageSize: number) {
        console.log('InventoryDataSource: Loading devices with filter:', filter, 'sortDirection:', sortDirection, 'pageIndex:', pageIndex, 'pageSize:', pageSize);
        this.loadingSubject.next(true);
        
        this.inventoryApiClient.listDevices({ search: filter, limit: pageSize, offset: pageIndex * pageSize }).pipe(
            catchError(() => {
                console.log('InventoryDataSource: Failed to load devices');
                return of({ list: [] as DeviceView[], total: 0 });
            }),
            finalize(() => {
                this.loadingSubject.next(false);
                console.log('InventoryDataSource: Finished loading devices');
            })
        ).subscribe(result => { 
            const deviceDataItems = result.list.map(device => ({ deviceView: device }));
            this.devicesSubject.next(deviceDataItems);
            this.totalSubject.next(result.total);
        });
    }

    getLength(): number {
        return this.totalSubject.value;
    }
}

export interface InventoryDataItem {
    deviceView: DeviceView;
}
