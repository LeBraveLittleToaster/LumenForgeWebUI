import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-admin',
  imports: [MatIconButton],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private auth = inject(AuthService);

  logout() {
    console.log('Logging out user');
    this.auth.logout();
  }
}
