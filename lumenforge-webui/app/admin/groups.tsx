import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, List, ListItem, ListItemText, Typography } from "@mui/material";
import NavigationBar from "~/navigation/navigationBar";
import { navigationRoutes } from "~/navigation/routes";
import { GroupsApi } from "~/api/admin/groupsApi";
import type { AdminGroupDTO } from "~/api/types/admin";

const GROUPS_API_BASE_URL = "http://localhost:1324";

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<AdminGroupDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const groupsApi = new GroupsApi({ baseUrl: GROUPS_API_BASE_URL });

    groupsApi
      .getAll()
      .then((data) => {
        setGroups(data);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message || "Unable to load groups.");
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
          Admin Groups
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>Loading groups...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : groups.length === 0 ? (
          <Alert severity="info">No groups available.</Alert>
        ) : (
          <List sx={{ backgroundColor: "white", borderRadius: 2 }}>
            {groups.map((group) => (
              <ListItem key={group.id} divider>
                <ListItemText
                  primary={group.name}
                  secondary={
                    group.description
                      ? `${group.description} • ${group.memberCount} members`
                      : `${group.memberCount} members`
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
