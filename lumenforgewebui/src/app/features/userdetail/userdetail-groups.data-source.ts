import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { GroupView } from '../../core/api/auth/models/views';

export class UserDetailGroupsDataSource implements DataSource<GroupView> {
  private readonly groupsSubject = new BehaviorSubject<GroupView[]>([]);
  private readonly totalSubject = new BehaviorSubject<number>(0);

  readonly total$ = this.totalSubject.asObservable();

  connect(collectionViewer: CollectionViewer): Observable<readonly GroupView[]> {
    return this.groupsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.groupsSubject.complete();
    this.totalSubject.complete();
  }

  setGroups(groups: GroupView[] | null | undefined): void {
    const safeGroups = groups ?? [];
    this.groupsSubject.next(safeGroups);
    this.totalSubject.next(safeGroups.length);
  }

  upsertGroup(group: GroupView): void {
    const current = this.groupsSubject.value;
    const index = current.findIndex(existing => existing.guid === group.guid);
    const next = index >= 0
      ? current.map(existing => existing.guid === group.guid ? group : existing)
      : [group, ...current];
    this.groupsSubject.next(next);
    this.totalSubject.next(next.length);
  }

  removeGroupByGuid(groupGuid: string): void {
    const filtered = this.groupsSubject.value.filter(group => group.guid !== groupGuid);
    this.groupsSubject.next(filtered);
    this.totalSubject.next(filtered.length);
  }

  getLength(): number {
    return this.totalSubject.value;
  }
}
