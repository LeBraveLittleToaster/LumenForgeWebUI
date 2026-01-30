// ProductsPage.tsx (DevicePage)
import * as React from "react";
import { Button, Stack } from "@mui/material";

import { DeviceTable, type DeviceRow } from "./deviceTable";
import { DeviceTablePagination } from "./deviceTablePagination";
import { useDeviceStore } from "~/stores/devicestore";

import { mapDeviceToRow } from "./mapDeviceToRow";
import { DevicesApi } from "~/api/device/deviceApi";


const devicesApi = new DevicesApi({ baseUrl: "http://localhost:1324" });

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function DevicePage() {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounced(search, 250);

  const [rows, setRows] = React.useState<DeviceRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const setTotal = useDeviceStore((s) => s.setTotal);
  const page = useDeviceStore((s) => s.page);         // 1-based
  const pageSize = useDeviceStore((s) => s.pageSize); // size
  const setPage = useDeviceStore((s) => s.setPage);
  const setPageSize = useDeviceStore((s) => s.setPageSize);

  const fetchPage = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await devicesApi.getPage({
        page: Math.max(0, page - 1),          // convert to 0-based
        size: pageSize,
        sort: ["name,asc", "id,asc"],
        q: debouncedSearch.trim() || undefined, // will work once backend supports it
      });

      setTotal(result.totalElements);
      setRows(result.content.map(mapDeviceToRow));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load devices");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, setTotal]);

  React.useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return (
    <Stack spacing={2}>
      
      <DeviceTable
        rows={rows}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1); // reset pagination when searching
        }}
        onAdd={() => console.log("add")}
        onFilter={() => console.log("filter")}
        onView={(id) => console.log("view", id)}
        onEdit={(id) => console.log("edit", id)}
        onDelete={async (id) => {
          await devicesApi.remove(Number(id));
          fetchPage();
        }}
      />

      <DeviceTablePagination
        onPageChange={(nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
        }}
      />
    </Stack>
  );
}
