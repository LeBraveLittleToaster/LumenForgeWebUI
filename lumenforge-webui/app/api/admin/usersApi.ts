import type { AxiosInstance } from "axios";

import { getAxiosWithAuthInterceptor } from "../axios";
import type { AdminUserDTO } from "../types/admin";

export class UsersApi {
  private readonly http: AxiosInstance;
  private readonly basePath: string;

  constructor(opts: { baseUrl: string; basePath?: string }) {
    this.http = getAxiosWithAuthInterceptor(opts.baseUrl);
    this.basePath = opts.basePath ?? "/api/v1/admin/users";
  }

  async getAll(): Promise<AdminUserDTO[]> {
    const { data } = await this.http.get<AdminUserDTO[]>(this.basePath);
    return data;
  }
}
