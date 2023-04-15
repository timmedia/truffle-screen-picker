import { useRef, useCallback, useState } from "react";
import { Layer, Stage } from "react-konva";
import Card from "@mui/material/Card";

import {
  useShapes,
  clearSelection,
  createCircle,
  createRectangle,
  saveDiagram,
  reset,
} from "./state";
import { Shape } from "./Shape";
import { Box, Button, Stack } from "@mui/material";
import {
  Add,
  AddBox,
  Delete,
  Rectangle,
  Replay,
  Save,
} from "@mui/icons-material";
import { AddCircle } from "@mui/icons-material";
import { DrawingBoardState, Shapes } from "./schemas";

export function Canvas() {
  const shapes = useShapes((state: DrawingBoardState) =>
    Object.entries(state.shapes)
  );

  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  const stageRef = useRef<any>();

  const addVotingArea = (type: Shapes) => {
    switch (type) {
      case Shapes.Rectangle:
        createRectangle({
          x: 0.5,
          y: 0.5,
        });
        break;
      case Shapes.Circle:
        createCircle({ x: 0.5, y: 0.5 });
        break;
    }
  };

  return (
    <Stack spacing={1} direction="column">
      <Stack spacing={1} direction="row">
        <Button
          color="primary"
          onClick={() => addVotingArea(Shapes.Rectangle)}
          startIcon={<AddBox />}
          variant="contained"
        >
          Add rectangular area
        </Button>
        <Button
          color="primary"
          onClick={() => addVotingArea(Shapes.Circle)}
          startIcon={<AddCircle />}
          variant="contained"
        >
          Add circular area
        </Button>
      </Stack>
      <Card variant="outlined">
        <Stage
          ref={stageRef}
          width={window.innerWidth - 48}
          height={(window.innerWidth - 48) / aspectRatio}
          onClick={clearSelection}
        >
          <Layer>
            {shapes.map(([key, shape]) => (
              <Shape
                key={key}
                shape={{ ...shape, id: key, stroke: "1px solid red" }}
              />
            ))}
          </Layer>
        </Stage>
      </Card>
      <Stack spacing={1} direction="row">
        <Button
          color="warning"
          onClick={reset}
          startIcon={<Add />}
          variant="contained"
        >
          New Layout
        </Button>
        <Button
          color="success"
          onClick={saveDiagram}
          startIcon={<Save />}
          variant="contained"
        >
          Save
        </Button>
        <Button
          color="error"
          onClick={reset}
          startIcon={<Replay />}
          variant="contained"
        >
          Reset
        </Button>
      </Stack>
    </Stack>
  );
}
