import { createStore } from "@halka/state";
import produce from "immer";
import { nanoid } from "nanoid";

import { DEFAULTS, LIMITS } from "./constants";
import { DrawingBoardState, Shapes } from "./schemas";
import { clamp } from "../../utils";

const baseState: DrawingBoardState = {
  selected: null,
  backgroundImageSrc: null,
  shapes: {},
};

export const useShapes = createStore({ ...baseState });

const setState: (fn: (state: DrawingBoardState) => void) => void = (fn) =>
  useShapes.set(produce(fn));

export const getState = () => useShapes.get();

export const saveDiagram = () => {
  // TODO
};

export const reset = () => {
  useShapes.set(baseState);
};

export const setBackgroundImageSrc = (src: string) => {
  setState((state) => {
    state.backgroundImageSrc = src;
  });
};

export const createRectangle = (x: number, y: number) => {
  setState((state) => {
    state.shapes[nanoid()] = {
      type: Shapes.Rectangle,
      width: DEFAULTS.RECT.WIDTH,
      height: DEFAULTS.RECT.HEIGHT,
      x,
      y,
    };
  });
};

export const createCircle = (x: number, y: number) => {
  setState((state) => {
    state.shapes[nanoid()] = {
      type: Shapes.Circle,
      radius: DEFAULTS.CIRCLE.RADIUS,
      x,
      y,
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

export const moveShape = (id: any, event: any) => {
  setState((state) => {
    const shape = state.shapes[id];
    if (shape) {
      shape.x = event.target.x();
      shape.y = event.target.y();
    }
  });
};

export const updateAttribute = (attr: any, value: any) => {
  setState((state: any) => {
    const shape = state.shapes[state.selected];

    if (shape) {
      shape[attr] = value;
    }
  });
};

export const transformRectangleShape = (node: any, id: any, event: any) => {
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
      shape.x = node.x();
      shape.y = node.y();

      shape.rotation = node.rotation();

      shape.width = clamp(
        // increase the width in order of the scale
        node.width() * scaleX,
        // should not be less than the minimum width
        LIMITS.RECT.MIN,
        // should not be more than the maximum width
        LIMITS.RECT.MAX
      );
      shape.height = clamp(
        node.height() * scaleY,
        LIMITS.RECT.MIN,
        LIMITS.RECT.MAX
      );
    }
  });
};

export const transformCircleShape = (node: any, id: any, event: any) => {
  // transformer is changing scale of the node
  // and NOT its width or height
  // but in the store we have only width and height
  // to match the data better we will reset scale on transform end
  const scaleX = node.scaleX();

  // we will reset the scale back
  node.scaleX(1);
  node.scaleY(1);

  setState((state: any) => {
    const shape = state.shapes[id];

    if (shape) {
      shape.x = node.x();
      shape.y = node.y();

      shape.radius = clamp(
        (node.width() * scaleX) / 2,
        LIMITS.CIRCLE.MIN,
        LIMITS.CIRCLE.MAX
      );
    }
  });
};
