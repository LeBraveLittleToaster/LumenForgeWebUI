// Example usage (page) - ProductsPage.tsx
import * as React from "react";
import { Box, Button, Stack } from "@mui/material";

import { DeviceTable, type DeviceRow } from "./deviceTable";
import { useDeviceStore } from "~/stores/devicestore";
import { DeviceTablePagination } from "./deviceTablePagination";
import { DevicesApi } from "~/api/device/deviceApi";


const ALL_ROWS: DeviceRow[] = [
  { id: "1", name: "Apple iPhone 15", category: "Phone", brand: "Apple", color: "Black", stock: 13, price: 829.99 },
  { id: "2", name: "Apple iPhone 14", category: "Phone", brand: "Apple", color: "Black", stock: 15, price: 396 },
];

export function DevicePage() {
  const devicesApi = new DevicesApi({ baseUrl: "http://localhost:1324" });
  const [search, setSearch] = React.useState("");

  const setTotal = useDeviceStore((s) => s.setTotal);
  const page = useDeviceStore((s) => s.page);
  const pageSize = useDeviceStore((s) => s.pageSize);

  React.useEffect(() => {

    setTotal(300);
  }, [setTotal]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_ROWS;
    return ALL_ROWS.filter((r) =>
      [r.name, r.category, r.brand, r.color].some((v) => v.toLowerCase().includes(q))
    );
  }, [search]);

  const paged = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const runOnClick = () => {
    devicesApi.getAll().then((devices) => {

      console.log("Fetched devices:", devices);
    }).catch((error) => {
      console.error("Error fetching devices:", error);
    });

  }

  return (
    <Stack spacing={2}>
      <Button onClick={() => runOnClick()}>TestButton</Button>
      <DeviceTable
        rows={paged}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          useDeviceStore.getState().setPage(1);
        }}
        onAdd={() => console.log("add")}
        onFilter={() => console.log("filter")}
        onView={(id) => console.log("view", id)}
        onEdit={(id) => console.log("edit", id)}
        onDelete={(id) => console.log("delete", id)}
      />

      <DeviceTablePagination
        onPageChange={(nextPage, nextPageSize) => {
          console.log("fetch page", nextPage, "size", nextPageSize);
        }}
      />
    </Stack>
  );
}
