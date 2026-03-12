/**
 * Generated from the provided C# DTO/domain files.
 *
 * Type mapping
 * - Guid        -> string
 * - NodaTime.Instant -> string (ISO-8601 timestamp)
 */

export type Guid = string;
export type InstantString = string;

/** From Role.cs */
export enum Permissions {
  // Inventory
  DeviceCreate = 10,
  DeviceRead = 11,
  DeviceUpdate = 12,
  DeviceDelete = 13,

  VendorCreate = 20,
  VendorRead = 21,
  VendorUpdate = 22,
  VendorDelete = 23,

  CategoryCreate = 30,
  CategoryRead = 31,
  CategoryUpdate = 32,
  CategoryDelete = 33,

  StockCreate = 40,
  StockRead = 41,
  StockUpdate = 42,
  StockDelete = 43,

  // Maintenance
  MaintenanceCreate = 50,
  MaintenanceRead = 51,
  MaintenanceUpdate = 52,
  MaintenanceDelete = 53,

  RentalCreate = 60,
  RentalRead = 61,
  RentalUpdate = 62,
  RentalDelete = 63,

  RentalStatusCreate = 70,
  RentalStatusRead = 71,
  RentalStatusUpdate = 72,
  RentalStatusDelete = 73,

  InvoiceCreate = 80,
  InvoiceRead = 81,
  InvoiceUpdate = 82,
  InvoiceDelete = 83,

  InvoiceStatusCreate = 90,
  InvoiceStatusRead = 91,
  InvoiceStatusUpdate = 92,
  InvoiceStatusDelete = 93,

  // Roles
  RoleRead = 101,
  RoleUpdate = 102,
  RoleDelete = 103,

  // Groups
  GroupCreate = 200,
  GroupRead = 201,
  GroupUpdate = 202,
  GroupDelete = 203,

  // Users
  UserCreate = 300,
  UserRead = 301,
  UserUpdate = 302,
  UserDelete = 303,
}

/** From GroupRole.cs */
export interface GroupRole {
  groupId: number;
  roleId: Permissions;
}

/**From KcUserReference.cs */
export interface KcUserReference {
  joinedAt : InstantString,
  userKcId: string;
}

/** From GroupUser.cs */
export interface GroupUser {
  groupId: number;
  userId: number;
  kcUserReference: KcUserReference;
  joinedAt: InstantString;
  assignedByKeycloakId?: string | null;
}

/** From AddGroupDto.cs */
export interface AddGroupDto {
  name: string;
  description: string;
  roles: Permissions[];
}

/** From UpdateGroupDto.cs */
export interface UpdateGroupDto {
  name?: string | null;
  description?: string | null;
}

/** From AddUserDto.cs */
export interface AddUserDto {
  userKcId: string;
}

/**
 * From AddUserDto.cs
 */
export interface AddKcUserDto {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

/** From UpdateUserDto.cs */
export interface UpdateUserDto {
  newUserKcId?: string;
  firstName?: string;
  lastName?: string;
}

/** From AssignDtos.cs */
export interface AssignUserToGroupDto {
  assigneeKcId?: string | null;
  userKcId: string;
}

/** From AssignGroupRolesDto.cs */
export interface AssignGroupRolesDto {
  roles: Permissions[];
}
