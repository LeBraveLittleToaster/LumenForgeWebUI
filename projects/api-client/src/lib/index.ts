/**
 * Core exports - Common types, tokens, and utilities
 */
export { type Guid, type IsoDate, type IsoInstant, type StockUnitType } from './core/common';
export { toHttpParams, type Primitive } from './core/http-params';
export { AUTH_API_BASE_URL, CATALOGUE_API_BASE_URL, INVENTORY_API_BASE_URL, MAINTENANCE_API_BASE_URL, RENTAL_API_BASE_URL } from './core/tokens';
export { type ListQueryDto } from './core/models/query';

/**
 * Catalogue API exports
 */
export { CatalogueApiClient } from './catalogue/catalogue-api.client';
export {
  type CreateCatalogueItemDto,
  type UpdateCatalogueItemDto,
} from './catalogue/models/dtos';
export {
  type CatalogueItemView,
  type CatalogueListView,
} from './catalogue/models/views';
export { type CatalogueListQueryDto, type CatalogueItemQueryDto } from './catalogue/models/query';

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
  type CreateDeviceRelationDto,
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
  type PaginatedList,
  type CategoryView,
  type VendorView,
  type DeviceParameterView,
  type StockView,
  type DeviceView,
  type DeviceRelationView,
  type DeviceRelationType,
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
  type CreateMaintenanceTaskDto,
  type CreateMaintenanceJobDto,
  type UpdateMaintenanceJobDto,
  type CreateMaintenanceBacklogDto,
  type UpdateMaintenanceBacklogDto,
} from './maintenance/models/dtos';
export {
  type MaintenanceStatusView,
  type MaintenanceTaskView,
  type MaintenanceJobView,
  type MaintenanceBacklogView,
  type ListView as MaintenanceListView,
} from './maintenance/models/views';
export { type MaintenanceQueryDto } from './maintenance/models/query';

/**
 * Rental API exports
 */
export { RentalApiClient } from './rental/rental-api.client';
export {
  type ApproveItemsDto,
  type ApproveRequestDto,
  type ApproveExtensionDto,
  type AssignItemsDto,
  type CancelRentalDto,
  type CompleteRentalDto,
  type CreateMaintenanceJobsDto,
  type CreateRentalFormInput,
  type CreateRentalDto,
  type DamageEntryDto,
  type GenerateChecklistDto,
  type GenerateInvoiceDto,
  type GenerateReportDto,
  type ItemAssignmentDto,
  type RecordDamagesDto,
  type RecordPaymentDto,
  type RecordPickupDto,
  type RecordReturnDto,
  type RejectExtensionDto,
  type RejectItemsDto,
  type RejectRequestDto,
  type RemoveItemsDto,
  type RequestExtensionDto,
  type ScanChecklistDto,
  type ScrapRentalDto,
  type SignChecklistDto,
} from './rental/models/dtos';
export {
  type QuestionView,
  type QuestionDataType,
  type DamageSeverity,
  type AnswerView,
  type RentalView,
  type RentalProcessView,
  type RentalProcessSummaryView,
  type RentalPriority,
  type RentalActionType,
  type RentalActionView,
  type RentalActionLogView,
  type RentalExtensionView,
  type RentalDamageReportView,
  type StockBindingView,
  type ChecklistView,
  type ChecklistItemView,
  type StockBindingConflictView,
  type ChecklistType,
  type BindingType,
  type PaymentMethod,
  type RentalSortField,
  type RentalStage,
  type ActionResultView,
  type CreateRentalResultView,
  type GenerateChecklistResultView,
  type GenerateInvoiceResultView,
  type RequestExtensionResultView,
  type CreateMaintenanceJobsResultView,
  type RentalReportSummaryView,
  type GenerateReportResultView,
  type RentalOverviewDto,
  type RentalRecentActivityDto,
} from './rental/models/views';
export {
  type RentalQueryDto,
  type RentalHistoryQueryDto,
  type RentalInclude,
} from './rental/models/query';
