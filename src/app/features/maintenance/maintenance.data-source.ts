import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { MaintenanceApiClient, MaintenanceJobView, MaintenanceQueryDto } from '@lumenforge/api-client';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';

export class MaintenanceDataSource implements DataSource<MaintenanceDataItem> {
  private readonly jobsSubject = new BehaviorSubject<MaintenanceDataItem[]>([]);
  private readonly totalSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly total$ = this.totalSubject.asObservable();

  constructor(private readonly maintenanceApiClient: MaintenanceApiClient) {}

  connect(_: CollectionViewer): Observable<readonly MaintenanceDataItem[]> {
    return this.jobsSubject.asObservable();
  }

  disconnect(_: CollectionViewer): void {
    this.jobsSubject.complete();
    this.totalSubject.complete();
    this.loadingSubject.complete();
  }

  loadJobs(query: MaintenanceQueryDto): void {
    this.loadingSubject.next(true);

    this.maintenanceApiClient.listJobs(query).pipe(
      catchError(() => of({ list: [], total: 0 })),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.jobsSubject.next(result.list.map(job => ({ job })));
      this.totalSubject.next(result.total);
    });
  }

  getLength(): number {
    return this.totalSubject.value;
  }
}

export interface MaintenanceDataItem {
  job: MaintenanceJobView;
}
