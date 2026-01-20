// components/LeftSidebar.tsx
import * as React from "react";
import { NavLink, useLocation } from "react-router";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const DRAWER_WIDTH = 260;
const MINI_WIDTH = 72;

type NavItem = {
  label: string;
  to?: string; // optional if it’s a group
  icon: React.ReactNode;
  children?: Array<{ label: string; to: string; icon?: React.ReactNode }>;
};

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: <DashboardOutlinedIcon /> },

  {
    label: "Devices",
    to: "/devices",
    icon: <Inventory2OutlinedIcon />,
    children: [
      { label: "Categories", to: "/categories", icon: <CategoryOutlinedIcon /> },
      { label: "Maintenance Status", to: "/maintenanceStatus", icon: <BuildOutlinedIcon /> },
      { label: "Vendors", to: "/vendors", icon: <StoreOutlinedIcon /> },
    ],
  },

  { label: "Settings", to: "/settings", icon: <SettingsOutlinedIcon /> },
];

function isPathActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(to + "/");
}

export function LeftSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  const [mini, setMini] = React.useState(false);

  // Expand “Devices” group if we are on /devices or any of its sub routes
  const devicesActive =
    isPathActive(pathname, "/devices") ||
    isPathActive(pathname, "/categories") ||
    isPathActive(pathname, "/maintenanceStatus") ||
    isPathActive(pathname, "/vendors");

  const [devicesOpen, setDevicesOpen] = React.useState(devicesActive);

  // Keep it open when navigating inside the group (unless mini mode hides children)
  React.useEffect(() => {
    if (!mini) setDevicesOpen(devicesActive);
  }, [devicesActive, mini]);

  const drawerWidth = mini ? MINI_WIDTH : DRAWER_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          overflowX: "hidden",
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          transition: (t) =>
            t.transitions.create("width", {
              easing: t.transitions.easing.sharp,
              duration: t.transitions.duration.shortest,
            }),
        },
      }}
    >
      <Toolbar
        sx={{
          px: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: mini ? "center" : "space-between",
          gap: 1,
        }}
      >
        {!mini ? (
          <Typography variant="h6" fontWeight={700} noWrap>
            CRUD Operations
          </Typography>
        ) : null}

        <Tooltip title={mini ? "Expand sidebar" : "Collapse sidebar"} placement="right">
          <IconButton size="small" onClick={() => setMini((v) => !v)}>
            {mini ? <ChevronRightOutlinedIcon /> : <ChevronLeftOutlinedIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Divider />

      <Box sx={{ p: 1 }}>
        <List dense sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {/* Dashboard */}
          <Tooltip title={mini ? "Dashboard" : ""} placement="right" disableHoverListener={!mini}>
            <ListItemButton
              component={NavLink}
              to="/"
              end
              sx={{
                borderRadius: 2,
                justifyContent: mini ? "center" : "flex-start",
                "&.active": {
                  bgcolor: "action.selected",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                  "& .MuiListItemText-primary": { fontWeight: 700 },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: mini ? "auto" : 40 }}>
                <DashboardOutlinedIcon />
              </ListItemIcon>
              {!mini ? <ListItemText primary="Dashboard" /> : null}
            </ListItemButton>
          </Tooltip>

          {/* Devices group */}
          <Tooltip title={mini ? "Devices" : ""} placement="right" disableHoverListener={!mini}>
            <ListItemButton
              onClick={() => {
                if (mini) {
                  // In mini mode we treat it like a normal nav item
                  // You can change this behavior if you prefer a popover instead.
                  // For now, navigate via the link below:
                } else {
                  setDevicesOpen((v) => !v);
                }
              }}
              component={mini ? NavLink : "button"}
              // When mini: click navigates to /devices
              {...(mini ? ({ to: "/devices" } as any) : {})}
              sx={{
                borderRadius: 2,
                justifyContent: mini ? "center" : "flex-start",
                ...(devicesActive && {
                  bgcolor: "action.selected",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                  "& .MuiListItemText-primary": { fontWeight: 700 },
                }),
              }}
            >
              <ListItemIcon sx={{ minWidth: mini ? "auto" : 40 }}>
                <Inventory2OutlinedIcon />
              </ListItemIcon>

              {!mini ? (
                <>
                  <ListItemText primary="Devices" />
                  {devicesOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </>
              ) : null}
            </ListItemButton>
          </Tooltip>

          {/* Devices children (only in full mode) */}
          <Collapse in={!mini && devicesOpen} timeout="auto" unmountOnExit>
            <List dense sx={{ pl: 1 }}>
              {/* Devices main route */}
              <ListItemButton
                component={NavLink}
                to="/devices"
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  pl: 3,
                  "&.active": {
                    bgcolor: "action.selected",
                    "& .MuiListItemText-primary": { fontWeight: 700 },
                  },
                }}
              >
                <ListItemText primary="All Devices" />
              </ListItemButton>

              <ListItemButton
                component={NavLink}
                to="/categories"
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  pl: 3,
                  "&.active": {
                    bgcolor: "action.selected",
                    "& .MuiListItemText-primary": { fontWeight: 700 },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CategoryOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Categories" />
              </ListItemButton>

              <ListItemButton
                component={NavLink}
                to="/maintenanceStatus"
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  pl: 3,
                  "&.active": {
                    bgcolor: "action.selected",
                    "& .MuiListItemText-primary": { fontWeight: 700 },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <BuildOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Maintenance Status" />
              </ListItemButton>

              <ListItemButton
                component={NavLink}
                to="/vendors"
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  pl: 3,
                  "&.active": {
                    bgcolor: "action.selected",
                    "& .MuiListItemText-primary": { fontWeight: 700 },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <StoreOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Vendors" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Settings */}
          <Tooltip title={mini ? "Settings" : ""} placement="right" disableHoverListener={!mini}>
            <ListItemButton
              component={NavLink}
              to="/settings"
              sx={{
                borderRadius: 2,
                justifyContent: mini ? "center" : "flex-start",
                "&.active": {
                  bgcolor: "action.selected",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                  "& .MuiListItemText-primary": { fontWeight: 700 },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: mini ? "auto" : 40 }}>
                <SettingsOutlinedIcon />
              </ListItemIcon>
              {!mini ? <ListItemText primary="Settings" /> : null}
            </ListItemButton>
          </Tooltip>
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <Box sx={{ p: 1 }}>
        <List dense>
          <Tooltip title={mini ? "Log Out" : ""} placement="right" disableHoverListener={!mini}>
            <ListItemButton
              onClick={() => {
                console.log("logout");
              }}
              sx={{
                borderRadius: 2,
                justifyContent: mini ? "center" : "flex-start",
              }}
            >
              <ListItemIcon sx={{ minWidth: mini ? "auto" : 40 }}>
                <LogoutOutlinedIcon />
              </ListItemIcon>
              {!mini ? <ListItemText primary="Log Out" /> : null}
            </ListItemButton>
          </Tooltip>
        </List>
      </Box>
    </Drawer>
  );
}
