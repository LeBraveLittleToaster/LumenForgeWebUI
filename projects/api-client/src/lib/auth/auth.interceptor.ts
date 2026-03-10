import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth-service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  var pathname = new URL(req.url).pathname;
  const isApiRequest = pathname.startsWith('/api');

  console.log('Intercepting request:', req.url, 'Is API request:', isApiRequest);
  if (!isApiRequest || !authService.isAuthenticated()) {
    return next(req);
  }

  console.log('Adding auth token to request:', req.url);

  return from(authService.getValidToken()).pipe(
    switchMap((token) => {
      console.log("Got token from AuthService:", token);
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
