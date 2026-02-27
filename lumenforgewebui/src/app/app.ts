import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule, MatIconButton} from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { AuthService } from './core/api/auth/auth-service';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, MatToolbar, MatIconButton, MatIconModule, MatButtonModule, RouterLink, MatMenuModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly auth = inject(AuthService);
  
  readonly isAuthenticated = this.auth.isAuthenticated();
  readonly isAdmin = this.auth.isAdmin();

  protected readonly title = signal('lumenforgewebui');
  
}
