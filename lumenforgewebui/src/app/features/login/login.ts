import { Component, effect, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  constructor() {
    effect(() => {
      if(this.authService.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  signIn() {
    this.authService.login();
  }
}
