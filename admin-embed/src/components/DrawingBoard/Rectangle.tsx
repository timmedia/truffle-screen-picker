import React, { useRef, useEffect, useCallback } from "react";
import { Rect as KonvaRectangle, Transformer } from "react-konva";

import { LIMITS } from "./constants";
import { selectShape, transformRectangleShape, moveShape } from "./state";
import { KonvaEventObject } from "konva/lib/Node";

const boundBoxCallbackForRectangle = (oldBox: any, newBox: any) => {
  // limit resize
  if (
    newBox.width < LIMITS.RECT.MIN ||
    newBox.height < LIMITS.RECT.MIN ||
    newBox.width > LIMITS.RECT.MAX ||
    newBox.height > LIMITS.RECT.MAX
  ) {
    return oldBox;
  }
  return newBox;
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
        fill="rgba(0, 0, 0, 0.3)"
      />
      {isSelected && (
        <Transformer
          anchorSize={5}
          rotateEnabled={false}
          clipFunc={() => console.log("clip func")}
          borderDash={[6, 2]}
          ref={transformerRef}
          boundBoxFunc={boundBoxCallbackForRectangle}
        />
      )}
    </>
  );
}
