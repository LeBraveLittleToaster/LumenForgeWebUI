import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { provideApiClient } from '@lumenforge/api-client';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        width: 'min(1200px, 96vw)',
        maxWidth: '96vw',
        height: '92vh',
        maxHeight: '95vh',
        panelClass: 'lf-app-dialog'
      }
    },
    provideApiClient({
      authApiBaseUrl: 'https://localhost:7217',
      inventoryApiBaseUrl: 'https://localhost:7217',
      rentalApiBaseUrl: 'https://localhost:7217'
    })
  ]
};
