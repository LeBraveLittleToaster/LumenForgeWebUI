import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import Keycloak from 'keycloak-js';

export type UserRole = 'REALM_OWNER' | 'REALM_ADMIN' | 'REALM_USER' | 'anonymous';

export interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: UserRole[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'lumenforge-realm',
    clientId: 'lumenforge'
  });

  private _isInitialized = signal(false);
  private _profile = signal<UserProfile | null>(null);

  readonly isInitialized = this._isInitialized.asReadonly();
  
  readonly isAuthenticated = computed(() => !!this._profile());

  readonly user = computed(() => this._profile());

  readonly isOwner = computed(() => 
    this.keycloak.hasRealmRole('REALM_OWNER')
  );

  readonly isAdmin = computed(() => 
    this.keycloak.hasRealmRole('REALM_ADMIN') || this.isOwner()
  );

  readonly role = computed<UserRole>(() => {
    if (this.isOwner()) return 'REALM_OWNER';
    if (this.isAdmin()) return 'REALM_ADMIN';
    if (this.isAuthenticated()) return 'REALM_USER';
    return 'anonymous';
  });

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
        roles: (this.keycloak.realmAccess?.roles as UserRole[]) || []
      });
      
      console.log('Profile loaded from token:', this._profile());
    } else {
      this._profile.set(null);
    }
      
      this._isInitialized.set(true);
    } catch (error) {
      console.error('Keycloak initialization failed', error);
      this.logout();
      this._isInitialized.set(true);
    }
  }

  login(): void {
    this.keycloak.login();
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
      await this.keycloak.updateToken(30); // Refresh if token expires in < 30s
      return this.keycloak.token;
    } catch (error) {
      this.login(); // Force login if refresh fails
      return undefined;
    }
  }

}