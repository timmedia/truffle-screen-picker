import { useRef, useState, useEffect } from "react";
import { Layer, Stage, Image } from "react-konva";
import { Card, Fab, Stack } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useDrawingBoard, clearSelection, deleteSelection } from "./state";
import { DrawingBoardState } from "./schemas";
import { SetAspectRatio } from "./Menu/SetAspectRatio";
import Menu from "./Menu";
import { Stage as StageContainer } from "konva/lib/Stage";
import { shapesSelector } from "./selectors";
import { Rectangle } from "./Rectangle";

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

  return (
    <Stack spacing={1} direction="column">
      <Stack spacing={1} direction="row">
        <Menu />
      </Stack>
      <Card
        variant="outlined"
        sx={{ position: "relative", width: state.width }}
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
        <SetAspectRatio
          sx={{ position: "absolute", right: "120px", bottom: "10px" }}
        />
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
