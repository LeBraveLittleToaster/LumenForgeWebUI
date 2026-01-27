// src/api/event/eventApi.ts
import type { AxiosInstance } from "axios";

import type {
  AssignEquipmentRequest,
  AssignPersonnelRequest,
  EventDTO,
  EventRequestDTO,
} from "../types/event";
import { getAxiosWithAuthInterceptor } from "../axios";

export class EventsApi {
  private readonly http: AxiosInstance;
  private readonly basePath: string;

  constructor(opts: { baseUrl: string; basePath?: string }) {
    this.http = getAxiosWithAuthInterceptor(opts.baseUrl);
    this.basePath = opts.basePath ?? "/events";
  }

  async getAll(): Promise<EventDTO[]> {
    const { data } = await this.http.get<EventDTO[]>(this.basePath);
    return data;
  }

  async getById(id: number): Promise<EventDTO> {
    const { data } = await this.http.get<EventDTO>(`${this.basePath}/${id}`);
    return data;
  }

  async create(payload: EventRequestDTO): Promise<EventDTO> {
    const { data } = await this.http.post<EventDTO>(this.basePath, payload);
    return data;
  }

  async update(id: number, payload: EventRequestDTO): Promise<EventDTO> {
    const { data } = await this.http.put<EventDTO>(`${this.basePath}/${id}`, payload);
    return data;
  }

  async remove(id: number): Promise<void> {
    await this.http.delete(`${this.basePath}/${id}`);
  }

  async assignPersonnel(eventId: number, userIds: number[]): Promise<EventDTO> {
    const payload: AssignPersonnelRequest = { userIds };
    const { data } = await this.http.post<EventDTO>(
      `${this.basePath}/${eventId}/assign-personnel`,
      payload
    );
    return data;
  }

  async assignEquipment(eventId: number, deviceIds: number[]): Promise<EventDTO> {
    const payload: AssignEquipmentRequest = { deviceIds };
    const { data } = await this.http.post<EventDTO>(
      `${this.basePath}/${eventId}/assign-equipment`,
      payload
    );
    return data;
  }
}
