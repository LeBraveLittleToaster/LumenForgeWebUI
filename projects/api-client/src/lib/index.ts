/**
 * Core exports - Common types, tokens, and utilities
 */
export { type Guid, type IsoDate, type IsoInstant, type StockUnitType } from './core/common';
export { toHttpParams, type Primitive } from './core/http-params';
export { AUTH_API_BASE_URL, INVENTORY_API_BASE_URL, MAINTENANCE_API_BASE_URL, RENTAL_API_BASE_URL } from './core/tokens';
export { type ListQueryDto } from './core/models/query';

/**
 * Auth API exports
 */
export { AuthApiClient } from './auth/auth-api.client';
export { AuthService, type UserProfile } from './auth/auth-service';
export { authInterceptor } from './auth/auth.interceptor';
export { authGuard, adminGuard, permissionGuard } from './auth/auth.guard';
// Auth models
export {
  type Guid as AuthGuid,
  type InstantString,
  Permissions,
  type GroupRole,
  type KcUserReference,
  type GroupUser,
  type AddGroupDto,
  type UpdateGroupDto,
  type AddUserDto,
  type AddKcUserDto,
  type UpdateUserDto,
  type AssignUserToGroupDto,
  type AssignGroupRolesDto,
} from './auth/models/dtos';
export { type UserView, type GroupView, type RoleViewDto, type ListView } from './auth/models/views';
export { type ListQueryDto as AuthListQueryDto } from './auth/models/query';

/**
 * Inventory API exports
 */
export { InventoryApiClient } from './inventory/inventory-api.client';
// Inventory models
export {
  type CreateDeviceParameterDto,
  type CreateStockDto,
  type CreateDeviceDto,
  type UpdateDeviceDto,
  type UpdateStockDto,
  type SetDeviceCategoriesDto,
  type UpsertDeviceParameterDto,
  type CreateCategoryDto,
  type UpdateCategoryDto,
  type CreateVendorDto,
  type UpdateVendorDto,
} from './inventory/models/dtos';
export {
  type CategoryView,
  type VendorView,
  type DeviceParameterView,
  type StockView,
  type DeviceView,
} from './inventory/models/views';
export { type ListQueryDto as InventoryListQueryDto } from './inventory/models/query';

/**
 * Maintenance API exports
 */
export { MaintenanceApiClient } from './maintenance/maintenance-api.client';
// Maintenance models
export {
  type CreateMaintenanceStatusDto,
  type UpdateMaintenanceStatusDto,
  type CreateMaintenanceBacklogDto,
  type UpdateMaintenanceBacklogDto,
} from './maintenance/models/dtos';
export {
  type MaintenanceStatusView,
  type MaintenanceBacklogView,
  type ListView as MaintenanceListView,
} from './maintenance/models/views';
export { type MaintenanceQueryDto } from './maintenance/models/query';

/**
 * Rental API exports
 */
export { RentalApiClient } from './rental/rental-api.client';
