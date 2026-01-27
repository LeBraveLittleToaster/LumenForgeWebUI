// src/api/types/user.ts
import type { GroupDTO, GroupId } from "./group";
import type { RoleDTO, RoleId } from "./role";

export type UserId = string;

export interface UserDTO {
  id: UserId;
  username: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  enabled?: boolean;
  roles?: RoleDTO[];
  groups?: GroupDTO[];
}

export interface UserRequestDTO {
  username: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  enabled?: boolean;
  roleIds?: RoleId[];
  groupIds?: GroupId[];
}
