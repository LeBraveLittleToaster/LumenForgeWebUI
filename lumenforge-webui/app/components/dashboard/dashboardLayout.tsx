import { Outlet } from "react-router";
import { Box, CssBaseline } from "@mui/material";
import { LeftSidebar } from "~/navigation/LeftSideBar";


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
          p: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
