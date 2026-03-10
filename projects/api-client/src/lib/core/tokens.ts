import { InjectionToken } from '@angular/core';

/**
 * Base URL for the Auth API.
 * This token can be provided in the application's root module or any feature module to configure the API base URL.
 */
export const AUTH_API_BASE_URL = new InjectionToken<string>(
  'AUTH_API_BASE_URL',
  { factory: () => 'https://localhost:7217' }
);

/**
 * Base URL for the Inventory API.
 * This token can be provided in the application's root module or any feature module to configure the API base URL.
 */
export const INVENTORY_API_BASE_URL = new InjectionToken<string>(
  'INVENTORY_API_BASE_URL',
  { factory: () => '' }
);

/**
 * Base URL for the Maintenance API.
 * This token can be provided in the application's root module or any feature module to configure the API base URL.
 */
export const MAINTENANCE_API_BASE_URL = new InjectionToken<string>(
  'MAINTENANCE_API_BASE_URL',
  { factory: () => '' }
);
