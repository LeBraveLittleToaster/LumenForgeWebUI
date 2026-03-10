/**
 * Provider function for the api-client library
 * Use this in your application's app.config.ts to set up the API client services
 *
 * Example:
 * ```typescript
 * import { provideApiClient } from '@lumenforge/api-client';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideApiClient({
 *       authApiBaseUrl: 'https://localhost:7217',
 *       inventoryApiBaseUrl: 'https://localhost:7217',
 *       keycloakConfig: { ... }
 *     })
 *   ]
 * };
 * ```
 */

import { Provider, APP_INITIALIZER, EnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AUTH_API_BASE_URL, INVENTORY_API_BASE_URL } from './core/tokens';
import { authInterceptor } from './auth/auth.interceptor';
import { AuthService } from './auth/auth-service';

export interface ApiClientConfig {
  authApiBaseUrl?: string;
  inventoryApiBaseUrl?: string;
}

/**
 * Provides the API client library with HTTP client, interceptor, and auth service initialization
 * @param config Configuration for API base URLs
 * @returns Array of providers to include in ApplicationConfig
 */
export function provideApiClient(config?: ApiClientConfig): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(
      withInterceptors([authInterceptor]),
    ),
    {
      provide: AUTH_API_BASE_URL,
      useValue: config?.authApiBaseUrl || 'https://localhost:7217'
    },
    {
      provide: INVENTORY_API_BASE_URL,
      useValue: config?.inventoryApiBaseUrl || 'https://localhost:7217'
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.init(),
      deps: [AuthService],
      multi: true
    }
  ];
}
