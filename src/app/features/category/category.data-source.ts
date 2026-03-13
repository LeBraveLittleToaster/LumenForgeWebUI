import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { CategoryView, InventoryApiClient } from "@lumenforge/api-client";
import { BehaviorSubject, catchError, finalize, Observable, of } from "rxjs";

export class CategoryDataSource implements DataSource<CategoryDataItem> {

    private categoriesSubject = new BehaviorSubject<CategoryDataItem[]>([]);
    private totalSubject = new BehaviorSubject<number>(0);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    readonly loading$ = this.loadingSubject.asObservable();
    readonly total$ = this.totalSubject.asObservable();

    constructor(private inventoryApiClient: InventoryApiClient) {}

    connect(collectionViewer: CollectionViewer): Observable<readonly CategoryDataItem[]> {
        return this.categoriesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.categoriesSubject.complete();
        this.loadingSubject.complete();
    }

    loadCategories(filter: string, sortDirection: 'asc' | 'desc', pageIndex: number, pageSize: number) {
        this.loadingSubject.next(true);
        this.inventoryApiClient.listCategories({
            search: filter,
            limit: pageSize + 1,
            offset: pageIndex * pageSize
        }).pipe(
            catchError(() => of([] as CategoryView[])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            const categories = Array.isArray(result) ? result : (result.list ?? []);
            const hasMore = categories.length > pageSize;
            const items = hasMore ? categories.slice(0, pageSize) : categories;
            this.categoriesSubject.next(items.map(c => ({ categoryView: c })));
            const total = hasMore
                ? (pageIndex + 2) * pageSize
                : pageIndex * pageSize + items.length;
            this.totalSubject.next(total);
        });
    }

    getLength(): number {
        return this.totalSubject.value;
    }
}

export interface CategoryDataItem {
    categoryView: CategoryView;
}
