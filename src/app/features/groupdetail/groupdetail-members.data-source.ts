import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { AuthApiClient, ListView, UserView } from '@lumenforge/api-client';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';

export interface GroupMemberDataItem {
  user: UserView;
}

export class GroupdetailMembersDataSource implements DataSource<GroupMemberDataItem> {
  private readonly membersSubject = new BehaviorSubject<GroupMemberDataItem[]>([]);
  private readonly totalSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly total$ = this.totalSubject.asObservable();

  constructor(
    private readonly authApiClient: AuthApiClient,
    private readonly groupGuid: string
  ) {}

  connect(_: CollectionViewer): Observable<readonly GroupMemberDataItem[]> {
    return this.membersSubject.asObservable();
  }

  disconnect(_: CollectionViewer): void {
    this.membersSubject.complete();
    this.totalSubject.complete();
    this.loadingSubject.complete();
  }

  loadMembers(filter: string, _sortDirection: 'asc' | 'desc', pageIndex: number, pageSize: number): void {
    this.loadingSubject.next(true);

    this.authApiClient.getGroupUsers(this.groupGuid, {
      search: filter,
      limit: pageSize,
      offset: pageIndex * pageSize,
    }).pipe(
      catchError(() => of({ list: [], total: 0 } as ListView<UserView>)),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.membersSubject.next(result.list.map(user => ({ user })));
      this.totalSubject.next(result.total);
    });
  }

  getLength(): number {
    return this.totalSubject.value;
  }
}
