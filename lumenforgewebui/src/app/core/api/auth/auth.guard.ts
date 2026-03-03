import { CanActivateFn } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../auth/auth-service";
import { Router } from "@angular/router";

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    return router.createUrlTree(
        ['/login'],
        { queryParams: { returnUrl: state.url } }
    );
}


export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAdmin()) {
        return true;
    }

    return router.createUrlTree(
        ['/login'],
        { queryParams: { returnUrl: state.url } }
    );
}