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
import { useAuthStore } from "~/stores/authStore";
import useSliderStore from "~/stores/sliderStore";
import { navigationRoutes } from "~/navigation/routes";

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

export function Console({ amountOfSliders }: { amountOfSliders: number }) {
  const status = useAuthStore((s: any) => s.status);
  const token = useAuthStore((s: any) => s.token);

  const initSliders = useSliderStore((s) => s.initSliders);
  const connect = useSliderStore((s) => s.connect);
  const disconnect = useSliderStore((s) => s.disconnect);

  const [message, setMessage] = useState<string>("Testing Device API...");
     

  useEffect(() => {
    initSliders(amountOfSliders);
  }, [amountOfSliders, initSliders]);

  useEffect(() => {
    if (status === "authenticated" && token) connect(token);
    if (status !== "authenticated") disconnect();
  }, [status, token, connect, disconnect]);

  return (
    <>
      <CssBaseline />
      <NavigationBar routes={navigationRoutes} title="LumenForge" />
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
