// src/api/group/groupApi.ts
import type { AxiosInstance } from "axios";

import type { GroupDTO, GroupId, GroupRequestDTO } from "../types/group";
import type { Page } from "../types/device";
import { getAxiosWithAuthInterceptor } from "../axios";

export interface GetGroupsPageParams {
  page?: number; // 0-based
  size?: number;
  sort?: string | string[];
  search?: string;
}

export class GroupsApi {
  private readonly http: AxiosInstance;
  private readonly basePath: string;

  constructor(opts: { baseUrl: string; basePath?: string }) {
    this.http = getAxiosWithAuthInterceptor(opts.baseUrl);
    this.basePath = opts.basePath ?? "/api/v1/user/groups";
  }

  async getPage(params: GetGroupsPageParams = {}): Promise<Page<GroupDTO>> {
    const { data } = await this.http.get<Page<GroupDTO>>(this.basePath, {
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

  async getAll(): Promise<GroupDTO[]> {
    const { data } = await this.http.get<GroupDTO[]>(this.basePath);
    return data;
  }

  async getById(id: GroupId): Promise<GroupDTO> {
    const { data } = await this.http.get<GroupDTO>(`${this.basePath}/${id}`);
    return data;
  }

  async create(payload: GroupRequestDTO): Promise<GroupDTO> {
    const { data } = await this.http.post<GroupDTO>(this.basePath, payload);
    return data;
  }

  async update(id: GroupId, payload: GroupRequestDTO): Promise<GroupDTO> {
    const { data } = await this.http.put<GroupDTO>(`${this.basePath}/${id}`, payload);
    return data;
  }

  async remove(id: GroupId): Promise<void> {
    await this.http.delete(`${this.basePath}/${id}`);
  }
}
