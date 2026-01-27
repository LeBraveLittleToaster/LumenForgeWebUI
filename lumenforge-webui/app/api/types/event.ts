// src/api/types/event.ts

export type EventStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED";

export interface EventAssignmentUserDTO {
  id: number;
  username?: string | null;
  displayName?: string | null;
}

export interface EventAssignmentDeviceDTO {
  id: number;
  name?: string | null;
}

export interface EventDTO {
  id: number;
  name: string;
  description: string | null;
  scheduleStart: string; // ISO datetime
  scheduleEnd: string; // ISO datetime
  status: EventStatus;
  assignedUsers: EventAssignmentUserDTO[];
  assignedDevices: EventAssignmentDeviceDTO[];
}

export interface EventRequestDTO {
  name: string;
  description: string | null;
  scheduleStart: string;
  scheduleEnd: string;
  status: EventStatus;
  userIds: number[];
  deviceIds: number[];
}

export interface AssignPersonnelRequest {
  userIds: number[];
}

export interface AssignEquipmentRequest {
  deviceIds: number[];
}
