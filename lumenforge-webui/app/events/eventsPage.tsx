import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CssBaseline,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import NavigationBar from "~/navigation/navigationBar";
import { EventsApi } from "~/api/event/eventApi";
import type { EventDTO, EventRequestDTO, EventStatus } from "~/api/types/event";

const eventStatuses: EventStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELED",
];

const routes = [
  { title: "FaderBar", redirectTo: "/" },
  { title: "Editor", redirectTo: "/stage/editor" },
  { title: "Events", redirectTo: "/events" },
];

const parseIdList = (value: string): number[] =>
  value
    .split(",")
    .map((entry) => Number(entry.trim()))
    .filter((entry) => Number.isFinite(entry));

export default function EventsPage() {
  const api = useMemo(
    () => new EventsApi({ baseUrl: "http://localhost:1324/api/v1/user", basePath: "/events" }),
    []
  );

  const [events, setEvents] = useState<EventDTO[]>([]);
  const [statusMessage, setStatusMessage] = useState("Loading events...");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [status, setStatus] = useState<EventStatus>("DRAFT");
  const [userIds, setUserIds] = useState("");
  const [deviceIds, setDeviceIds] = useState("");

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [assignUserIds, setAssignUserIds] = useState("");
  const [assignDeviceIds, setAssignDeviceIds] = useState("");

  const refreshEvents = useCallback(async () => {
    setStatusMessage("Refreshing events...");
    try {
      const data = await api.getAll();
      setEvents(data);
      setStatusMessage(`Loaded ${data.length} event(s).`);
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to load events.");
    }
  }, [api]);

  useEffect(() => {
    void refreshEvents();
  }, [refreshEvents]);

  const handleCreate = async () => {
    if (!name || !scheduleStart || !scheduleEnd) {
      setStatusMessage("Please provide name, start, and end times.");
      return;
    }

    const payload: EventRequestDTO = {
      name,
      description: description || null,
      scheduleStart,
      scheduleEnd,
      status,
      userIds: parseIdList(userIds),
      deviceIds: parseIdList(deviceIds),
    };

    setIsSubmitting(true);
    try {
      const created = await api.create(payload);
      setEvents((prev) => [created, ...prev]);
      setStatusMessage(`Created event "${created.name}".`);
      setName("");
      setDescription("");
      setScheduleStart("");
      setScheduleEnd("");
      setStatus("DRAFT");
      setUserIds("");
      setDeviceIds("");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignUsers = async () => {
    if (!selectedEventId) {
      setStatusMessage("Select an event to assign personnel.");
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await api.assignPersonnel(selectedEventId, parseIdList(assignUserIds));
      setEvents((prev) =>
        prev.map((event) => (event.id === updated.id ? updated : event))
      );
      setStatusMessage("Assigned personnel.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to assign personnel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignDevices = async () => {
    if (!selectedEventId) {
      setStatusMessage("Select an event to assign equipment.");
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await api.assignEquipment(
        selectedEventId,
        parseIdList(assignDeviceIds)
      );
      setEvents((prev) =>
        prev.map((event) => (event.id === updated.id ? updated : event))
      );
      setStatusMessage("Assigned equipment.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to assign equipment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CssBaseline />
      <NavigationBar routes={routes} title="LumenForge Events" />

      <Box maxWidth="md" sx={{ paddingTop: 10, margin: "0 auto" }}>
        <Stack spacing={3}>
          <Paper sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
              Create Event
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Event name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                fullWidth
              />
              <TextField
                label="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Start"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={scheduleStart}
                  onChange={(event) => setScheduleStart(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="End"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={scheduleEnd}
                  onChange={(event) => setScheduleEnd(event.target.value)}
                  fullWidth
                />
              </Stack>
              <TextField
                label="Status"
                select
                value={status}
                onChange={(event) => setStatus(event.target.value as EventStatus)}
                SelectProps={{ native: true }}
                fullWidth
              >
                {eventStatuses.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </TextField>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Assign personnel IDs (comma separated)"
                  value={userIds}
                  onChange={(event) => setUserIds(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Assign device IDs (comma separated)"
                  value={deviceIds}
                  onChange={(event) => setDeviceIds(event.target.value)}
                  fullWidth
                />
              </Stack>
              <Button variant="contained" onClick={handleCreate} disabled={isSubmitting}>
                Create event
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ padding: 3 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <Typography variant="h5">Events</Typography>
              <Button variant="outlined" onClick={refreshEvents} disabled={isSubmitting}>
                Refresh
              </Button>
              <Typography color="text.secondary">{statusMessage}</Typography>
            </Stack>
            <Divider sx={{ marginY: 2 }} />
            <Stack spacing={2}>
              {events.length === 0 ? (
                <Typography color="text.secondary">No events yet.</Typography>
              ) : (
                events.map((eventItem) => (
                  <Paper
                    key={eventItem.id}
                    sx={{ padding: 2, border: selectedEventId === eventItem.id ? "2px solid #1976d2" : "1px solid #ddd" }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h6">{eventItem.name}</Typography>
                        <Chip label={eventItem.status} />
                        <Button
                          size="small"
                          variant={selectedEventId === eventItem.id ? "contained" : "outlined"}
                          onClick={() => setSelectedEventId(eventItem.id)}
                        >
                          {selectedEventId === eventItem.id ? "Selected" : "Select"}
                        </Button>
                      </Stack>
                      <Typography color="text.secondary">
                        {eventItem.scheduleStart} → {eventItem.scheduleEnd}
                      </Typography>
                      {eventItem.description && (
                        <Typography>{eventItem.description}</Typography>
                      )}
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {eventItem.assignedUsers.map((user) => (
                          <Chip
                            key={`user-${eventItem.id}-${user.id}`}
                            label={user.displayName || user.username || `User ${user.id}`}
                            size="small"
                          />
                        ))}
                        {eventItem.assignedDevices.map((device) => (
                          <Chip
                            key={`device-${eventItem.id}-${device.id}`}
                            label={device.name || `Device ${device.id}`}
                            size="small"
                            color="info"
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>

          <Paper sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
              Assignment Actions
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Selected event: {selectedEventId ?? "None"}
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Personnel IDs"
                value={assignUserIds}
                onChange={(event) => setAssignUserIds(event.target.value)}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleAssignUsers}
                disabled={isSubmitting}
              >
                Assign personnel
              </Button>
              <TextField
                label="Device IDs"
                value={assignDeviceIds}
                onChange={(event) => setAssignDeviceIds(event.target.value)}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleAssignDevices}
                disabled={isSubmitting}
              >
                Assign equipment
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </>
  );
}
