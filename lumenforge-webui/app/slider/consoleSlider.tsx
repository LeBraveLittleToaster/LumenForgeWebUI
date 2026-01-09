import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import useSliderStore from "~/auth/sliderStore";

export default function ConsoleSlider({ id }: { id: number }) {
  const value = useSliderStore((s) => s.sliders[id] ?? 50);
  const publishSlider = useSliderStore((s) => s.publishSlider);

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>
          Channel {id}
        </Typography>
        <Slider
          min={0}
          max={255}
          value={value}
          shiftStep={30}
          step={10}
          marks

          onChange={(_, newValue) => {
            publishSlider(id, newValue as number);
          }}
          aria-label={`Slider ${id}`}
          valueLabelDisplay="auto" />
      </Box>
    </>
  );
}