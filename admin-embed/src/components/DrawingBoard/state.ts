import { createStore } from "@halka/state";
import produce from "immer";
import { nanoid } from "nanoid";

import { DEFAULTS, LIMITS } from "./constants";
import { DrawingBoardState } from "./schemas";
import { clamp } from "../../utils";
import { KonvaEventObject } from "konva/lib/Node";
import { Rect } from "konva/lib/shapes/Rect";
import { Stage } from "konva/lib/Stage";

const baseState: DrawingBoardState = {
  selected: null,
  width: Math.min(window.innerWidth - 48, 700),
  aspectRatio: 16 / 9,
  backgroundImageSrc: null,
  shapes: {},
};

export const useDrawingBoard = createStore({ ...baseState });

const setState: (fn: (state: DrawingBoardState) => void) => void = (fn) =>
  useDrawingBoard.set(produce(fn));

export const saveDiagram = () => {
  // TODO
};

export const reset = () => {
  useDrawingBoard.set(baseState);
};

export const setBackgroundImageSrc = (src: string) => {
  setState((state) => {
    state.backgroundImageSrc = src;
  });
};

export const createRectangle = (x: number, y: number) => {
  setState((state) => {
    const id = nanoid();
    state.shapes[id] = {
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
    delete state.shapes[id];
  });
};

export const moveShape = (
  id: string,
  stage: Stage,
  event: KonvaEventObject<Event>
) => {
  setState((state) => {
    const shape = state.shapes[id];
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

  setState((state: any) => {
    const shape = state.shapes[id];
    if (shape) {
      shape.x = node.x() / stage.width();
      shape.y = node.y() / stage.height();

      shape.width = (node.width() * scaleX) / stage.width();
      shape.height = (node.height() * scaleY) / stage.height();
    }
  });
};
