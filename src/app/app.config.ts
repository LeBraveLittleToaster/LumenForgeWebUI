import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideApiClient } from '@lumenforge/api-client';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideApiClient({
      authApiBaseUrl: 'https://localhost:7217',
      inventoryApiBaseUrl: 'https://localhost:7217'
    })
  ]
};
