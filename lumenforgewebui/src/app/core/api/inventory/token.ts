import { InjectionToken } from '@angular/core';

/**
 * Base URL for the API.
 * This token can be provided in the application's root module or any feature module to configure the API base URL.
 */
export const INVENTORY_API_BASE_URL = new InjectionToken<string>(
  'INVENTORY_API_BASE_URL',
  { factory: () => '' }
);