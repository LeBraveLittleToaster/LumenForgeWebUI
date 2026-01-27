// src/api/user/userApi.ts
import type { AxiosInstance } from "axios";

import type { GroupId } from "../types/group";
import type { RoleId } from "../types/role";
import type { UserDTO, UserId, UserRequestDTO } from "../types/user";
import type { Page } from "../types/device";
import { getAxiosWithAuthInterceptor } from "../axios";

export interface GetUsersPageParams {
  page?: number; // 0-based
  size?: number;
  sort?: string | string[];
  search?: string;
}

export class UsersApi {
  private readonly http: AxiosInstance;
  private readonly basePath: string;

  constructor(opts: { baseUrl: string; basePath?: string }) {
    this.http = getAxiosWithAuthInterceptor(opts.baseUrl);
    this.basePath = opts.basePath ?? "/api/v1/user/users";
  }

  async getPage(params: GetUsersPageParams = {}): Promise<Page<UserDTO>> {
    const { data } = await this.http.get<Page<UserDTO>>(this.basePath, {
      params,
      paramsSerializer: {
        serialize: (p) => {
          const usp = new URLSearchParams();
          for (const [k, v] of Object.entries(p ?? {})) {
            if (v === undefined || v === null) continue;
            if (Array.isArray(v)) v.forEach((vv) => usp.append(k, String(vv)));
            else usp.append(k, String(v));
          }
          return usp.toString();
        },
      },
    });
    return data;
  }

  async getAll(): Promise<UserDTO[]> {
    const { data } = await this.http.get<UserDTO[]>(this.basePath);
    return data;
  }

  async getById(id: UserId): Promise<UserDTO> {
    const { data } = await this.http.get<UserDTO>(`${this.basePath}/${id}`);
    return data;
  }

  async create(payload: UserRequestDTO): Promise<UserDTO> {
    const { data } = await this.http.post<UserDTO>(this.basePath, payload);
    return data;
  }

  async update(id: UserId, payload: UserRequestDTO): Promise<UserDTO> {
    const { data } = await this.http.put<UserDTO>(`${this.basePath}/${id}`, payload);
    return data;
  }

  async remove(id: UserId): Promise<void> {
    await this.http.delete(`${this.basePath}/${id}`);
  }

  async assignRoles(userId: UserId, roleIds: RoleId[]): Promise<UserDTO> {
    const { data } = await this.http.put<UserDTO>(`${this.basePath}/${userId}/roles`, {
      roleIds,
    });
    return data;
  }

  async addUserToGroup(userId: UserId, groupId: GroupId): Promise<UserDTO> {
    const { data } = await this.http.post<UserDTO>(
      `${this.basePath}/${userId}/groups/${groupId}`
    );
    return data;
  }

  async removeUserFromGroup(userId: UserId, groupId: GroupId): Promise<UserDTO> {
    const { data } = await this.http.delete<UserDTO>(
      `${this.basePath}/${userId}/groups/${groupId}`
    );
    return data;
  }
}
