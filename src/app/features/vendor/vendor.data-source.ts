import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { VendorView, InventoryApiClient, ListQueryDto } from "@lumenforge/api-client";
import { BehaviorSubject, catchError, finalize, Observable, of } from "rxjs";

export class VendorDataSource implements DataSource<VendorDataItem> {

    private vendorsSubject = new BehaviorSubject<VendorDataItem[]>([]);
    private totalSubject = new BehaviorSubject<number>(0);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    readonly loading$ = this.loadingSubject.asObservable();
    readonly total$ = this.totalSubject.asObservable();

    constructor(private inventoryApiClient: InventoryApiClient) {}

    connect(collectionViewer: CollectionViewer): Observable<readonly VendorDataItem[]> {
        return this.vendorsSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.vendorsSubject.complete();
        this.loadingSubject.complete();
    }

    loadVendors(filter: string, sortDirection: 'asc' | 'desc', pageIndex: number, pageSize: number) {
        this.loadingSubject.next(true);
        this.inventoryApiClient.listVendors({
            search: filter,
            limit: pageSize,
            offset: pageIndex * pageSize
        }).pipe(
            catchError(() => of({ list: [] as VendorView[], total: 0 })),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            console.log('VendorDataSource: Loaded vendors', result);
            this.vendorsSubject.next(result.list.map(v => ({ vendorView: v })));
            this.totalSubject.next(result.total);
        });
    }

    getLength(): number {
        return this.totalSubject.value;
    }
}

export interface VendorDataItem {
    vendorView: VendorView;
}
