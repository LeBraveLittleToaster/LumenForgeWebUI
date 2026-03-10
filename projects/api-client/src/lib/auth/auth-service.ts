import { Injectable, signal, computed } from '@angular/core';
import Keycloak from 'keycloak-js';
import { AuthApiClient } from './auth-api.client';
import { Permissions } from './models/dtos';

export interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private authApiClient: AuthApiClient) {

  }

  private keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'lumenforge-realm',
    clientId: 'lumenforge'
  });

  private _isInitialized = signal(false);
  private _profile = signal<UserProfile | null>(null);
  private _permissions = signal<Set<Permissions>>(new Set());

  readonly isInitialized = this._isInitialized.asReadonly();
  readonly isAuthenticated = computed(() => !!this._profile());
  readonly user = computed(() => this._profile());
  readonly permissions = this._permissions.asReadonly();

  /** True when the user holds at least one admin-level permission. */
  readonly isAdmin = computed(() =>
    this.hasAnyPermission(
      Permissions.UserRead, Permissions.GroupRead,
      Permissions.CategoryRead, Permissions.VendorRead
    )
  );

  /** Returns true if the user has ALL of the given permissions. */
  hasPermission(...perms: Permissions[]): boolean {
    const current = this._permissions();
    return perms.every(p => current.has(p));
  }

  /** Returns true if the user has ANY of the given permissions. */
  hasAnyPermission(...perms: Permissions[]): boolean {
    const current = this._permissions();
    return perms.some(p => current.has(p));
  }

  async init(): Promise<void> {
    console.log('Initializing Keycloak...');
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        enableLogging: true,
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256'
      });

      console.log('Keycloak initialized. Authenticated:', authenticated);


      if (authenticated) {
        const token = this.keycloak.tokenParsed as any;

        this._profile.set({
          id: token.sub,
          username: token.preferred_username,
          email: token.email,
          firstName: token.given_name,
          lastName: token.family_name,
        });

        // Load groups & derive permissions
        try {
          const user = await this.authApiClient.getUser(token.sub, true).toPromise();
          const permSet = new Set<Permissions>();
          for (const group of user?.groups ?? []) {
            for (const name of group.permissions ?? []) {
              const val = Permissions[name as keyof typeof Permissions];
              if (val !== undefined) {
                permSet.add(val);
              }
            }
          }
          this._permissions.set(permSet);
        } catch (e) {
          console.error('Failed to load user groups/permissions', e);
        }

      } else {
        this._profile.set(null);
        this._permissions.set(new Set());
      }

      this._isInitialized.set(true);
    } catch (error) {
      console.error('Keycloak initialization failed', error);
      this.logout();
      this._isInitialized.set(true);
    }
  }

  login(): void {
    this.keycloak.login({
      loginHint: 'initial_admin_user'
    });
  }

  logout(): void {
    this.keycloak.logout({
      redirectUri: window.location.origin
    });
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  async getValidToken(): Promise<string | undefined> {
    try {
      await this.keycloak.updateToken(30);
      return this.keycloak.token;
    } catch (error) {
      this.login();
      return undefined;
    }
  }

}
