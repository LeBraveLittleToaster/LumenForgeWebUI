export interface MaintenanceStatusOption {
  value: number;
  label: string;
}

export const MAINTENANCE_STATUS_OPTIONS: MaintenanceStatusOption[] = [
  { value: 0, label: 'Reported' },
  { value: 1, label: 'Triaged' },
  { value: 2, label: 'Diagnosing' },
  { value: 3, label: 'Repair In Progress' },
  { value: 4, label: 'Awaiting Verification' },
  { value: 5, label: 'Resolved' },
  { value: 6, label: 'Closed' },
];

export function getMaintenanceStatusLabel(status: number): string {
  const option = MAINTENANCE_STATUS_OPTIONS.find(item => item.value === status);
  return option?.label ?? `Status ${status}`;
}
