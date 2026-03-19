import { Routes } from '@angular/router';
import { Admin } from './features/admin/admin';
import { User } from './features/user/user';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { adminGuard, authGuard, permissionGuard, Permissions } from '@lumenforge/api-client';
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
import { Maintenance } from './features/maintenance/maintenance';
import { MaintenanceJobCreate } from './features/maintenance/maintenance-job-create';
import { MaintenanceJobDetail } from './features/maintenance/maintenance-job-detail';
import { Rental } from './features/rental/rental';
import { RentalDetail } from './features/rental-detail/rental-detail';
import { RentalRequest } from './features/rental-request/rental-request';
import { RentalTransitionApprove } from './features/rental-detail/rental-transition-approve';
import { RentalTransitionReject } from './features/rental-detail/rental-transition-reject';
import { RentalTransitionCancel } from './features/rental-detail/rental-transition-cancel';
import { RentalTransitionPickup } from './features/rental-detail/rental-transition-pickup';
import { RentalTransitionReturn } from './features/rental-detail/rental-transition-return';
import { RentalTransitionGeneric } from './features/rental-detail/rental-transition-generic';

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
        path: 'maintenance',
        canActivate: [authGuard, permissionGuard(
            Permissions.MaintenanceRead,
            Permissions.MaintenanceCreate,
            Permissions.MaintenanceUpdate,
            Permissions.MaintenanceDelete
        )],
        component: Maintenance,
    },
    {
        path: 'maintenance/jobs/:jobGuid',
        canActivate: [authGuard, permissionGuard(Permissions.MaintenanceRead)],
        component: MaintenanceJobDetail,
    },
    {
        path: 'maintenance/create',
        canActivate: [authGuard, permissionGuard(Permissions.MaintenanceCreate)],
        component: MaintenanceJobCreate,
    },
    {
        path: 'rental',
        canActivate: [authGuard, permissionGuard(
            Permissions.RentalRead,
            Permissions.RentalUpdate,
            Permissions.RentalDelete,
        )],
        component: Rental,
    },
    {
        path: 'rental/create',
        canActivate: [authGuard, permissionGuard(Permissions.RentalCreate)],
        component: RentalRequest,
    },
    {
        path: 'rental/:rentalGuid',
        canActivate: [authGuard, permissionGuard(Permissions.RentalRead)],
        component: RentalDetail,
    },
    {
        path: 'rental/:rentalGuid/approve/:statusGuid',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalTransitionApprove,
    },
    {
        path: 'rental/:rentalGuid/reject/:statusGuid',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalTransitionReject,
    },
    {
        path: 'rental/:rentalGuid/cancel/:statusGuid',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalTransitionCancel,
    },
    {
        path: 'rental/:rentalGuid/pickup/:statusGuid',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalTransitionPickup,
    },
    {
        path: 'rental/:rentalGuid/return/:statusGuid',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalTransitionReturn,
    },
    {
        path: 'rental/:rentalGuid/transition/:statusGuid',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalTransitionGeneric,
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
