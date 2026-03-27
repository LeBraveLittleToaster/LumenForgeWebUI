import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, EMPTY, filter, map, Observable, of, startWith, switchMap, tap } from 'rxjs';

import { InventoryApiClient, DeviceParameterView, DeviceView, DeviceRelationView } from '@lumenforge/api-client';
import { DeviceAddParameterDialogComponent } from './device-add-parameter-dialog.component';
import { DeviceAssignCategoriesDialogComponent } from './device-assign-categories-dialog.component';
import { DeviceUpdateParameterDialogComponent } from './device-update-parameter-dialog.component';
import { DeviceAddChildDialogComponent } from './device-add-child-dialog.component';
import { DeleteConfirmDialogComponent } from '../../shared/data-table/data-table';

interface DeviceDetailState {
  loading: boolean;
  device: DeviceView | null;
  error: string | null;
}

@Component({
  selector: 'app-remove-category-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Remove Category</h2>
    <mat-dialog-content>
      Remove this category from the device?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Decline</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Accept</button>
    </mat-dialog-actions>
  `
})
export class RemoveCategoryConfirmDialogComponent {}

@Component({
  selector: 'app-devicedetail',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  templateUrl: './devicedetail.html',
  styleUrl: './devicedetail.css',
})
export class Devicedetail implements OnInit {
  readonly parameterColumns = ['key', 'value', 'updated_at', 'actions'];
  readonly relationColumns = ['child_device_name', 'contained_amount', 'relation_type', 'actions'];
  state$!: Observable<DeviceDetailState>;
  childRelations$!: Observable<DeviceRelationView[]>;
  childRelations: DeviceRelationView[] = [];
  private readonly refreshTrigger$ = new BehaviorSubject<void>(undefined);
  private readonly refreshRelations$ = new BehaviorSubject<void>(undefined);

  constructor(
    private route: ActivatedRoute,
    @Inject(InventoryApiClient) private inventoryApiClient: InventoryApiClient,
    private dialog: MatDialog,
    private location: Location
  ) {}

  ngOnInit(): void {
    const deviceGuid$ = this.route.paramMap.pipe(
      map(params => params.get('deviceGuid')),
      filter((guid): guid is string => !!guid),
      distinctUntilChanged()
    );

    this.state$ = combineLatest([deviceGuid$, this.refreshTrigger$]).pipe(
      switchMap(([deviceGuid]) =>
        this.inventoryApiClient.getDevice(deviceGuid).pipe(
          map(device => ({ loading: false, device, error: null } as DeviceDetailState)),
          catchError(() => of({ loading: false, device: null, error: 'Failed to load device details.' } as DeviceDetailState)),
          startWith({ loading: true, device: null, error: null } as DeviceDetailState)
        )
      )
    );

    this.childRelations$ = combineLatest([deviceGuid$, this.refreshRelations$]).pipe(
      switchMap(([deviceGuid]) =>
        this.inventoryApiClient.getChildRelations(deviceGuid).pipe(
          map(response => response.list),
          catchError(() => of([] as DeviceRelationView[]))
        )
      ),
      tap(relations => this.childRelations = relations)
    );
  }

  goBack(): void {
    this.location.back();
  }

  openAssignCategoriesDialog(device: DeviceView): void {
    const ref = this.dialog.open(DeviceAssignCategoriesDialogComponent, {
      width: '520px',
      data: {
        deviceGuid: device.guid,
        assignedCategoryGuids: (device.categories ?? [])
          .map(category => this.getCategoryId(category as DeviceView['categories'][number] & { uuid?: string | null }))
          .filter((id): id is string => !!id)
      }
    });

    ref.afterClosed().subscribe(result => {
      if (result === undefined) {
        return;
      }
      this.refreshTrigger$.next();
    });
  }

  openAddParameterDialog(device: DeviceView): void {
    const ref = this.dialog.open(DeviceAddParameterDialogComponent, {
      width: '460px',
      data: { deviceGuid: device.guid }
    });

    ref.afterClosed().subscribe(result => {
      if (result === undefined) {
        return;
      }
      this.refreshTrigger$.next();
    });
  }

  openUpdateParameterDialog(device: DeviceView, parameter: DeviceParameterView): void {
    const ref = this.dialog.open(DeviceUpdateParameterDialogComponent, {
      width: '460px',
      data: {
        deviceGuid: device.guid,
        parameter
      }
    });

    ref.afterClosed().subscribe(result => {
      if (result === undefined) {
        return;
      }
      this.refreshTrigger$.next();
    });
  }

  removeParameter(device: DeviceView, parameter: DeviceParameterView): void {
    this.dialog.open(DeleteConfirmDialogComponent).afterClosed().pipe(
      filter((confirmed): confirmed is true => !!confirmed),
      switchMap(() =>
        this.inventoryApiClient.removeDeviceParameter(device.guid, parameter.key).pipe(
          catchError(() => EMPTY)
        )
      )
    ).subscribe(() => {
      this.refreshTrigger$.next();
    });
  }

  removeCategory(device: DeviceView, category: DeviceView['categories'][number], event?: Event): void {
    event?.stopPropagation();

    const categoryIdToRemove = this.getCategoryId(category as { guid?: string | null; uuid?: string | null });
    if (!categoryIdToRemove) {
      return;
    }

    this.dialog.open(RemoveCategoryConfirmDialogComponent).afterClosed().pipe(
      filter((confirmed): confirmed is true => !!confirmed),
      switchMap(() => {
        const categoryGuids = (device.categories ?? [])
          .map(current => this.getCategoryId(current as { guid?: string | null; uuid?: string | null }))
          .filter((id): id is string => !!id && id !== categoryIdToRemove);

        return this.inventoryApiClient.setDeviceCategories(device.guid, { categoryGuids }).pipe(
          catchError(() => EMPTY)
        );
      })
    ).subscribe(() => {
      this.refreshTrigger$.next();
    });
  }

  formatStock(device: DeviceView): string {
    if (!device.stock) {
      return 'No stock record';
    }
    return `${device.stock.stock_count} ${device.stock.stock_unit_type}`;
  }

  get hasPhoto(): (device: DeviceView | null) => boolean {
    return (device) => !!device?.photo_url;
  }

  openAddChildDialog(device: DeviceView): void {
    const ref = this.dialog.open(DeviceAddChildDialogComponent, {
      width: '520px',
      data: {
        parentDeviceGuid: device.guid,
        existingChildGuids: this.childRelations.map(r => r.child_device_guid),
      }
    });

    ref.afterClosed().subscribe(result => {
      if (result === undefined) return;
      this.refreshRelations$.next();
    });
  }

  removeChildRelation(relation: DeviceRelationView): void {
    this.dialog.open(DeleteConfirmDialogComponent).afterClosed().pipe(
      filter((confirmed): confirmed is true => !!confirmed),
      switchMap(() =>
        this.inventoryApiClient.deleteDeviceRelation(relation.guid).pipe(
          catchError(() => EMPTY)
        )
      )
    ).subscribe(() => {
      this.refreshRelations$.next();
    });
  }

  private getCategoryId(category: { guid?: string | null; uuid?: string | null }): string {
    return category.guid ?? category.uuid ?? '';
  }

}
