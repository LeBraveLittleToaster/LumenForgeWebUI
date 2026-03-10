import { Routes } from '@angular/router';
import { Admin } from './features/admin/admin';
import { User } from './features/user/user';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { adminGuard, authGuard, permissionGuard } from './core/api/auth/auth.guard';
import { Dashboard } from './features/dashboard/dashboard';
import { Category } from './features/category/category';
import { Vendor } from './features/vendor/vendor';
import { Groups } from './features/groups/groups';
import { UserDetail } from './features/userdetail/userdetail';
import { Groupdetail } from './features/groupdetail/groupdetail';
import { UserCreate } from './features/usercreate/usercreate';
import { GroupCreate } from './features/groupcreate/groupcreate';
import { Profile } from './features/profile/profile';
import { Inventory } from './features/inventory/inventory';
import { InventoryCreate } from './features/inventory/inventory-create';
import { Devicedetail } from './features/devicedetail/devicedetail';
import { Permissions } from './core/api/auth/models/dtos';

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
        path: "profile",
        canActivate: [authGuard],
        component: Profile
    },
    {
        path: "inventory",
        canActivate: [authGuard, permissionGuard(
            Permissions.DeviceRead,
            Permissions.DeviceCreate,
            Permissions.DeviceUpdate,
            Permissions.DeviceDelete
        )],
        component: Inventory,
    },
    {
        path: "inventory/create",
        canActivate: [authGuard, permissionGuard(Permissions.DeviceCreate)],
        component: InventoryCreate,
    },
    {
        path: "inventory/:deviceGuid",
        canActivate: [authGuard, permissionGuard(Permissions.DeviceRead)],
        component: Devicedetail,
    },
    {
        path: "admin",
        canActivate: [adminGuard],
        component: Admin,
    },
    {
        path: "admin/categories",
        canActivate: [authGuard, permissionGuard(Permissions.CategoryRead)],
        component: Category,
    },
    {
        path: "admin/vendor",
        canActivate: [authGuard, permissionGuard(Permissions.VendorRead)],
        component: Vendor,
    },
    {
        path: "admin/groups",
        canActivate: [authGuard, permissionGuard(Permissions.GroupRead)],
        component: Groups,
    },
    {
        path: "admin/groups/create",
        canActivate: [authGuard, permissionGuard(Permissions.GroupCreate)],
        component: GroupCreate,
    },
    {
        path: "admin/groups/:groupGuid",
        canActivate: [authGuard, permissionGuard(Permissions.GroupRead)],
        component: Groupdetail,
    },
    {
        path: "admin/users",
        canActivate: [authGuard, permissionGuard(Permissions.UserRead)],
        component: User,
    },
    {
        path: "admin/users/create",
        canActivate: [authGuard, permissionGuard(Permissions.UserCreate)],
        component: UserCreate,
    },
    {
        path: "admin/users/:userKcId",
        canActivate: [authGuard, permissionGuard(Permissions.UserRead)],
        component: UserDetail,
    }
];
