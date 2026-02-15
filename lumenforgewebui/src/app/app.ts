import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { AuthService } from './core/auth/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbar, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly auth = inject(AuthService);
  readonly isAuthenticated = this.auth.isAuthenticated();
  protected readonly title = signal('lumenforgewebui');
  
}
