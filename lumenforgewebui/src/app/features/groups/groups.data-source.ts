import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { GroupView, ListView, UserView } from "../../core/api/auth/models/views";

import { BehaviorSubject, catchError, finalize, Observable, of } from "rxjs";
import { AuthApiClient } from "../../core/api/auth/auth-api.client";

export class GroupsDataSource implements DataSource<GroupDataItem> {

    private groupsSubject = new BehaviorSubject<GroupDataItem[]>([]) ;
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

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
        });
    }

    getLength(): number {
        return this.groupsSubject.value.length;
    }
}

export interface GroupDataItem {
    groupView: GroupView;
} 