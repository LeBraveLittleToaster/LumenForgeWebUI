// layouts/DashboardLayout.tsx
import * as React from "react";
import { Outlet } from "react-router";
import { Box, CssBaseline } from "@mui/material";
import { LeftSidebar } from "~/navigation/LeftSideBar";

const SIDEBAR_WIDTH = 260; // must match your Drawer width

export function DashboardLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      <LeftSidebar />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${SIDEBAR_WIDTH}px`, // important with permanent Drawer
          p: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
