import type { DeviceDTO } from "~/api/types/device";
import type { DeviceRow } from "./deviceTable";

export function mapDeviceToRow(d: DeviceDTO): DeviceRow {
  return {
    id: String(d.id),
    name: d.name,
    category: d.categories?.length ? d.categories.map((c) => c.name).join(", ") : "-",
    brand: d.vendor?.name ?? "-",
    color: d.maintenanceStatus?.name ?? "-",   // placeholder column
    stock: 0,                                  // not in DTO
    price: d.purchasePrice ?? 0,
  };
}