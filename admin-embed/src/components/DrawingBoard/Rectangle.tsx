import React, { useRef, useEffect, useCallback } from "react";
import { Rect as KonvaRectangle, Transformer } from "react-konva";

import { LIMITS } from "./constants";
import { selectShape, transformRectangleShape, moveShape } from "./state";
import { KonvaEventObject } from "konva/lib/Node";
import { Box } from "konva/lib/shapes/Transformer";
import { Vector2d } from "konva/lib/types";

const boundBoxCallbackForRectangle = (oldBox: Box, newBox: Box) => {
  // limit resize
  if (
    newBox.x < 0 ||
    newBox.y < 0 ||
    newBox.width < LIMITS.RECT.MIN ||
    newBox.height < LIMITS.RECT.MIN ||
    newBox.width > LIMITS.RECT.MAX ||
    newBox.height > LIMITS.RECT.MAX
  ) {
    return oldBox;
  }
  return newBox;
};

const dragBoundFunc = (pos: Vector2d) => {
  if (pos.x < 0) pos.x = 0;
  if (pos.y < 0) pos.y = 0;
  return pos;
};

export function Rectangle({ id, isSelected, type, ...shapeProps }: any) {
  const shapeRef = useRef<any>();
  const transformerRef = useRef<any>();

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
