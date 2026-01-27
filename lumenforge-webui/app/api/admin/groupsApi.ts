import type { AxiosInstance } from "axios";

import { getAxiosWithAuthInterceptor } from "../axios";
import type { AdminGroupDTO } from "../types/admin";

export class GroupsApi {
  private readonly http: AxiosInstance;
  private readonly basePath: string;

  constructor(opts: { baseUrl: string; basePath?: string }) {
    this.http = getAxiosWithAuthInterceptor(opts.baseUrl);
    this.basePath = opts.basePath ?? "/api/v1/admin/groups";
  }

  async getAll(): Promise<AdminGroupDTO[]> {
    const { data } = await this.http.get<AdminGroupDTO[]>(this.basePath);
    return data;
  }
}
