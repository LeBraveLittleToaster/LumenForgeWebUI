// src/api/types/group.ts
export type GroupId = string;

export interface GroupDTO {
  id: GroupId;
  name: string;
  path?: string | null;
  parentId?: GroupId | null;
  subGroupCount?: number;
}

export interface GroupRequestDTO {
  name: string;
  parentId?: GroupId | null;
}
