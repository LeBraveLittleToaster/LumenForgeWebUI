import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

@Component({
  standalone: true,
  selector: "app-login-page",
  imports: [MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <section class="page">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-icon aria-hidden="true">lock</mat-icon>
          <div>
            <mat-card-title>Sign in</mat-card-title>
            <mat-card-subtitle>Access the LumenForge control center</mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput placeholder="name@company.com" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" placeholder="••••••••" />
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions>
          <button mat-flat-button color="primary">Continue</button>
          <button mat-button>Use SSO</button>
        </mat-card-actions>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        place-items: start;
      }

      .login-card {
        width: min(420px, 100%);
      }

      mat-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      mat-form-field {
        width: 100%;
        margin-bottom: 12px;
      }

      mat-icon {
        color: #3949ab;
      }
    `,
  ],
})
export class LoginPageComponent {}
