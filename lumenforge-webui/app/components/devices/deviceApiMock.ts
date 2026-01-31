import type { CategoryDTO, DeviceDTO, DeviceRequestDTO, MaintenanceStatusDTO, UUID, VendorDTO } from "~/api/types/device";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const vendors: VendorDTO[] = [
  { id: 1, name: "Acme Tools" },
  { id: 2, name: "Nordic Supply" },
];

const statuses: MaintenanceStatusDTO[] = [
  { id: 1, name: "OK" },
  { id: 2, name: "DUE" },
  { id: 3, name: "OVERDUE" },
];

const categories: CategoryDTO[] = [
  { id: 10, name: "Tools" },
  { id: 11, name: "Calibration" },
  { id: 12, name: "Safety" },
];

const db = new Map<UUID, DeviceDTO>([
  [
    "2d6b2c7e-0b7f-4b8b-9a0f-8e6e0c4a1b11",
    {
      id: 1,
      uuid: "2d6b2c7e-0b7f-4b8b-9a0f-8e6e0c4a1b11",
      serialNumber: "SN-12345",
      name: "Torque Wrench",
      description: "Calibrated torque wrench for assembly line A.",
      photoUrl: null,
      purchasePrice: 129.99,
      purchaseDate: "2024-10-12",
      vendor: vendors[0],
      maintenanceStatus: statuses[0],
      categories: [categories[0], categories[1]],
    },
  ],
]);

function clone<T>(x: T): T {
  // structuredClone is great, but not always available depending on tooling.
  return JSON.parse(JSON.stringify(x)) as T;
}

function requireDevice(uuid: UUID): DeviceDTO {
  const d = db.get(uuid);
  if (!d) {
    const err = new Error("Device not found");
    (err as any).status = 404;
    throw err;
  }
  return d;
}

export const mockDeviceApi = {
  async getDevice(uuid: UUID): Promise<DeviceDTO> {
    await sleep(350);
    return clone(requireDevice(uuid));
  },

  async updateDevice(uuid: UUID, req: DeviceRequestDTO): Promise<DeviceDTO> {
    await sleep(450);

    // Small chance of failure to test UI resilience.
    if (Math.random() < 0.08) {
      const err = new Error("Mock API: random failure, try again.");
      (err as any).status = 503;
      throw err;
    }

    const current = requireDevice(uuid);

    const vendor = vendors.find((v) => v.id === req.vendorId);
    if (!vendor) throw new Error("Invalid vendorId");

    const status = statuses.find((s) => s.id === req.maintenanceStatusId);
    if (!status) throw new Error("Invalid maintenanceStatusId");

    const nextCategories =
      req.categoryIds === null
        ? []
        : req.categoryIds
            .map((id) => categories.find((c) => c.id === id))
            .filter(Boolean) as CategoryDTO[];

    const updated: DeviceDTO = {
      ...current,
      serialNumber: req.serialNumber,
      name: req.name,
      description: req.description,
      photoUrl: req.photoUrl,
      purchasePrice: req.purchasePrice,
      purchaseDate: req.purchaseDate,
      vendor,
      maintenanceStatus: status,
      categories: nextCategories,
    };

    db.set(uuid, updated);
    return clone(updated);
  },

  async listVendors(): Promise<VendorDTO[]> {
    await sleep(150);
    return clone(vendors);
  },

  async listMaintenanceStatuses(): Promise<MaintenanceStatusDTO[]> {
    await sleep(150);
    return clone(statuses);
  },

  async listCategories(): Promise<CategoryDTO[]> {
    await sleep(150);
    return clone(categories);
  },
};
