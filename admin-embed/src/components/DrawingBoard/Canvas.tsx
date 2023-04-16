import { useRef, useCallback, useState, useEffect, ChangeEvent } from "react";
import { Layer, Stage, Image } from "react-konva";
import {
  Input,
  Card,
  Box,
  Button,
  Fab,
  Stack,
  SpeedDial,
  SpeedDialAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  ButtonGroup,
} from "@mui/material";

import {
  useShapes,
  clearSelection,
  createCircle,
  createRectangle,
  saveDiagram,
  reset,
  getState,
  deleteSelection,
  setBackgroundImageSrc,
} from "./state";
import { Shape } from "./Shape";
import {
  Add,
  AddBox,
  Delete,
  Rectangle,
  Replay,
  Save,
  Upload,
  AddCircle,
  Wallpaper,
  AspectRatio,
} from "@mui/icons-material";
import { DrawingBoardState, Shapes } from "./schemas";

export function Canvas() {
  const fileUploadRef = useRef<any>();
  const shapes = useShapes((state: DrawingBoardState) =>
    Object.entries(state.shapes)
  );

  const backgroundImageSrc = useShapes((state) => state.backgroundImageSrc);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  const [hasSelection, setHasSelection] = useState<string | null>(null);

  useEffect(() => {
    setHasSelection(getState().selected);
  });

  const stageRef = useRef<any>();

  const addVotingArea = (type: Shapes) => {
    switch (type) {
      case Shapes.Rectangle:
        createRectangle(0.5, 0.5);
        break;
      case Shapes.Circle:
        createCircle(0.5, 0.5);
        break;
    }
  };

  const uploadBackgroundImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    const file = e.target.files[0];
    const src = URL.createObjectURL(file);
    setBackgroundImageSrc(src);
    const img = new window.Image();
    img.src = src;
    setBackgroundImage(img);
  };

  return (
    <Stack spacing={1} direction="column">
      <Stack spacing={1} direction="row">
        <ButtonGroup
          variant="contained"
          aria-label="outlined primary button group"
        >
          <Button onClick={reset} variant="contained">
            File
          </Button>
          <Button onClick={reset} variant="contained">
            Edit
          </Button>
          <Button
            onClick={saveDiagram}
            startIcon={<Save />}
            variant="contained"
          >
            Add Binning Area
          </Button>
        </ButtonGroup>
      </Stack>
      <Card variant="outlined" sx={{ position: "relative" }}>
        <Stage
          ref={stageRef}
          width={window.innerWidth - 48}
          height={(window.innerWidth - 48) / aspectRatio}
          onClick={clearSelection}
        >
          <Layer>
            {backgroundImage !== null && (
              <Image
                image={backgroundImage}
                width={window.innerWidth - 48}
                height={(window.innerWidth - 48) / aspectRatio}
              />
            )}
          </Layer>
          <Layer>
            {shapes.map(([key, shape]) => (
              <Shape key={key} shape={{ ...shape, id: key }} />
            ))}
          </Layer>
        </Stage>
        <Fab
          size="small"
          color="primary"
          onClick={() =>
            hasSelection === null ? null : deleteSelection(hasSelection)
          }
          aria-label="delete"
          sx={{ position: "absolute", right: "120px", bottom: "10px" }}
        >
          <AspectRatio />
        </Fab>
        <Fab
          size="small"
          disabled={!hasSelection}
          color="error"
          onClick={() =>
            hasSelection === null ? null : deleteSelection(hasSelection)
          }
          aria-label="delete"
          sx={{ position: "absolute", right: "170px", bottom: "10px" }}
        >
          <Delete />
        </Fab>
        <SpeedDial
          key="Add"
          icon={<Add />}
          ariaLabel="Add area"
          FabProps={{ size: "small" }}
          sx={{ position: "absolute", right: "10px", bottom: "10px" }}
        >
          <SpeedDialAction
            key="Add Rectangular Area"
            tooltipTitle="Rectangle"
            tooltipOpen
            onClick={() => addVotingArea(Shapes.Rectangle)}
            icon={<AddBox />}
          />
          <SpeedDialAction
            key="Add Circular Area"
            tooltipTitle="Circle"
            tooltipOpen
            onClick={() => addVotingArea(Shapes.Circle)}
            icon={<AddCircle />}
          />
        </SpeedDial>
        <SpeedDial
          key="Background"
          icon={<Wallpaper />}
          ariaLabel="Add Background"
          FabProps={{ size: "small" }}
          sx={{ position: "absolute", right: "60px", bottom: "10px" }}
        >
          <SpeedDialAction
            key="Add Rectangular Area"
            tooltipTitle="Upload Image"
            tooltipOpen
            onClick={() => fileUploadRef.current.click()}
            icon={<Upload />}
          />
          <input
            ref={fileUploadRef}
            type="file"
            accept="image/*"
            hidden
            onChange={uploadBackgroundImage}
          />
        </SpeedDial>
      </Card>
      <Stack spacing={1} direction="row">
        <ButtonGroup
          variant="contained"
          aria-label="outlined primary button group"
        >
          <Button
            onClick={saveDiagram}
            startIcon={<Save />}
            variant="contained"
          >
            Save & Upload
          </Button>
          <Button onClick={reset} startIcon={<Replay />} variant="contained">
            Reset Canvas
          </Button>
        </ButtonGroup>
      </Stack>
    </Stack>
  );
}
