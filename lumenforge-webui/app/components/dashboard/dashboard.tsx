import { useState } from "react";
import NavigationBar from "~/navigation/navigationBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { Button, Typography } from "@mui/material";
import { DevicesApi } from "~/api/device/deviceApi";
import { useAuthStore } from "~/stores/authStore";
import { LeftSidebar } from "~/navigation/LeftSideBar";

const routes = [
  { title: "FaderBar", redirectTo: "/" },
  { title: "Editor", redirectTo: "/stage/editor" },
  { title: "Settings", redirectTo: "/settings" },
];


export function Console({ amountOfSliders }: { amountOfSliders: number }) {
  const status = useAuthStore((s: any) => s.status);
  const token = useAuthStore((s: any) => s.token);

  const [message, setMessage] = useState<string>("Testing Device API...");
     
  return (
    <>
    <LeftSidebar />
      {/* 
      <CssBaseline />
      <NavigationBar routes={routes} title="LumenForge" />
      <Box maxWidth="sm" height={100} />
*/}
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
          <Button variant="contained" color="primary">
            Test create Device
          </Button>
          <Button variant="contained" color="primary">
            Test update Device
          </Button>
          <Button variant="contained" color="secondary">
            Test remove Device
          </Button>
          <Button variant="contained" onClick={() => { 
            new DevicesApi({ baseUrl: "http://localhost:1324/api/v1/user", basePath: "/devices" })
            .getAll()
            .then((devices) => {
              console.log("Devices:", devices);
              setMessage(`Retrieved ${devices.length === undefined ? 0 : devices.length} devices.`); }) }}
            color="secondary">
            Test get Devices
          </Button>
          <Typography variant="h6" component="div">
            {message}
          </Typography>

        </Stack>
      </Box>
    </>
  );
}
