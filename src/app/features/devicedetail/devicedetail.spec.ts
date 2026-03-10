import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Devicedetail } from './devicedetail';
import { InventoryApiClient } from '@lumenforge/api-client';

describe('Devicedetail', () => {
  let component: Devicedetail;
  let fixture: ComponentFixture<Devicedetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Devicedetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ deviceGuid: 'device-1' }))
          }
        },
        {
          provide: InventoryApiClient,
          useValue: {
            getDevice: () => of({
              guid: 'device-1',
              serial_number: 'SN-1',
              purchase_price: 1,
              purchase_date: '2026-01-01',
              maintenance_status_uuid: 'status-1',
              maintenance_status_name: 'Ok',
              vendor: { guid: 'vendor-1', name: 'Vendor', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
              stock: null,
              parameters: [],
              categories: [],
              created_at: '2026-01-01T00:00:00Z',
              updated_at: '2026-01-01T00:00:00Z'
            })
          }
        },
        {
          provide: Location,
          useValue: {
            back: () => {}
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Devicedetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
