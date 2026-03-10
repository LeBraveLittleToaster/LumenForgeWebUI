import { GroupUser } from "./dtos";

/**
 * Subset of the User class for API response
 * Source: UserViewDtos.cs
 */
export interface UserView {
  joined_at: string;      // Instant
  user_kc_id: string;
  group_users: GroupUser[];
  username: string,
  email: string;
  firstName: string;
  lastName: string;
  groups: GroupView[];
}

/**
 * Read model representing a group for API responses.
 * Source: GroupViewDtos.cs
 */
export interface GroupView {
  guid: string;           // Guid
  name: string;
  permissions: string[];
  description: string;
  created_at: string;     // Instant
  updated_at: string;     // Instant
}

/**
 * Represents an application role for API responses.
 * Source: RoleViewDto.cs
 */
export interface RoleViewDto {
  name: string;
  value: number;
}

export interface ListView<T> {
  list: T[];
  total: number;
}
