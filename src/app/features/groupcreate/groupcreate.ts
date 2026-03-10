import { Component, inject, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { Router, RouterLink } from '@angular/router';
import { AuthApiClient, AddGroupDto, AddKcUserDto, GroupView, Permissions, UserView } from '@lumenforge/api-client';
import { validate } from '@angular/forms/signals';
import { BehaviorSubject, catchError, EMPTY, finalize, Observable } from 'rxjs';
import { MatDivider } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-groupcreate',
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDivider,
    MatListModule,
    CommonModule,
    MatCheckboxModule
  ],
  templateUrl: './groupcreate.html',
  styleUrl: './groupcreate.scss'
})
export class GroupCreate {
  constructor(@Inject(AuthApiClient) private apiClient: AuthApiClient, private router: Router) { }

  private _formBuilder = inject(FormBuilder);
  private isSendingSubject = new BehaviorSubject<boolean>(false);
  isSending$ = this.isSendingSubject.asObservable();

  roleEntries = Object.keys(Permissions)
    .filter(key => isNaN(Number(key)) && key !== 'None')
    .map(key => ({
      name: key,
      value: Permissions[key as keyof typeof Permissions]
    }));

  selectAllRoles(rowIdx: number | undefined) {
    if (rowIdx === undefined) {
      this.roleEntries.forEach(role => {
        this.secondFormGroup.get(`role_${role.value}`)?.setValue(true);
      });
    } else {
      this.roleEntries.slice(rowIdx, rowIdx + 4).forEach(role => {
        this.secondFormGroup.get(`role_${role.value}`)?.setValue(true);
      });
    }
  }

  deselectAllRoles(rowIdx: number | undefined) {
    if (rowIdx === undefined) {
      this.roleEntries.forEach(role => {
        this.secondFormGroup.get(`role_${role.value}`)?.setValue(false);
      });
    } else {
      this.roleEntries.slice(rowIdx, rowIdx + 4).forEach(role => {
        this.secondFormGroup.get(`role_${role.value}`)?.setValue(false);
      });
    }
  }

  passwordMatchValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const password = control.get('passwordCtrl')?.value;
    const confirm = control.get('passwordConfirmCtrl')?.value;

    if (!password || !confirm) {
      return null;
    }

    return password === confirm ? null : { passwordMismatch: true };
  };

  firstFormGroup = this._formBuilder.group({
    groupNameCtrl: ['', Validators.minLength(5)],
    groupDescriptionCtrl: ['', Validators.minLength(5)],
  });

  secondFormGroup = this._formBuilder.group(
    this.roleEntries.reduce((controls, role) => {
      controls[`role_${role.value}`] = [false];
      return controls;
    }, {} as any)
  );
  isLinear = false;

  getSelectedRoles(): string[] {
    return this.roleEntries
      .filter(role => this.secondFormGroup.get(`role_${role.value}`)?.value === true)
      .map(role => role.name);
  }

  getSelectedRoleValues(): Permissions[] {
    return this.roleEntries
      .filter(role => this.secondFormGroup.get(`role_${role.value}`)?.value === true)
      .map(role => role.value);
  }

  createUser() {
    if (this.firstFormGroup.invalid || this.secondFormGroup.invalid) {
      this.firstFormGroup.markAllAsTouched();
      this.secondFormGroup.markAllAsTouched();
      return;
    }
    this.isSendingSubject.next(true);
    const selectedRoles = this.getSelectedRoleValues();
    this.apiClient.createGroup({
      name: this.firstFormGroup.controls.groupNameCtrl.value!,
      description: this.firstFormGroup.controls.groupDescriptionCtrl.value!,
      roles: selectedRoles
    } as AddGroupDto).pipe(
      catchError((error: any, caught: Observable<GroupView>) => {
        console.log(error);
        this.isSendingSubject.next(false);
        return EMPTY;
      }),
      finalize(() => {
        this.isSendingSubject.next(false);
      })
    ).subscribe((groupView) => {
      this.router.navigate(['/admin/groups'])
    })
  }
}
