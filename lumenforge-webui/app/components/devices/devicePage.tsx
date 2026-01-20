// Example usage (page) - ProductsPage.tsx
import * as React from "react";
import { Box, Stack } from "@mui/material";

import { DeviceTable, type DeviceRow } from "./deviceTable";
import { useDeviceStore } from "~/stores/devicestore";
import { DeviceTablePagination } from "./deviceTablePagination";


const ALL_ROWS: DeviceRow[] = [
  { id: "1", name: "Apple iPhone 15", category: "Phone", brand: "Apple", color: "Black", stock: 13, price: 829.99 },
  { id: "2", name: "Apple iPhone 14", category: "Phone", brand: "Apple", color: "Black", stock: 15, price: 396 },
  // ...pretend you have 300 total on server
];

export function DevicePage() {
  const [search, setSearch] = React.useState("");

  // in real life, total should come from API response
  const setTotal = useDeviceStore((s) => s.setTotal);
  const page = useDeviceStore((s) => s.page);
  const pageSize = useDeviceStore((s) => s.pageSize);

  React.useEffect(() => {
    setTotal(300);
  }, [setTotal]);

  // Fake “server paging” locally for demo
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

  return (
    <Stack spacing={2}>
      <DeviceTable
        rows={paged}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          // if you want: reset to page 1 when searching
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
          // call your API here with nextPage/nextPageSize/search/filters
          console.log("fetch page", nextPage, "size", nextPageSize);
        }}
      />
    </Stack>
  );
}
