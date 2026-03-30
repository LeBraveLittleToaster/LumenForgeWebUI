import { Injectable, signal, computed } from '@angular/core';
import Keycloak from 'keycloak-js';
import { AuthApiClient } from './auth-api.client';
import { Permissions } from './models/dtos';
import { RentalScopes, ScopeLevel, UserView } from './models/views';
import { firstValueFrom } from 'rxjs';

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
  private _rentalScopes = signal<RentalScopes>(this.emptyRentalScopes());

  readonly isInitialized = this._isInitialized.asReadonly();
  readonly isAuthenticated = computed(() => !!this._profile());
  readonly user = computed(() => this._profile());
  readonly permissions = this._permissions.asReadonly();
  readonly rentalScopes = this._rentalScopes.asReadonly();

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

  hasRentalScope(operation: keyof RentalScopes): boolean {
    return this._rentalScopes()[operation] !== 'None';
  }

  hasRentalScopeLevel(operation: keyof RentalScopes, ...levels: ScopeLevel[]): boolean {
    return levels.includes(this._rentalScopes()[operation]);
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
          const user = await firstValueFrom(this.authApiClient.getUser(token.sub, true));
          const permSet = this.extractPermissions(user);
          this._permissions.set(permSet);
          this._rentalScopes.set(this.normalizeRentalScopes(user?.rental_scopes));
        } catch (e) {
          console.error('Failed to load user groups/permissions', e);
          this._rentalScopes.set(this.emptyRentalScopes());
        }

      } else {
        this._profile.set(null);
        this._permissions.set(new Set());
        this._rentalScopes.set(this.emptyRentalScopes());
      }

      this._isInitialized.set(true);
    } catch (error) {
      console.error('Keycloak initialization failed', error);
      this.logout();
      this._rentalScopes.set(this.emptyRentalScopes());
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

  private extractPermissions(user: UserView | null | undefined): Set<Permissions> {
    const permSet = new Set<Permissions>();

    const effectivePermissions = user?.effective_permissions ?? [];
    for (const permission of effectivePermissions) {
      const parsed = this.parsePermission(permission);
      if (parsed !== null) {
        permSet.add(parsed);
      }
    }

    if (permSet.size > 0) {
      return permSet;
    }

    for (const group of user?.groups ?? []) {
      for (const name of group.permissions ?? []) {
        const parsed = this.parsePermission(name);
        if (parsed !== null) {
          permSet.add(parsed);
        }
      }
    }

    return permSet;
  }

  private parsePermission(value: string | number): Permissions | null {
    if (typeof value === 'number' && Permissions[value] !== undefined) {
      return value as Permissions;
    }

    if (typeof value === 'string') {
      const named = Permissions[value as keyof typeof Permissions];
      if (typeof named === 'number') {
        return named as Permissions;
      }

      const asNumber = Number(value);
      if (Number.isFinite(asNumber) && Permissions[asNumber] !== undefined) {
        return asNumber as Permissions;
      }
    }

    return null;
  }

  private normalizeRentalScopes(scopes: RentalScopes | undefined): RentalScopes {
    return {
      read: scopes?.read ?? 'None',
      create: scopes?.create ?? 'None',
      update: scopes?.update ?? 'None',
      delete: scopes?.delete ?? 'None',
    };
  }

  private emptyRentalScopes(): RentalScopes {
    return {
      read: 'None',
      create: 'None',
      update: 'None',
      delete: 'None',
    };
  }

}
