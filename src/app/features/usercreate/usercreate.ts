import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { Router, RouterLink } from '@angular/router';
import { AuthApiClient, AddKcUserDto, UserView } from '@lumenforge/api-client';
import { validate } from '@angular/forms/signals';
import { BehaviorSubject, catchError, EMPTY, finalize, Observable } from 'rxjs';

@Component({
  selector: 'app-usercreate',
  imports: [
    CommonModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './usercreate.html',
  styleUrl: './usercreate.scss'
})
export class UserCreate {
  constructor(@Inject(AuthApiClient) private apiClient: AuthApiClient, private router: Router) { }

  private _formBuilder = inject(FormBuilder);
  private isSendingSubject = new BehaviorSubject<boolean>(false);
  isSending$ = this.isSendingSubject.asObservable();

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

    firstNameCtrl: ['', Validators.minLength(5)],
    lastNameCtrl: ['', Validators.minLength(5)],
  });
  secondFormGroup = this._formBuilder.group({
    usernameCtrl: ['', Validators.minLength(5)],
    emailCtrl: ['', Validators.email],
    passwordCtrl: ['', Validators.minLength(8)],
    passwordConfirmCtrl: ['', Validators.minLength(8)],
  }, { validators: this.passwordMatchValidator });
  isLinear = true;

  createUser() {
    if (this.firstFormGroup.invalid || this.secondFormGroup.invalid) {
      this.firstFormGroup.markAllAsTouched();
      this.secondFormGroup.markAllAsTouched();
      return;
    }
    this.isSendingSubject.next(true);
    this.apiClient.registerUser({
      firstName: this.firstFormGroup.controls.firstNameCtrl.value!,
      lastName: this.firstFormGroup.controls.lastNameCtrl.value!,
      username: this.secondFormGroup.controls.usernameCtrl.value!,
      email: this.secondFormGroup.controls.emailCtrl.value!,
      password: this.secondFormGroup.controls.passwordCtrl.value!

    }).pipe(
      catchError((error: any, caught: Observable<UserView>) => {
        console.log(error);
        this.isSendingSubject.next(false);
        return EMPTY;
      }),
      finalize(() => {
        this.isSendingSubject.next(false);
      })
    ).subscribe((userView) => {
      this.router.navigate(['/admin/users'])
    })
  }
}
