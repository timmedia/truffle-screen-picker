import React, { useCallback } from "react";

import { useDrawingBoard } from "./state";
import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";
import { DrawingBoardState, Shapes } from "./schemas";

export function Shape({ shape }: any) {
  const isSelectedSelector = useCallback(
    (state: DrawingBoardState) => state.selected === shape.id,
    [shape]
  );
  const isSelected = useDrawingBoard(isSelectedSelector);

  if (shape.type === Shapes.Rectangle) {
    return <Rectangle {...shape} isSelected={isSelected} />;
  } else if (shape.type === Shapes.Circle) {
    return <Circle {...shape} isSelected={isSelected} />;
  }

  return null;
}
