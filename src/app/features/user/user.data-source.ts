import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { ListView, UserView, AuthApiClient } from "@lumenforge/api-client";
import { BehaviorSubject, catchError, finalize, Observable, of } from "rxjs";

export class UserDataSource implements DataSource<UserDataItem> {

    private usersSubject = new BehaviorSubject<UserDataItem[]>([]);
    private totalSubject = new BehaviorSubject<number>(0);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    readonly loading$ = this.loadingSubject.asObservable();
    readonly total$ = this.totalSubject.asObservable();

    constructor(private authApiClient: AuthApiClient) {}

    connect(collectionViewer: CollectionViewer): Observable<readonly UserDataItem[]> {
        return this.usersSubject.asObservable();
    }
    disconnect(collectionViewer: CollectionViewer): void {
            this.usersSubject.complete();
            this.loadingSubject.complete();
    }

    loadUsers(filter:string, sortDirection: 'asc' | 'desc', pageIndex: number, pageSize: number) {
        console.log('UserDataSource: Loading users with filter:', filter, 'sortDirection:', sortDirection, 'pageIndex:', pageIndex, 'pageSize:', pageSize);
        this.loadingSubject.next(true);
        
        this.authApiClient.listUsers({ search: filter, limit: pageSize, offset: pageIndex * pageSize }).pipe(
            catchError(() => {
                console.log('UserDataSource: Failed to load users');
                return of({ list: [], total: 0 } as ListView<UserView>);
            }),
            finalize(() => {
                this.loadingSubject.next(false);
                console.log('UserDataSource: Finished loading users');
            })
        ).subscribe(users => { 
            const userDataItems = users.list.map(user => ({ userView: user }));
            this.usersSubject.next(userDataItems);
            this.totalSubject.next(users.total)
        });
    }

    getLength(): number {
        return this.totalSubject.value;
    }
}

export interface UserDataItem {
    userView: UserView;
} 