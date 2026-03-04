import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { GroupView, ListView, UserView } from "../../core/api/auth/models/views";

import { BehaviorSubject, catchError, finalize, Observable, of } from "rxjs";
import { AuthApiClient } from "../../core/api/auth/auth-api.client";

export class GroupsDataSource implements DataSource<GroupDataItem> {

    private groupsSubject = new BehaviorSubject<GroupDataItem[]>([]) ;
    private totalSubject = new BehaviorSubject<number>(0);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    readonly loading$ = this.loadingSubject.asObservable();
    readonly total$ = this.totalSubject.asObservable();

    constructor(private authApiClient: AuthApiClient) {}

    connect(collectionViewer: CollectionViewer): Observable<readonly GroupDataItem[]> {
        return this.groupsSubject.asObservable();
    }
    disconnect(collectionViewer: CollectionViewer): void {
            this.groupsSubject.complete();
            this.loadingSubject.complete();
    }

    loadGroups(filter:string, sortDirection: 'asc' | 'desc', pageIndex: number, pageSize: number) {
        console.log('GroupDataSource: Loading users with filter:', filter, 'sortDirection:', sortDirection, 'pageIndex:', pageIndex, 'pageSize:', pageSize);
        this.loadingSubject.next(true);
        
        this.authApiClient.listGroups({ search: filter, limit: pageSize, offset: pageIndex * pageSize }).pipe(
            catchError(() => {
                console.log('GroupDataSource: Failed to load users');
                return of({ list: [], total: 0 } as ListView<GroupView>);
            }),
            finalize(() => {
                this.loadingSubject.next(false);
                console.log('UserDataSource: Finished loading users');
            })
        ).subscribe(groups => { 
            const groupDataItems = groups.list.map(group => ({ groupView: group }));
            this.groupsSubject.next(groupDataItems);
            this.totalSubject.next(groups.total);
            console.log(groups)
        });
    }

    getLength(): number {
        return this.totalSubject.value;
    }
}

export interface GroupDataItem {
    groupView: GroupView;
} 