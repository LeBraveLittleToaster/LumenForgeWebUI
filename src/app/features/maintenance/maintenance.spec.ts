import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService, MaintenanceApiClient } from '@lumenforge/api-client';

import { Maintenance } from './maintenance';

describe('Maintenance', () => {
  let component: Maintenance;
  let fixture: ComponentFixture<Maintenance>;

  beforeEach(async () => {
    const maintenanceApiClientStub = {
      listJobs: () => of({ list: [], total: 0 }),
      deleteJob: () => of(void 0),
    } as Partial<MaintenanceApiClient>;

    const authServiceStub = {
      hasPermission: () => true,
    } as Partial<AuthService>;

    await TestBed.configureTestingModule({
      imports: [Maintenance],
      providers: [
        { provide: MaintenanceApiClient, useValue: maintenanceApiClientStub },
        { provide: AuthService, useValue: authServiceStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Maintenance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
