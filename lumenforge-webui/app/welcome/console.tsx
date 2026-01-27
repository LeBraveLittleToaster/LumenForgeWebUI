import { useEffect, useState } from "react";
import NavigationBar from "~/navigation/navigationBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ConsoleSlider from "~/slider/consoleSlider";
import Divider from "@mui/material/Divider";
import { Button, Typography } from "@mui/material";
import { DevicesApi } from "~/api/device/deviceApi";
import type { DeviceDTO, DeviceRequestDTO } from "~/api/types/device";
import { AvailabilityStatus } from "~/api/types/device";
import { useAuthStore } from "~/stores/authStore";
import useSliderStore from "~/stores/sliderStore";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

const routes = [
  { title: "FaderBar", redirectTo: "/" },
  { title: "Editor", redirectTo: "/stage/editor" },
  { title: "Settings", redirectTo: "/settings" },
];


export function Console({ amountOfSliders }: { amountOfSliders: number }) {
  const status = useAuthStore((s: any) => s.status);
  const token = useAuthStore((s: any) => s.token);

  const initSliders = useSliderStore((s) => s.initSliders);
  const connect = useSliderStore((s) => s.connect);
  const disconnect = useSliderStore((s) => s.disconnect);

  const [message, setMessage] = useState<string>("Testing Device API...");
  const [devices, setDevices] = useState<DeviceDTO[]>([]);
     

  useEffect(() => {
    initSliders(amountOfSliders);
  }, [amountOfSliders, initSliders]);

  useEffect(() => {
    if (status === "authenticated" && token) connect(token);
    if (status !== "authenticated") disconnect();
  }, [status, token, connect, disconnect]);

  const baseUrl = "http://localhost:1324/api/v1/user";
  const devicesApi = new DevicesApi({ baseUrl, basePath: "/devices" });

  const buildDevicePayload = (overrides: Partial<DeviceRequestDTO> = {}): DeviceRequestDTO => ({
    serialNumber: null,
    name: "Demo Device",
    description: "Inventory sample",
    photoUrl: null,
    purchasePrice: null,
    purchaseDate: null,
    totalQuantity: 10,
    availableQuantity: 8,
    availabilityStatus: AvailabilityStatus.Available,
    vendorId: 1,
    maintenanceStatusId: 1,
    categoryIds: [],
    ...overrides,
  });

  const handleCreateDevice = async () => {
    try {
      const payload = buildDevicePayload();
      const device = await devicesApi.create(payload);
      setDevices((prev) => [device, ...prev]);
      setMessage(`Created device ${device.name} with ${device.availableQuantity ?? 0}/${device.totalQuantity ?? 0} available.`);
    } catch (error) {
      console.error("Create device failed:", error);
      setMessage("Create device failed. Check console for details.");
    }
  };

  const handleUpdateDevice = async () => {
    if (devices.length === 0) {
      setMessage("No devices loaded. Fetch devices before updating.");
      return;
    }

    try {
      const deviceToUpdate = devices[0];
      const payload = buildDevicePayload({
        name: `${deviceToUpdate.name} (Updated)`,
        totalQuantity: deviceToUpdate.totalQuantity ?? 12,
        availableQuantity: Math.max(0, (deviceToUpdate.availableQuantity ?? 0) - 1),
        availabilityStatus: AvailabilityStatus.LowStock,
      });
      const updated = await devicesApi.update(deviceToUpdate.id, payload);
      setDevices((prev) => [updated, ...prev.filter((device) => device.id !== updated.id)]);
      setMessage(`Updated device ${updated.name} inventory to ${updated.availableQuantity ?? 0}/${updated.totalQuantity ?? 0}.`);
    } catch (error) {
      console.error("Update device failed:", error);
      setMessage("Update device failed. Check console for details.");
    }
  };

  const handleGetDevices = async () => {
    try {
      const devicesResponse = await devicesApi.getAll();
      setDevices(devicesResponse);
      setMessage(`Retrieved ${devicesResponse.length === undefined ? 0 : devicesResponse.length} devices.`);
    } catch (error) {
      console.error("Get devices failed:", error);
      setMessage("Get devices failed. Check console for details.");
    }
  };

  return (
    <>
      <CssBaseline />
      <NavigationBar routes={routes} title="LumenForge" />
      <Box maxWidth="sm" height={100} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Stack
          direction="column"
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}
        >
          <Button variant="contained" color="primary" onClick={handleCreateDevice}>
            Test create Device
          </Button>
          <Button variant="contained" color="primary" onClick={handleUpdateDevice}>
            Test update Device
          </Button>
          <Button variant="contained" color="secondary">
            Test remove Device
          </Button>
          <Button variant="contained" onClick={handleGetDevices} color="secondary">
            Test get Devices
          </Button>
          <Typography variant="h6" component="div">
            {message}
          </Typography>
          {devices.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="subtitle1">Inventory snapshot</Typography>
              {devices.slice(0, 3).map((device) => (
                <Typography key={device.id} variant="body2">
                  {device.name}: {device.availableQuantity ?? 0}/{device.totalQuantity ?? 0} available (
                  {device.availabilityStatus})
                </Typography>
              ))}
            </Stack>
          )}

          {/*}
        
          {Array.from({ length: amountOfSliders }, (_, id) => (
            <ConsoleSlider key={id} id={id} />
          ))
        */}
        </Stack>
      </Box>
    </>
  );
}
