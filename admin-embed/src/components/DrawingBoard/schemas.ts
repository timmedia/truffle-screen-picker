import { z } from "zod";

export enum Shapes {
  Circle = "circle",
  Rectangle = "rect",
}

export interface CircleItem {
  type: Shapes.Circle;
  x: number;
  y: number;
  radius: number;
}

export interface RectangleItem {
  type: Shapes.Rectangle;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ShapeItem = CircleItem | RectangleItem;

export interface DrawingBoardState {
  selected: string | null;
  shapes: {
    [key: string]: ShapeItem;
  };
}
