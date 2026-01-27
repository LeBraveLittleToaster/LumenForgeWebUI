import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, List, ListItem, ListItemText, Typography } from "@mui/material";
import NavigationBar from "~/navigation/navigationBar";
import { navigationRoutes } from "~/navigation/routes";
import { UsersApi } from "~/api/admin/usersApi";
import type { AdminUserDTO } from "~/api/types/admin";

const USERS_API_BASE_URL = "http://localhost:1324";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const usersApi = new UsersApi({ baseUrl: USERS_API_BASE_URL });

    usersApi
      .getAll()
      .then((data) => {
        setUsers(data);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message || "Unable to load users.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <NavigationBar routes={navigationRoutes} title="LumenForge" />
      <Box sx={{ pt: 12, px: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Admin Users
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>Loading users...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : users.length === 0 ? (
          <Alert severity="info">No users available.</Alert>
        ) : (
          <List sx={{ backgroundColor: "white", borderRadius: 2 }}>
            {users.map((user) => (
              <ListItem key={user.id} divider>
                <ListItemText
                  primary={user.displayName ?? user.username}
                  secondary={
                    user.email
                      ? `${user.email} • ${user.active ? "Active" : "Inactive"}`
                      : user.active
                        ? "Active"
                        : "Inactive"
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
