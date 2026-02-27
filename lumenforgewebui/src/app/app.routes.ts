import { Routes } from '@angular/router';
import { Admin } from './features/admin/admin';
import { User } from './features/user/user';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { adminGuard, authGuard } from './core/api/auth/auth.guard';
import { Dashboard } from './features/dashboard/dashboard';
import { Category } from './features/category/category';
import { Vendor } from './features/vendor/vendor';

export const routes: Routes = [
    {
        path: '',
        component: Home,
        pathMatch: "full"
    },
    {
        path: "login",
        component: Login
    },
    {
        path: "dashboard",
        canActivate: [authGuard],
        component: Dashboard
    },
    {
        path: "admin",
        canActivate: [adminGuard],
        component: Admin,
    },
    {
        path: "admin/categories",
        canActivate: [adminGuard],
        component: Category,
    },
    {
        path: "admin/vendor",
        canActivate: [adminGuard],
        component: Vendor,
    }
];
