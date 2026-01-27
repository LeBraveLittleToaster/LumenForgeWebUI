// src/api/role/roleApi.ts
import type { AxiosInstance } from "axios";

import type { RoleDTO, RoleId, RoleRequestDTO } from "../types/role";
import type { Page } from "../types/device";
import { getAxiosWithAuthInterceptor } from "../axios";

export interface GetRolesPageParams {
  page?: number; // 0-based
  size?: number;
  sort?: string | string[];
  search?: string;
}

export class RolesApi {
  private readonly http: AxiosInstance;
  private readonly basePath: string;

  constructor(opts: { baseUrl: string; basePath?: string }) {
    this.http = getAxiosWithAuthInterceptor(opts.baseUrl);
    this.basePath = opts.basePath ?? "/api/v1/user/roles";
  }

  async getPage(params: GetRolesPageParams = {}): Promise<Page<RoleDTO>> {
    const { data } = await this.http.get<Page<RoleDTO>>(this.basePath, {
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

  async getAll(): Promise<RoleDTO[]> {
    const { data } = await this.http.get<RoleDTO[]>(this.basePath);
    return data;
  }

  async getById(id: RoleId): Promise<RoleDTO> {
    const { data } = await this.http.get<RoleDTO>(`${this.basePath}/${id}`);
    return data;
  }

  async create(payload: RoleRequestDTO): Promise<RoleDTO> {
    const { data } = await this.http.post<RoleDTO>(this.basePath, payload);
    return data;
  }

  async update(id: RoleId, payload: RoleRequestDTO): Promise<RoleDTO> {
    const { data } = await this.http.put<RoleDTO>(`${this.basePath}/${id}`, payload);
    return data;
  }

  async remove(id: RoleId): Promise<void> {
    await this.http.delete(`${this.basePath}/${id}`);
  }
}
