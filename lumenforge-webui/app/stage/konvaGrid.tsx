import { Layer, Line } from 'react-konva';

const KonvaGrid = ({ width, height, pixelPerTick }: { width: number, height: number, pixelPerTick: number }) => {

  

  let i = 0;
  return (
    <Layer>
      <Line key={i} points={[0, -height, 0, height * 2]} stroke={"darkgray"} strokeWidth={3} />
      {Array.from({ length: Math.ceil(width * 2 / pixelPerTick) }, (_, i) => {
        const x = i * pixelPerTick;
        i += 2;
        return (
          <>
            <Line
              key={i}
              points={[x, -height * 2, x, height * 2]}
              stroke={"lightgray"}
              strokeWidth={1}
            />
            <Line
              key={i + 1}
              points={[-x, -height * 2, -x, height * 2]}
              stroke={"lightgray"}
              strokeWidth={1}
            />
          </>
        );
      }
      )}
      {Array.from({ length: Math.ceil(height * 2 / pixelPerTick) }, (_, i) => {
        const y = i * pixelPerTick;
        i += 2;
        return (
          <>
            <Line
              key={i + 1}
              points={[-width * 2, y, width * 2, y]}
              stroke={"lightgray"}
              strokeWidth={1}
            />
            <Line
              key={i + 2}
              points={[-width * 2, -y, width * 2, -y]}
              stroke={"lightgray"}
              strokeWidth={1}
            />
          </>
        );
      }
      )}

      <Line key={i + 2} points={[-width * 2, 0, width * 2, 0]} stroke={"darkgray"} strokeWidth={3} />
      

    </Layer>
  );
};

export default KonvaGrid;
