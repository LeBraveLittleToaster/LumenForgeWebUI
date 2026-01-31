import * as React from "react";
import { useParams, Link as RouterLink } from "react-router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Checkbox,
  ListItemText,
} from "@mui/material";
import type { CategoryDTO, DeviceDTO, DeviceRequestDTO, MaintenanceStatusDTO, UUID, VendorDTO } from "~/api/types/device";
import { mockDeviceApi } from "./deviceApiMock";
import { useState } from "react";


type Params = { uuid: UUID };

function toRequestDTO(d: DeviceDTO): DeviceRequestDTO {
  return {
    serialNumber: d.serialNumber,
    name: d.name,
    description: d.description,
    photoUrl: d.photoUrl,
    purchasePrice: d.purchasePrice,
    purchaseDate: d.purchaseDate,
    vendorId: d.vendor.id,
    maintenanceStatusId: d.maintenanceStatus.id,
    categoryIds: d.categories.map((c) => c.id),
  };
}

export default function DeviceDetailsPage() {
  const { uuid } = useParams<Params>();

  const [device, setDevice] = useState<DeviceDTO | null>(null);
  const [draft, setDraft] = useState<DeviceRequestDTO | null>(null);

  const [vendors, setVendors] = useState<VendorDTO[]>([]);
  const [statuses, setStatuses] = useState<MaintenanceStatusDTO[]>([]);
  const [cats, setCats] = useState<CategoryDTO[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const load = React.useCallback(async () => {
    if (!uuid) return;
    setLoading(true);
    setError(null);
    try {
      const [d, v, s, c] = await Promise.all([
        mockDeviceApi.getDevice(uuid),
        mockDeviceApi.listVendors(),
        mockDeviceApi.listMaintenanceStatuses(),
        mockDeviceApi.listCategories(),
      ]);
      setDevice(d);
      setDraft(toRequestDTO(d));
      setVendors(v);
      setStatuses(s);
      setCats(c);
    } catch (e: any) {
      setDevice(null);
      setDraft(null);
      setError(e?.message ?? "Failed to load device");
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onCancel = () => {
    if (!device) return;
    setDraft(toRequestDTO(device));
    setIsEditing(false);
  };

  const onSave = async () => {
    if (!uuid || !draft) return;

    // Basic sanity checks (you can make these stricter)
    if (!draft.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (draft.purchasePrice !== null && Number.isNaN(draft.purchasePrice)) {
      setError("purchasePrice must be a number or null.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await mockDeviceApi.updateDevice(uuid, {
        ...draft,
        name: draft.name.trim(),
        serialNumber: draft.serialNumber?.trim() || null,
        description: draft.description?.trim() || null,
        photoUrl: draft.photoUrl?.trim() || null,
        purchaseDate: draft.purchaseDate?.trim() || null,
        categoryIds: draft.categoryIds ?? null,
      });
      setDevice(updated);
      setDraft(toRequestDTO(updated));
      setIsEditing(false);
    } catch (e: any) {
      setError(e?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const disabled = !isEditing || saving;

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Device</Typography>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={load} disabled={loading || saving}>
              Refresh
            </Button>
            <Button component={RouterLink} to="/app/devices" variant="text">
              Back
            </Button>

            {!isEditing ? (
              <Button
                variant="contained"
                onClick={() => setIsEditing(true)}
                disabled={!device || loading}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button variant="outlined" onClick={onCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={onSave} disabled={!draft || saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        {loading && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={18} />
            <Typography>Loading…</Typography>
          </Stack>
        )}

        {!loading && !uuid && (
          <Alert severity="warning">
            Missing UUID param. Your route must be <code>/app/device/:uuid</code>.
          </Alert>
        )}

        {!loading && uuid && !device && (
          <Alert severity="warning">No device found for UUID {uuid}</Alert>
        )}

        {device && draft && (
          <Card>
            <CardHeader
              title={device.name}
              subheader={
                <Stack spacing={0.5}>
                  <Typography variant="body2">UUID: {device.uuid}</Typography>
                  <Typography variant="body2">Internal ID: {device.id}</Typography>
                </Stack>
              }
            />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={draft.name}
                  disabled={disabled}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  fullWidth
                />

                <TextField
                  label="Serial Number"
                  value={draft.serialNumber ?? ""}
                  disabled={disabled}
                  onChange={(e) =>
                    setDraft({ ...draft, serialNumber: e.target.value || null })
                  }
                  fullWidth
                />

                <TextField
                  label="Description"
                  value={draft.description ?? ""}
                  disabled={disabled}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value || null })
                  }
                  multiline
                  minRows={3}
                  fullWidth
                />

                <TextField
                  label="Photo URL"
                  value={draft.photoUrl ?? ""}
                  disabled={disabled}
                  onChange={(e) => setDraft({ ...draft, photoUrl: e.target.value || null })}
                  fullWidth
                />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField
                    label="Purchase Price"
                    value={draft.purchasePrice ?? ""}
                    disabled={disabled}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      setDraft({
                        ...draft,
                        purchasePrice: v === "" ? null : Number(v.replace(",", ".")),
                      });
                    }}
                    fullWidth
                    inputProps={{ inputMode: "decimal" }}
                  />

                  <TextField
                    label="Purchase Date (ISO)"
                    value={draft.purchaseDate ?? ""}
                    disabled={disabled}
                    onChange={(e) =>
                      setDraft({ ...draft, purchaseDate: e.target.value || null })
                    }
                    placeholder="YYYY-MM-DD"
                    fullWidth
                  />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <FormControl fullWidth disabled={disabled}>
                    <InputLabel id="vendor-label">Vendor</InputLabel>
                    <Select
                      labelId="vendor-label"
                      label="Vendor"
                      value={draft.vendorId}
                      onChange={(e) =>
                        setDraft({ ...draft, vendorId: Number(e.target.value) })
                      }
                    >
                      {vendors.map((v) => (
                        <MenuItem key={v.id} value={v.id}>
                          {v.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth disabled={disabled}>
                    <InputLabel id="status-label">Maintenance Status</InputLabel>
                    <Select
                      labelId="status-label"
                      label="Maintenance Status"
                      value={draft.maintenanceStatusId}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          maintenanceStatusId: Number(e.target.value),
                        })
                      }
                    >
                      {statuses.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <FormControl fullWidth disabled={disabled}>
                  <InputLabel id="cats-label">Categories</InputLabel>
                  <Select
                    labelId="cats-label"
                    label="Categories"
                    multiple
                    value={draft.categoryIds ?? []}
                    onChange={(e) => {
                      const value = e.target.value as number[];
                      setDraft({ ...draft, categoryIds: value.length ? value : [] });
                    }}
                    renderValue={(selected) =>
                      cats
                        .filter((c) => (draft.categoryIds ?? []).includes(c.id))
                        .map((c) => c.name)
                        .join(", ")
                    }
                  >
                    {cats.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        <Checkbox checked={(draft.categoryIds ?? []).includes(c.id)} />
                        <ListItemText primary={c.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Divider />

                {/* Read-only summary (always derived from loaded device, not draft) */}
                <Typography variant="subtitle2">Current saved state</Typography>
                <Typography variant="body2">
                  Vendor: {device.vendor.name} · Status: {device.maintenanceStatus.name} ·
                  Categories:{" "}
                  {device.categories.length
                    ? device.categories.map((c) => c.name).join(", ")
                    : "—"}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}