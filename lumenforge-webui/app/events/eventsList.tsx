import { useEffect, useState } from "react";
import { Alert, Box, Chip, CircularProgress, List, ListItem, ListItemText, Typography } from "@mui/material";
import NavigationBar from "~/navigation/navigationBar";
import { navigationRoutes } from "~/navigation/routes";
import { EventsApi } from "~/api/event/eventsApi";
import type { EventDTO } from "~/api/types/event";

const EVENTS_API_BASE_URL = "http://localhost:1324";

export default function EventsListPage() {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventsApi = new EventsApi({ baseUrl: EVENTS_API_BASE_URL });

    eventsApi
      .getAll()
      .then((data) => {
        setEvents(data);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message || "Unable to load events.");
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
          Events
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>Loading events...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : events.length === 0 ? (
          <Alert severity="info">No events scheduled.</Alert>
        ) : (
          <List sx={{ backgroundColor: "white", borderRadius: 2 }}>
            {events.map((event) => (
              <ListItem key={event.id} divider>
                <ListItemText
                  primary={event.title}
                  secondary={
                    event.startsAt
                      ? `${event.startsAt}${event.location ? ` • ${event.location}` : ""}`
                      : event.location ?? "No start time"
                  }
                />
                <Chip label={event.status} color="primary" variant="outlined" />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
