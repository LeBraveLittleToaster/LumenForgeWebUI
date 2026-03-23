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
import { RentalActionApproveRequest } from './features/rental-detail/actions/rental-action-approve-request/rental-action-approve-request';
import { RentalActionRejectRequest } from './features/rental-detail/actions/rental-action-reject-request/rental-action-reject-request';
import { RentalActionAssignItems } from './features/rental-detail/actions/rental-action-assign-items/rental-action-assign-items';
import { RentalActionRemoveItems } from './features/rental-detail/actions/rental-action-remove-items/rental-action-remove-items';
import { RentalActionApproveItems } from './features/rental-detail/actions/rental-action-approve-items/rental-action-approve-items';
import { RentalActionRejectItems } from './features/rental-detail/actions/rental-action-reject-items/rental-action-reject-items';
import { RentalActionGenerateChecklist } from './features/rental-detail/actions/rental-action-generate-checklist/rental-action-generate-checklist';
import { RentalActionScanChecklist } from './features/rental-detail/actions/rental-action-scan-checklist/rental-action-scan-checklist';
import { RentalActionSignChecklist } from './features/rental-detail/actions/rental-action-sign-checklist/rental-action-sign-checklist';
import { RentalActionRecordPickup } from './features/rental-detail/actions/rental-action-record-pickup/rental-action-record-pickup';
import { RentalActionRecordReturn } from './features/rental-detail/actions/rental-action-record-return/rental-action-record-return';
import { RentalActionRequestExtension } from './features/rental-detail/actions/rental-action-request-extension/rental-action-request-extension';
import { RentalActionApproveExtension } from './features/rental-detail/actions/rental-action-approve-extension/rental-action-approve-extension';
import { RentalActionRejectExtension } from './features/rental-detail/actions/rental-action-reject-extension/rental-action-reject-extension';
import { RentalActionRecordDamages } from './features/rental-detail/actions/rental-action-record-damages/rental-action-record-damages';
import { RentalActionCreateMaintenanceJobs } from './features/rental-detail/actions/rental-action-create-maintenance-jobs/rental-action-create-maintenance-jobs';
import { RentalActionGenerateInvoice } from './features/rental-detail/actions/rental-action-generate-invoice/rental-action-generate-invoice';
import { RentalActionRecordPayment } from './features/rental-detail/actions/rental-action-record-payment/rental-action-record-payment';
import { RentalActionGenerateReport } from './features/rental-detail/actions/rental-action-generate-report/rental-action-generate-report';
import { RentalActionComplete } from './features/rental-detail/actions/rental-action-complete/rental-action-complete';
import { RentalActionCancel } from './features/rental-detail/actions/rental-action-cancel/rental-action-cancel';
import { RentalActionScrap } from './features/rental-detail/actions/rental-action-scrap/rental-action-scrap';

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
        component: RentalActionApproveRequest,
    },
    {
        path: 'rental/:processGuid/actions/reject-request',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRejectRequest,
    },
    {
        path: 'rental/:processGuid/actions/assign-items',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionAssignItems,
    },
    {
        path: 'rental/:processGuid/actions/remove-items',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRemoveItems,
    },
    {
        path: 'rental/:processGuid/actions/approve-items',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionApproveItems,
    },
    {
        path: 'rental/:processGuid/actions/reject-items',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRejectItems,
    },
    {
        path: 'rental/:processGuid/actions/generate-checklist',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionGenerateChecklist,
    },
    {
        path: 'rental/:processGuid/actions/scan-checklist',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionScanChecklist,
    },
    {
        path: 'rental/:processGuid/actions/sign-checklist',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionSignChecklist,
    },
    {
        path: 'rental/:processGuid/actions/record-pickup',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRecordPickup,
    },
    {
        path: 'rental/:processGuid/actions/record-return',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRecordReturn,
    },
    {
        path: 'rental/:processGuid/actions/request-extension',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRequestExtension,
    },
    {
        path: 'rental/:processGuid/actions/approve-extension',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionApproveExtension,
    },
    {
        path: 'rental/:processGuid/actions/reject-extension',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRejectExtension,
    },
    {
        path: 'rental/:processGuid/actions/record-damages',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRecordDamages,
    },
    {
        path: 'rental/:processGuid/actions/create-maintenance-jobs',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionCreateMaintenanceJobs,
    },
    {
        path: 'rental/:processGuid/actions/generate-invoice',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionGenerateInvoice,
    },
    {
        path: 'rental/:processGuid/actions/record-payment',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionRecordPayment,
    },
    {
        path: 'rental/:processGuid/actions/generate-report',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionGenerateReport,
    },
    {
        path: 'rental/:processGuid/actions/complete',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionComplete,
    },
    {
        path: 'rental/:processGuid/actions/cancel',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionCancel,
    },
    {
        path: 'rental/:processGuid/actions/scrap',
        canActivate: [authGuard, permissionGuard(Permissions.RentalUpdate)],
        component: RentalActionScrap,
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
