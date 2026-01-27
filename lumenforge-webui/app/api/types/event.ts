export interface EventDTO {
  id: number;
  title: string;
  startsAt: string | null;
  location: string | null;
  status: "scheduled" | "active" | "completed" | "cancelled" | string;
}
