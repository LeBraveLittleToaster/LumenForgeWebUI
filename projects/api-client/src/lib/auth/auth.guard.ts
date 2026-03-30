import { CanActivateFn } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "./auth-service";
import { Router } from "@angular/router";
import { Permissions } from "./models/dtos";
import { RentalScopes, ScopeLevel } from "./models/views";

function accessDeniedTree() {
    const router = inject(Router);
    return router.createUrlTree(['/dashboard']);
}

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

        if (authService.hasAnyPermission(...required)) {
            return true;
        }

        return accessDeniedTree();
    };
}

/**
 * Factory that creates a guard requiring a rental scope level for an operation.
 */
export function rentalScopeGuard(operation: keyof RentalScopes, ...levels: ScopeLevel[]): CanActivateFn {
    const requiredLevels: ScopeLevel[] = levels.length > 0 ? levels : ['Own', 'Group', 'OwnAndGroup', 'All'];
    return () => {
        const authService = inject(AuthService);

        if (authService.hasRentalScopeLevel(operation, ...requiredLevels)) {
            return true;
        }

        return accessDeniedTree();
    };
}
