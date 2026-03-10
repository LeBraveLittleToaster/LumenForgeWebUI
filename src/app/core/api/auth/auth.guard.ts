import { CanActivateFn } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../auth/auth-service";
import { Router } from "@angular/router";
import { Permissions } from "./models/dtos";

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

/**
 * Factory that creates a guard requiring at least one of the given permissions.
 */
export function permissionGuard(...required: Permissions[]): CanActivateFn {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.hasAnyPermission(...required)) {
            return true;
        }

        return router.createUrlTree(['/dashboard']);
    };
}