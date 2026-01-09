import { useEffect } from "react";
import { useAuthStore } from "~/auth/authStore";
import NavigationBar from "~/navigation/navigationBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import useSliderStore from "~/auth/sliderStore";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ConsoleSlider from "~/slider/consoleSlider";
import Divider from "@mui/material/Divider";

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
      <NavigationBar title="Dashboard" />
      <Box maxWidth="sm" height={100} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}
        >
          {Array.from({ length: amountOfSliders }, (_, id) => (
            <ConsoleSlider key={id} id={id} />
          ))}
        </Stack>
      </Box>
    </>
  );
}
