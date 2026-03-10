import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { catchError, distinctUntilChanged, filter, map, Observable, of, startWith, switchMap } from 'rxjs';

import { InventoryApiClient, DeviceView } from '@lumenforge/api-client';

interface DeviceDetailState {
  loading: boolean;
  device: DeviceView | null;
  error: string | null;
}

@Component({
  selector: 'app-devicedetail',
  imports: [
    CommonModule,
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
  readonly parameterColumns = ['key', 'value', 'updated_at'];
  state$!: Observable<DeviceDetailState>;

  constructor(
    private route: ActivatedRoute,
    @Inject(InventoryApiClient) private inventoryApiClient: InventoryApiClient,
    private location: Location
  ) {}

  ngOnInit(): void {
    const deviceGuid$ = this.route.paramMap.pipe(
      map(params => params.get('deviceGuid')),
      filter((guid): guid is string => !!guid),
      distinctUntilChanged()
    );

    this.state$ = deviceGuid$.pipe(
      switchMap(deviceGuid =>
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
