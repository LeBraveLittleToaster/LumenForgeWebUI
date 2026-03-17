import { Component, inject, OnInit, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { InventoryApiClient, CreateDeviceDto, DeviceView, VendorView } from '@lumenforge/api-client';
import { BehaviorSubject, catchError, EMPTY, finalize, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inventory-create',
  standalone: true,
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './inventory-create.html',
  styleUrl: './inventory-create.scss',
})
export class InventoryCreate implements OnInit {
  constructor(@Inject(InventoryApiClient) private inventoryApiClient: InventoryApiClient, private router: Router) {}

  private _formBuilder = inject(FormBuilder);
  private isSendingSubject = new BehaviorSubject<boolean>(false);
  isSending$ = this.isSendingSubject.asObservable();

  vendors: VendorView[] = [];

  firstFormGroup = this._formBuilder.group({
    serialNumberCtrl: ['', Validators.required],
    nameCtrl: [''],
    descriptionCtrl: [''],
  });

  secondFormGroup = this._formBuilder.group({
    vendorCtrl: ['', Validators.required],
    purchasePriceCtrl: ['', Validators.required],
    purchaseDateCtrl: ['', Validators.required],
  });

  thirdFormGroup = this._formBuilder.group({
    stockUnitTypeCtrl: ['pcs', Validators.required],
    stockCountCtrl: [0, Validators.required],
  });

  isLinear = false;

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors(): void {
    this.inventoryApiClient.listVendors({}).subscribe(result => {
      this.vendors = result.list;
    });
  }

  createDevice(): void {
    if (this.firstFormGroup.invalid || this.secondFormGroup.invalid || this.thirdFormGroup.invalid) {
      this.firstFormGroup.markAllAsTouched();
      this.secondFormGroup.markAllAsTouched();
      this.thirdFormGroup.markAllAsTouched();
      return;
    }

    this.isSendingSubject.next(true);

    const purchaseDateValue = this.secondFormGroup.controls.purchaseDateCtrl.value as any;
    let dateStr: string;
    
    if (purchaseDateValue instanceof Date) {
      dateStr = purchaseDateValue.toISOString().split('T')[0];
    } else if (typeof purchaseDateValue === 'string') {
      dateStr = purchaseDateValue;
    } else {
      console.error('Invalid purchase date');
      this.isSendingSubject.next(false);
      return;
    }

    const dto: CreateDeviceDto = {
      serialNumber: this.firstFormGroup.controls.serialNumberCtrl.value!,
      name: this.firstFormGroup.controls.nameCtrl.value || undefined,
      description: this.firstFormGroup.controls.descriptionCtrl.value || undefined,
      vendorGuid: this.secondFormGroup.controls.vendorCtrl.value!,
      purchasePrice: parseFloat(this.secondFormGroup.controls.purchasePriceCtrl.value!.toString()),
      purchaseDate: dateStr,
      stock: {
        stockUnitType: this.thirdFormGroup.controls.stockUnitTypeCtrl.value!,
        stockCount: parseInt(this.thirdFormGroup.controls.stockCountCtrl.value!.toString()),
      },
    };

    this.inventoryApiClient.createDevice(dto).pipe(
      catchError((error: any) => {
        console.log(error);
        this.isSendingSubject.next(false);
        return EMPTY;
      }),
      finalize(() => {
        this.isSendingSubject.next(false);
      })
    ).subscribe((deviceView: DeviceView) => {
      this.router.navigate(['/inventory']);
    });
  }
}
