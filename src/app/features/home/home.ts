import { Component, inject } from '@angular/core';
import { AuthService } from '@lumenforge/api-client';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly firstName = inject(AuthService).user()?.firstName ?? 'Guest';
  readonly lastName = inject(AuthService).user()?.lastName ?? '';
}
