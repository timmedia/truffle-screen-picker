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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
} from "@mui/material";

import {
  useDrawingBoard,
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
import { SetAspectRatio } from "./Menu/SetAspectRatio";
import Menu from "./Menu";

const shapesSelector = (state: DrawingBoardState) =>
  Object.entries(state.shapes);

export function Canvas() {
  const fileUploadRef = useRef<any>();
  const shapes = useDrawingBoard(shapesSelector);
  const state = useDrawingBoard();

  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

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
            {shapes.map(([key, shape]) => (
              <Shape key={key} shape={{ ...shape, id: key }} />
            ))}
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
          sx={{ position: "absolute", right: "170px", bottom: "10px" }}
        >
          <Delete />
        </Fab>
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
    </Stack>
  );
}
