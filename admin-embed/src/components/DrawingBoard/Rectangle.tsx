import React, { useRef, useEffect, useCallback } from "react";
import {
  KonvaNodeComponent,
  Rect as KonvaRectangle,
  Transformer,
} from "react-konva";

import { DEFAULTS, LIMITS } from "./constants";
import {
  selectShape,
  transformRectangleShape,
  moveShape,
  useDrawingBoard,
} from "./state";
import { KonvaEventObject } from "konva/lib/Node";
import { Box } from "konva/lib/shapes/Transformer";
import { Vector2d } from "konva/lib/types";
import { Rect, RectConfig } from "konva/lib/shapes/Rect";

export function Rectangle({ id, isSelected, type, ...shapeProps }: any) {
  const shapeRef = useRef<Rect>(null);
  const transformerRef = useRef<any>();
  const state = useDrawingBoard();

  useEffect(() => {
    if (isSelected) {
      transformerRef?.current?.nodes([shapeRef.current]);
      transformerRef?.current?.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleSelect = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      event.cancelBubble = true;
      selectShape(id);
    },
    [id]
  );

  const dragBoundFunc = (pos: Vector2d) => {
    const width: number = shapeRef.current?.attrs.width ?? DEFAULTS.RECT.WIDTH;
    const height: number =
      shapeRef.current?.attrs.height ?? DEFAULTS.RECT.HEIGHT;
    if (pos.x < 0) pos.x = 0;
    if (pos.y < 0) pos.y = 0;
    if (pos.x + width > state.width) pos.x = state.width - width;
    if (pos.y + height > state.width / state.aspectRatio)
      pos.y = state.width / state.aspectRatio - height;
    return pos;
  };

  const boundBoxCallbackForRectangle = (oldBox: Box, newBox: Box) => {
    if (newBox.x < 0) {
      newBox.x = 0;
      newBox.width = oldBox.width + oldBox.x;
    } else if (newBox.x + newBox.width > state.width) {
      newBox.width = state.width - newBox.x;
    }
    if (newBox.y < 0) {
      newBox.y = 0;
      newBox.height = oldBox.height + oldBox.y;
    } else if (newBox.y + newBox.height > state.width / state.aspectRatio) {
      newBox.height = state.width / state.aspectRatio - newBox.y;
    }
    return newBox;
  };

  const handleDrag = useCallback(
    (event: KonvaEventObject<DragEvent>) => {
      moveShape(id, event);
    },
    [id]
  );

  const handleTransform = useCallback(
    (event: KonvaEventObject<Event>) => {
      transformRectangleShape(shapeRef.current, id, event);
    },
    [id]
  );

  return (
    <>
      <KonvaRectangle
        onClick={handleSelect}
        onTap={handleSelect}
        onDragStart={handleSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={handleDrag}
        onTransformEnd={handleTransform}
        dragBoundFunc={dragBoundFunc}
        fill="rgba(0, 0, 0, 0.3)"
      />
      {isSelected && (
        <Transformer
          anchorSize={5}
          rotateEnabled={false}
          borderDash={[6, 2]}
          ref={transformerRef}
          keepRatio={false}
          boundBoxFunc={boundBoxCallbackForRectangle}
        />
      )}
    </>
  );
}
