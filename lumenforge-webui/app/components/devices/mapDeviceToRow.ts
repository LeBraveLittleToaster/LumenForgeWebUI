import type { DeviceAndStockDTO, DeviceDTO } from "~/api/types/device";
import type { DeviceRow } from "./deviceTable";

export function mapDeviceToRow(d: DeviceAndStockDTO): DeviceRow {
  return {
    id: d.uuid,
    name: d.name,
    vendor: d.vendorName,
    stock: d.stockCount,
    stockUnit: d.stockUnitType
  };
}