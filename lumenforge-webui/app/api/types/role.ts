// src/api/types/role.ts
export type RoleId = string;

export interface RoleDTO {
  id: RoleId;
  name: string;
  description?: string | null;
  composite?: boolean;
  clientRole?: boolean;
  containerId?: string | null;
}

export interface RoleRequestDTO {
  name: string;
  description?: string | null;
  composite?: boolean;
  clientRole?: boolean;
  containerId?: string | null;
}
