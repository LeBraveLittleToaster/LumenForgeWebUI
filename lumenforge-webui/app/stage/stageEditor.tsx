import React, { useEffect } from "react";
import { Stage, Layer, Circle } from "react-konva";
import KonvaGrid from "./konvaGrid";
import { useLightsStore, type LightInfo } from "./lightInfoStore";
import Button from "@mui/material/Button";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { useNavigate } from "react-router";
import Lightanimation from "./lightAnimation";

const initialLights: LightInfo[] = [
    { id: "a", x: 120, y: 200, name: "Light 1" },
    { id: "b", x: 300, y: 260, name: "Light 2" },
];

const StageEditor = () => {
    const navigate = useNavigate();
    const lights = useLightsStore((s) => s.lights);
    const updateLightPos = useLightsStore((s) => s.updateLightPos);
    const setLights = useLightsStore((s) => s.setLights);

    const [popupId, setPopupId] = React.useState<string | undefined>(undefined);

    const handleDelete = (id: string) => {
        setLights(lights.filter((light) => light.id !== id));
        setPopupId(undefined);
    };
    const handleWheel = (e: any) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        if (!stage) return;
        
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;
        const scaleBy = 1.05;
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        
        const newScale =
            e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        stage.scale({ x: newScale, y: newScale });
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        stage.position(newPos);
        stage.batchDraw();
    };

    useEffect(() => {
        setLights(initialLights);
    }, [setLights]);

    return (
        <>
            <Button variant="contained" onClick={() => {
                navigate("/");
            }}>
                Back to Home
            </Button>
            <Button variant="contained" onClick={() => {
                const lights = useLightsStore.getState().lights;
                const newLight: LightInfo = {
                    id: Math.random().toString(36).substring(7),
                    x: 0,
                    y: 0,
                    name: "New Light",
                };
                useLightsStore.getState().setLights([...lights, newLight]);
            }}>
                Add Light
            </Button>
            <ConfirmDeleteDialog
                open={popupId == undefined ? false : true}
                id={popupId!}
                title="Delete this light?"
                message="Are you sure you want to delete it?"
                onNo={() => setPopupId(undefined)}
                onYes={(id) => handleDelete(id)}
            />
            <Stage draggable width={window.innerWidth} height={window.innerHeight} onWheel={handleWheel}>
                <KonvaGrid
                    width={window.innerWidth}
                    height={window.innerHeight}
                    pixelPerTick={50}
                />

                <Layer>
                    {lights.map((light) => (
                        <Circle
                            key={light.id}
                            x={light.x}
                            y={light.y}
                            radius={30}
                            fill="green"
                            draggable
                            onClick={() => setPopupId(light.id)}
                            onDragEnd={(e) => {
                                const { x, y } = e.target.position();
                                updateLightPos(light.id, x, y);
                            }}
                        />
                    ))}
                </Layer>
                <Lightanimation isMovingAlongX={true} xStart={-300} xEnd={300} isMovingAlongY={false} yStart={0} yEnd={100} speed={120} />
            </Stage>
        </>
    );
};

export default StageEditor;
