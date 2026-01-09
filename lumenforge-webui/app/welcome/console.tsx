import { useEffect } from "react";
import { useAuthStore } from "~/auth/authStore";
import Container from "@mui/material/Container";
import NavigationBar from "~/navigation/navigationBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import useSliderStore from "~/auth/sliderStore";
import ConsoleSlider from "~/slider/ConsoleSlider";

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
      <Box maxWidth="sm" height={64} />

      <Container maxWidth="sm" sx={{ pb: 4 }}>
        {Array.from({ length: amountOfSliders }, (_, id) => (
          <ConsoleSlider key={id} id={id} />
        ))}

      </Container>
    </>
  );
}
