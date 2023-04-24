import { useRef, useEffect, useCallback, useState } from "react";
import { Rect as KonvaRectangle, Line, Transformer } from "react-konva";
import {
  selectShape,
  transformRectangleShape,
  moveShape,
  useDrawingBoard,
} from "./state";
import { KonvaEventObject } from "konva/lib/Node";
import { Box } from "konva/lib/shapes/Transformer";
import { Rect } from "konva/lib/shapes/Rect";
import { Stage } from "konva/lib/Stage";
import { shapesSelector } from "./selectors";
import { DrawingBoardState, RectangleItem } from "./schemas";

export function Rectangle({
  id,
  stage,
  shape,
}: {
  id: string;
  stage: Stage;
  shape: RectangleItem;
}) {
  const shapeRef = useRef<Rect>(null);
  const transformerRef = useRef<any>();
  const state = useDrawingBoard();
  const shapes = useDrawingBoard(shapesSelector);
  const [lines, setLines] = useState<[number, number, number, number][]>([]);
  const [guides, setGuides] = useState<{
    horizontal: number[];
    vertical: number[];
  }>({ horizontal: [], vertical: [] });

  const isSelectedSelector = useCallback(
    (state: DrawingBoardState) => state.selected === id,
    [shape]
  );
  const isSelected = useDrawingBoard(isSelectedSelector);

  const offset = 0.05;

  useEffect(() => {
    if (isSelected) {
      transformerRef?.current?.nodes([shapeRef.current]);
      transformerRef?.current?.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    let prevX = -1;
    let prevY = -1;
    const newGuides = {
      horizontal: [
        ...shapes
          .filter(([shapeId]) => shapeId !== id)
          .map(([_, shape]) => [shape.y, shape.y + shape.height])
          .flat(),
        0.5,
        0,
        1,
      ]
        .sort()
        .filter((value) => {
          if (Math.abs(value - prevY) < offset) return false;
          prevY = value;
          return true;
        }),
      vertical: [
        ...shapes
          .filter(([shapeId]) => shapeId !== id)
          .map(([_, shape]) => [shape.x, shape.x + shape.width])
          .flat(),
        0.5,
        0,
        1,
      ]
        .sort()
        .filter((value) => {
          if (Math.abs(value - prevX) < offset / state.aspectRatio)
            return false;
          prevX = value;
          return true;
        }),
    };
    setGuides(newGuides);
  }, [isSelected]);

  const handleSelect = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      event.cancelBubble = true;
      selectShape(id);
    },
    [id]
  );

  const boundBoxCallbackForRectangle = useCallback(
    (oldBox: Box, newBox: Box): Box => {
      setLines([]);
      if (newBox.x < 0) {
        newBox.x = 0;
        newBox.width = oldBox.width + oldBox.x;
      } else if (newBox.x + newBox.width > stage.width()) {
        newBox.width = stage.width() - newBox.x;
      } else if (newBox.x !== oldBox.x) {
        for (const xp of guides.vertical) {
          if (
            Math.abs(newBox.x / stage.width() - xp) <
            offset / state.aspectRatio
          ) {
            newBox.x = xp * stage.width();
            newBox.width = oldBox.x + oldBox.width - newBox.x;
            setLines((lines) => [...lines, [xp, 0, xp, 1]]);
            break;
          }
        }
      } else if (newBox.width !== oldBox.width) {
        for (const xp of guides.vertical) {
          if (
            Math.abs((newBox.x + newBox.width) / stage.width() - xp) <
            offset / state.aspectRatio
          ) {
            newBox.width = xp * stage.width() - oldBox.x;
            setLines((lines) => [...lines, [xp, 0, xp, 1]]);
            break;
          }
        }
      }

      if (newBox.y < 0) {
        newBox.y = 0;
        newBox.height = oldBox.height + oldBox.y;
      } else if (newBox.y + newBox.height > stage.height()) {
        newBox.height = stage.height() - newBox.y;
      } else if (newBox.y !== oldBox.y) {
        for (const yp of guides.horizontal) {
          if (Math.abs(newBox.y / stage.height() - yp) < offset) {
            newBox.y = yp * stage.height();
            newBox.height = oldBox.y + oldBox.height - newBox.y;
            setLines((lines) => [...lines, [0, yp, 1, yp]]);
            break;
          }
        }
      } else if (newBox.height !== oldBox.height) {
        for (const yp of guides.horizontal) {
          if (
            Math.abs((newBox.y + newBox.height) / stage.height() - yp) < offset
          ) {
            newBox.height = yp * stage.height() - oldBox.y;
            setLines((lines) => [...lines, [0, yp, 1, yp]]);
            break;
          }
        }
      }
      return newBox;
    },
    [id, stage, guides]
  );

  const handleDrag = useCallback(
    (event: KonvaEventObject<DragEvent>) => {
      setLines([]);
      moveShape(id, stage, event);
    },
    [id]
  );

  const handleTransform = useCallback(
    (event: KonvaEventObject<Event>) => {
      if (shapeRef.current !== null)
        transformRectangleShape(shapeRef.current, id, stage, event);
    },
    [id]
  );

  const dragMove = useCallback(
    (event: KonvaEventObject<DragEvent>) => {
      setLines([]);
      const {
        x: _x,
        y: _y,
        width: _w,
        height: _h,
      } = event.target.getClientRect();
      const x0 = _x / stage.width();
      const y0 = _y / stage.height();
      const w = _w / stage.width();
      const h = _h / stage.height();
      const x1 = (_x + _w) / stage.width();
      const y1 = (_y + _h) / stage.height();

      let targetX = x0;
      let targetY = y0;

      for (const xp of guides.vertical) {
        if (Math.abs(x0 - xp) < offset / state.aspectRatio) {
          targetX = xp;
          setLines((lines) => [...lines, [xp, 0, xp, 1]]);
          break;
        } else if (Math.abs(x1 - xp) < offset / state.aspectRatio) {
          targetX = xp - (x1 - x0);
          setLines((lines) => [...lines, [xp, 0, xp, 1]]);
          break;
        }
      }

      for (const yp of guides.horizontal) {
        if (Math.abs(y0 - yp) < offset) {
          targetY = yp;
          setLines((lines) => [...lines, [0, yp, 1, yp]]);
          break;
        } else if (Math.abs(y1 - yp) < offset) {
          targetY = yp - (y1 - y0);
          setLines((lines) => [...lines, [0, yp, 1, yp]]);
          break;
        }
      }

      event.target.absolutePosition({
        x: Math.min(1 - w, Math.max(0, targetX)) * stage.width(),
        y: Math.min(1 - h, Math.max(0, targetY)) * stage.height(),
      });
    },
    [id, stage, guides]
  );

  return (
    <>
      {isSelected &&
        lines.map(([x0, y0, x1, y1], index) => (
          <Line
            key={index}
            points={[
              x0 * stage.width(),
              y0 * stage.height(),
              x1 * stage.width(),
              y1 * stage.height(),
            ]}
            stroke="red"
            strokeWidth={1}
            dash={[4, 6]}
          />
        ))}
      <KonvaRectangle
        name={id}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragStart={handleSelect}
        ref={shapeRef}
        draggable
        onDragEnd={handleDrag}
        onTransformEnd={handleTransform}
        onDragMove={dragMove}
        fill="rgba(0, 0, 0, 0.3)"
        stroke="blue"
        strokeWidth={1}
        x={shape.x * stage.width()}
        y={shape.y * stage.height()}
        width={shape.width * stage.width()}
        height={shape.height * stage.height()}
        strokeScaleEnabled={false}
      />
      {isSelected && (
        <Transformer
          anchorSize={5}
          rotateEnabled={false}
          borderDash={[6, 2]}
          ref={transformerRef}
          keepRatio={false}
          boundBoxFunc={boundBoxCallbackForRectangle}
          onTransformEnd={() => setLines([])}
        />
      )}
    </>
  );
}
