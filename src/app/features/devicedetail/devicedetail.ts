import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, EMPTY, filter, map, Observable, of, startWith, switchMap } from 'rxjs';

import { InventoryApiClient, DeviceParameterView, DeviceView } from '@lumenforge/api-client';
import { DeviceAddParameterDialogComponent } from './device-add-parameter-dialog.component';
import { DeviceAssignCategoriesDialogComponent } from './device-assign-categories-dialog.component';
import { DeviceUpdateParameterDialogComponent } from './device-update-parameter-dialog.component';
import { DeleteConfirmDialogComponent } from '../../shared/data-table/data-table';

interface DeviceDetailState {
  loading: boolean;
  device: DeviceView | null;
  error: string | null;
}

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
  state$!: Observable<DeviceDetailState>;
  private readonly refreshTrigger$ = new BehaviorSubject<void>(undefined);

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
  }

  goBack(): void {
    this.location.back();
  }

  openAssignCategoriesDialog(device: DeviceView): void {
    const ref = this.dialog.open(DeviceAssignCategoriesDialogComponent, {
      width: '520px',
      data: {
        deviceGuid: device.guid,
        assignedCategoryGuids: (device.categories ?? []).map(category => category.guid)
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

  formatStock(device: DeviceView): string {
    if (!device.stock) {
      return 'No stock record';
    }
    return `${device.stock.stock_count} ${device.stock.stock_unit_type}`;
  }

  get hasPhoto(): (device: DeviceView | null) => boolean {
    return (device) => !!device?.photo_url;
  }

}
