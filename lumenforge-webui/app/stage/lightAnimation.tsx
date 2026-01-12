import Konva from "konva";
import type { LineConfig } from "konva/lib/shapes/Line";
import { use, useEffect, useRef } from "react";
import { Line, Layer, Circle } from "react-konva";

const Lightanimation = ({ isMovingAlongX, xStart, xEnd, isMovingAlongY, yStart, yEnd, speed }: { isMovingAlongX: boolean, isMovingAlongY: boolean, xStart: number, xEnd: number, yStart: number, yEnd: number, speed: number }) => {

    const lineRef = useRef<Konva.Line>(null);

    useEffect(() => {

        const animX = new Konva.Animation((frame) => {
            if (lineRef.current == null) return;

            let x = lineRef.current.x();
            console.log("Current X:", x);
            console.log("Frame timeDiff:", frame.timeDiff);
            if (isMovingAlongX) {
                x += (speed * frame.timeDiff) / 1000.0;
                if (x > xEnd) {
                    x = xStart;
                }
                lineRef.current.x(x);
            }
        }, lineRef?.current?.getLayer());

        animX.start();

        return () => {
            animX.stop();
        };
    }, []);

    return (<Layer>
        <Line
            ref={lineRef}
            points={[0, -500, 0, 500]}
            stroke={"red"}
            strokeWidth={1}
        />
    </Layer>);
};

export default Lightanimation;