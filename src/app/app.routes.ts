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
import {
    RentalActionApproveExtensionPage,
    RentalActionApproveItemsPage,
    RentalActionApproveRequestPage,
    RentalActionAssignItemsPage,
    RentalActionCancelPage,
    RentalActionCompletePage,
    RentalActionCreateMaintenanceJobsPage,
    RentalActionGenerateChecklistPage,
    RentalActionGenerateInvoicePage,
    RentalActionGenerateReportPage,
    RentalActionRecordDamagesPage,
    RentalActionRecordPaymentPage,
    RentalActionRecordPickupPage,
    RentalActionRecordReturnPage,
    RentalActionRejectExtensionPage,
    RentalActionRejectItemsPage,
    RentalActionRejectRequestPage,
    RentalActionRemoveItemsPage,
    RentalActionRequestExtensionPage,
    RentalActionScanChecklistPage,
    RentalActionScrapPage,
    RentalActionSignChecklistPage,
} from './features/rental-detail/rental-action-pages';

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
        path: 'rental/:processGuid',
        canActivate: [authGuard, permissionGuard(Permissions.RentalRead)],
        component: RentalDetail,
    },
    {
        path: 'rental/:processGuid/actions/approve-request',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionApproveRequestPage,
    },
    {
        path: 'rental/:processGuid/actions/reject-request',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRejectRequestPage,
    },
    {
        path: 'rental/:processGuid/actions/assign-items',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionAssignItemsPage,
    },
    {
        path: 'rental/:processGuid/actions/remove-items',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRemoveItemsPage,
    },
    {
        path: 'rental/:processGuid/actions/approve-items',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionApproveItemsPage,
    },
    {
        path: 'rental/:processGuid/actions/reject-items',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRejectItemsPage,
    },
    {
        path: 'rental/:processGuid/actions/generate-checklist',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionGenerateChecklistPage,
    },
    {
        path: 'rental/:processGuid/actions/scan-checklist',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionScanChecklistPage,
    },
    {
        path: 'rental/:processGuid/actions/sign-checklist',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionSignChecklistPage,
    },
    {
        path: 'rental/:processGuid/actions/record-pickup',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRecordPickupPage,
    },
    {
        path: 'rental/:processGuid/actions/record-return',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRecordReturnPage,
    },
    {
        path: 'rental/:processGuid/actions/request-extension',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRequestExtensionPage,
    },
    {
        path: 'rental/:processGuid/actions/approve-extension',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionApproveExtensionPage,
    },
    {
        path: 'rental/:processGuid/actions/reject-extension',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRejectExtensionPage,
    },
    {
        path: 'rental/:processGuid/actions/record-damages',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRecordDamagesPage,
    },
    {
        path: 'rental/:processGuid/actions/create-maintenance-jobs',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionCreateMaintenanceJobsPage,
    },
    {
        path: 'rental/:processGuid/actions/generate-invoice',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionGenerateInvoicePage,
    },
    {
        path: 'rental/:processGuid/actions/record-payment',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRecordPaymentPage,
    },
    {
        path: 'rental/:processGuid/actions/generate-report',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionGenerateReportPage,
    },
    {
        path: 'rental/:processGuid/actions/complete',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionCompletePage,
    },
    {
        path: 'rental/:processGuid/actions/cancel',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionCancelPage,
    },
    {
        path: 'rental/:processGuid/actions/scrap',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionScrapPage,
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
