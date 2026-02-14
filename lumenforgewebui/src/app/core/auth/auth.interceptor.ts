import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth-service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  const isApiRequest = req.url.startsWith('/api');

  if (!isApiRequest || !authService.isAuthenticated()) {
    return next(req);
  }

  console.log('Adding auth token to request:', req.url);

  return from(authService.getValidToken()).pipe(
    switchMap((token) => {
      if (!token) return next(req);
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next(authReq);
    })
  );
};