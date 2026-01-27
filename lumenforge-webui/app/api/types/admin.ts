export interface AdminUserDTO {
  id: number;
  username: string;
  displayName: string | null;
  email: string | null;
  active: boolean;
}

export interface AdminGroupDTO {
  id: number;
  name: string;
  description: string | null;
  memberCount: number;
}
