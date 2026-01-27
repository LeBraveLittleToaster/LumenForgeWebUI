import type { AxiosInstance } from "axios";

import { getAxiosWithAuthInterceptor } from "../axios";
import type { EventDTO } from "../types/event";

export class EventsApi {
  private readonly http: AxiosInstance;
  private readonly basePath: string;

  constructor(opts: { baseUrl: string; basePath?: string }) {
    this.http = getAxiosWithAuthInterceptor(opts.baseUrl);
    this.basePath = opts.basePath ?? "/api/v1/events";
  }

  async getAll(): Promise<EventDTO[]> {
    const { data } = await this.http.get<EventDTO[]>(this.basePath);
    return data;
  }
}
