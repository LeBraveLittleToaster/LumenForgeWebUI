// store/paginationStore.ts
import { create } from "zustand";

type DeviceStoreState = {
  page: number; // 1-based
  pageSize: number;
  total: number;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotal: (total: number) => void;

  totalPages: () => number;
  clampPage: (page?: number) => number;
};

export const useDeviceStore = create<DeviceStoreState>((set, get) => ({
  page: 1,
  pageSize: 10,
  total: 300,

  setPage: (page) => set({ page: Math.max(1, Math.floor(page || 1)) }),
  setPageSize: (pageSize) =>
    set({
      pageSize: Math.max(1, Math.floor(pageSize || 10)),
      page: 1, // reset to first page when page size changes
    }),
  setTotal: (total) => set({ total: Math.max(0, Math.floor(total || 0)) }),

  totalPages: () => Math.max(1, Math.ceil(get().total / get().pageSize)),
  clampPage: (page) => {
    const p = page ?? get().page;
    return Math.min(Math.max(1, p), get().totalPages());
  },
}));
