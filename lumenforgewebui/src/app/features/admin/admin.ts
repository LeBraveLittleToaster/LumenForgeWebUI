import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/api/auth/auth-service';
import { RouterLink, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, RouterModule, MatCardModule, MatIconModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  private auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }
}
