import { createStore } from "@halka/state";
import produce from "immer";
import { nanoid } from "nanoid";

import { DEFAULTS } from "./constants";
import { DrawingBoardState } from "./schemas";
import { KonvaEventObject } from "konva/lib/Node";
import { Rect } from "konva/lib/shapes/Rect";
import { Stage } from "konva/lib/Stage";
import { savePollLayout } from "../../firebase";
import { getAccessToken } from "@trufflehq/sdk";
import { v4 as uuidv4 } from "uuid";
import { PollLayout } from "../../schemas";

const baseState: DrawingBoardState = {
  selected: null,
  width: Math.min(window.innerWidth - 48, 700),
  name: "New Layout",
  aspectRatio: 16 / 9,
  backgroundImageSrc: null,
  id: uuidv4(),
  areas: {},
};

export const useDrawingBoard = createStore({ ...baseState, id: uuidv4() });

const setState: (fn: (state: DrawingBoardState) => void) => void = (fn) =>
  useDrawingBoard.set(produce(fn));

export const saveDiagram = async () => {
  const state = useDrawingBoard.get();
  const result = await savePollLayout({
    accessToken: await getAccessToken(),
    areas: Object.values(state.areas),
    name: state.name,
    id: state.id,
  });
  reset();
  return result.data;
};

export const loadLayout = (layout: PollLayout & { id: string }) => {
  reset();
  setState((state) => {
    state.name = layout.name;
    state.id = layout.id;
    state.areas = layout.areas.reduce(
      (obj, curr) => ({ ...obj, [nanoid()]: curr }),
      {} as any
    );
  });
};

export const reset = () => {
  useDrawingBoard.set({ ...baseState, id: uuidv4() });
};

export const setBackgroundImageSrc = (src: string) => {
  setState((state) => {
    state.backgroundImageSrc = src;
  });
};

export const setWidth = (width: number) => {
  setState((state) => {
    state.width = width;
  });
};

export const setName = (name: string) => {
  setState((state) => {
    state.name = name;
  });
};

export const setAspectRatio = (ratio: number) => {
  setState((state) => {
    state.aspectRatio = ratio;
  });
};

export const createRectangle = (x: number, y: number) => {
  setState((state) => {
    const id = nanoid();
    state.areas[id] = {
      width: DEFAULTS.RECT.WIDTH,
      height: DEFAULTS.RECT.HEIGHT,
      x: x - DEFAULTS.RECT.WIDTH / 2,
      y: y - DEFAULTS.RECT.HEIGHT / 2,
    };
  });
};

export const selectShape = (id: string) => {
  setState((state: DrawingBoardState) => {
    state.selected = id;
  });
};

export const clearSelection = () => {
  setState((state) => {
    state.selected = null;
  });
};

export const deleteSelection = (id: string) => {
  setState((state) => {
    state.selected = null;
    delete state.areas[id];
  });
};

export const moveShape = (
  id: string,
  stage: Stage,
  event: KonvaEventObject<Event>
) => {
  setState((state) => {
    const shape = state.areas[id];
    if (shape) {
      shape.x = event.target.x() / stage.width();
      shape.y = event.target.y() / stage.height();
    }
  });
};

export const transformRectangleShape = (
  node: Rect,
  id: string,
  stage: Stage,
  event: KonvaEventObject<Event>
) => {
  // transformer is changing scale of the node
  // and NOT its width or height
  // but in the store we have only width and height
  // to match the data better we will reset scale on transform end
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();

  // we will reset the scale back
  node.scaleX(1);
  node.scaleY(1);

  const { x, y } = node.getAbsolutePosition();

  setState((state: DrawingBoardState) => {
    const shape = state.areas[id];
    if (shape) {
      shape.x = x / stage.width();
      shape.y = y / stage.height();
      shape.width = (node.width() * scaleX) / stage.width();
      shape.height = (node.height() * scaleY) / stage.height();
    }
  });
};
