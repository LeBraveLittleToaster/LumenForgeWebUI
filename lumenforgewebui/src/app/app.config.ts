import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/api/auth/auth-service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/api/auth/auth.interceptor';
import { INVENTORY_API_BASE_URL } from './core/api/inventory/token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.init(),
      deps: [AuthService],
      multi: true
    },
    provideHttpClient(
      withInterceptors([authInterceptor]),
    ),
    { provide: INVENTORY_API_BASE_URL, useValue: 'https://localhost:7217' }
  ]
};
