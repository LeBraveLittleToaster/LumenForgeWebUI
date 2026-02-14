import { Routes } from '@angular/router';
import { Admin } from './features/admin/admin';
import { User } from './features/user/user';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { adminGuard, authGuard } from './core/auth/auth.guard';
import { Dashboard } from './app/features/dashboard/dashboard';

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
        component: Admin
    }
];
