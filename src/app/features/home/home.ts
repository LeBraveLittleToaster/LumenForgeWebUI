import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@lumenforge/api-client';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly firstName = this.auth.user()?.firstName ?? 'Guest';
  readonly lastName = this.auth.user()?.lastName ?? '';

  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  createRentalRequest(): void {
    this.router.navigateByUrl('/rental');
  }
}
