import { useRef, useState, useEffect } from "react";
import { Layer, Stage, Image } from "react-konva";
import { Card, Fab, Stack } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useDrawingBoard, clearSelection, deleteSelection } from "./state";
import { DrawingBoardState } from "./schemas";
import { Stage as StageContainer } from "konva/lib/Stage";
import { shapesSelector } from "./selectors";
import { Rectangle } from "./Rectangle";
import { setWidth } from "./state";

const backgroundImageSrcSelector = (state: DrawingBoardState) =>
  state.backgroundImageSrc;

export function Canvas() {
  const shapes = useDrawingBoard(shapesSelector);
  const backgroundImageSrc = useDrawingBoard(backgroundImageSrcSelector);
  const state = useDrawingBoard();

  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  const stageRef = useRef<StageContainer>(null);

  useEffect(() => {
    if (backgroundImageSrc === null) return setBackgroundImage(null);
    const img = new window.Image();
    img.src = backgroundImageSrc;
    setBackgroundImage(img);
  }, [backgroundImageSrc]);

  useEffect(() => {
    const updateWindowDimensions = () => {
      setWidth(Math.min(window.innerWidth - 48, 700));
    };
    window.addEventListener("resize", updateWindowDimensions);
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);

  return (
    <Stack spacing={1} direction="column" sx={{ pt: 2 }}>
      <Card
        variant="outlined"
        sx={{
          position: "relative",
          width: state.width,
          background: "lightgrey",
        }}
      >
        <Stage
          ref={stageRef}
          width={state.width}
          height={state.width / state.aspectRatio}
          onClick={clearSelection}
        >
          <Layer>
            {backgroundImage !== null && (
              <Image
                image={backgroundImage}
                width={state.width}
                height={state.width / state.aspectRatio}
              />
            )}
          </Layer>
          <Layer>
            {shapes.map(
              ([key, shape]) =>
                stageRef.current !== null && (
                  <Rectangle
                    key={key}
                    id={key}
                    stage={stageRef.current}
                    shape={shape}
                  />
                )
            )}
          </Layer>
        </Stage>
        <Fab
          size="small"
          disabled={state.selected === null}
          color="error"
          onClick={() =>
            state.selected !== null && deleteSelection(state.selected)
          }
          aria-label="delete"
          sx={{ position: "absolute", right: "10px", bottom: "10px" }}
        >
          <Delete />
        </Fab>
      </Card>
    </Stack>
  );
}
