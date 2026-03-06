import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/api/auth/auth-service';
import { MatIconButton } from '@angular/material/button';
import { Category } from '../category/category';
import { Vendor } from '../vendor/vendor';
import { RouterLink, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, RouterModule,
  MatCardModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  private auth = inject(AuthService);

  logout() {
    console.log('Logging out user');
    this.auth.logout();
  }

}
