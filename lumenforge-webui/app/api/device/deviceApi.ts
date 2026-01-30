// src/api/devices/devicesApi.ts
import type { AxiosInstance } from "axios";

import type { DeviceDTO, DeviceRequestDTO, SpringPage, UUID } from "../types/device";
import { getAxiosWithAuthInterceptor } from "../axios";

export interface GetDevicesPageParams {
  page?: number; // 0-based
  size?: number;
  sort?: string | string[]; // e.g. "name,asc" or ["name,asc","id,desc"]
  q?: string;
}

export class DevicesApi {
  private readonly http: AxiosInstance;
  private readonly basePath: string;

  constructor(opts: { baseUrl: string; basePath?: string }) {
    this.http = getAxiosWithAuthInterceptor(opts.baseUrl);
    this.basePath = opts.basePath ?? "/api/v1/user/devices";
  }

  async getPage(params: GetDevicesPageParams = {}): Promise<SpringPage<DeviceDTO>> {
    const { data } = await this.http.get<SpringPage<DeviceDTO>>(this.basePath, {
      params,
      paramsSerializer: {
        // Handles sort as repeated query params: sort=a&sort=b
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

  async getAll(): Promise<DeviceDTO[]> {
    const { data } = await this.http.get<DeviceDTO[]>(`${this.basePath}`);
    return data;
  }

  async getById(id: number): Promise<DeviceDTO> {
    const { data } = await this.http.get<DeviceDTO>(`${this.basePath}/${id}`);
    return data;
  }

  async getByUuid(uuid: UUID): Promise<DeviceDTO> {
    const { data } = await this.http.get<DeviceDTO>(`${this.basePath}/uuid/${uuid}`);
    return data;
  }

  async create(payload: DeviceRequestDTO): Promise<DeviceDTO> {
    const { data } = await this.http.post<DeviceDTO>(this.basePath, payload);
    return data;
  }

  async update(id: number, payload: DeviceRequestDTO): Promise<DeviceDTO> {
    const { data } = await this.http.put<DeviceDTO>(`${this.basePath}/${id}`, payload);
    return data;
  }

  async remove(id: number): Promise<void> {
    await this.http.delete(`${this.basePath}/${id}`);
  }
}
