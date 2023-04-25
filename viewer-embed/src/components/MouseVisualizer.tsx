import { useCallback, useState } from "react";
import { useEffect, useRef, MouseEvent } from "react";
import { type PollLayout } from "../schemas";

const STROKE_WIDTH = 0.002;

export function MouseVisualizer(props: {
  onClick: (event: MouseEvent<HTMLElement | SVGElement>) => void;
  layout?: PollLayout | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState([-1, -1]);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [activeArea, setActiveArea] = useState(-1);

  function setCanvasDimensions(
    canvas: HTMLCanvasElement,
    width: number,
    height: number
  ) {
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    setAspectRatio(canvas.width / canvas.height);
  }

  useEffect(() => {
    if (canvasRef.current == null) return;
    const canvas = canvasRef.current;
    setCanvasDimensions(canvas, window.innerWidth, window.innerHeight);
    const context = canvas.getContext("2d")!;
    context.scale(2, 2);
    let fadeOut: () => any = () =>
      requestAnimationFrame(() => {
        context.fillStyle = "rgb(128, 128, 128, 0.05)";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        fadeOut();
      });
    fadeOut();
    return () => {
      fadeOut = () => {};
    };
  }, [canvasRef]);

  useEffect(() => {
    const updateWindowDimensions = () => {
      if (canvasRef.current == null) return;
      setCanvasDimensions(
        canvasRef.current,
        window.innerWidth,
        window.innerHeight
      );
    };
    window.addEventListener("resize", updateWindowDimensions);
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, [canvasRef]);

  const draw = useCallback(
    ({ nativeEvent }: MouseEvent<HTMLCanvasElement>) => {
      const { offsetX: mx, offsetY: my } = nativeEvent;
      const [pmx, pmy] = mousePosition;
      const canvas = canvasRef.current;
      const context = canvas!.getContext("2d")!;
      context.fillStyle = "black";
      context.lineWidth = 50;
      context.lineCap = "round";
      context.beginPath();
      context.fill();
      if (pmx > 0 && pmy > 0 && (pmx - mx) ** 2 + (pmy - my) ** 2 < 10000) {
        context.moveTo(pmx, pmy);
      } else {
        context.moveTo(mx, my);
      }
      context.lineTo(mx, my);
      context.stroke();
      setMousePosition([mx, my]);
    },
    [canvasRef, mousePosition]
  );

  return (
    <span
      onMouseMove={draw}
      onClick={(event) =>
        props.layout === null ? props.onClick(event) : void null
      }
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          padding: 0,
          margin: 0,
          zIndex: 5510,
        }}
      ></canvas>
      {props?.layout && (
        <svg
          viewBox="0 0 1 1"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 5511,
            filter: "drop-shadow(5px 5px 20px rgba(var(--primary-celeste), 1))",
          }}
        >
          <rect
            width={1}
            height={1}
            x={0}
            y={0}
            fill="transparent"
            onMouseMove={() => setActiveArea(-1)}
          />
          {props.layout.areas.map(({ x, y, width, height }, index) => (
            <>
              <line
                x1={x - STROKE_WIDTH / 2}
                y1={y}
                x2={x + width + STROKE_WIDTH / 2}
                y2={y}
                stroke={activeArea === index ? "white" : "none"}
                strokeWidth={STROKE_WIDTH * aspectRatio}
              />
              <line
                x1={x - STROKE_WIDTH / 2}
                y1={y + height}
                x2={x + width + STROKE_WIDTH / 2}
                y2={y + height}
                stroke={activeArea === index ? "white" : "none"}
                strokeWidth={STROKE_WIDTH * aspectRatio}
                strokeLinejoin="round"
              />
              <line
                x1={x}
                y1={y}
                x2={x}
                y2={y + height}
                stroke={activeArea === index ? "white" : "none"}
                strokeWidth={STROKE_WIDTH}
                strokeLinejoin="round"
              />
              <line
                x1={x + width}
                y1={y - STROKE_WIDTH / 2}
                x2={x + width}
                y2={y + height}
                stroke={activeArea === index ? "white" : "none"}
                strokeWidth={STROKE_WIDTH}
                strokeLinejoin="round"
              />
              <rect
                key={index}
                width={width}
                height={height}
                x={x}
                y={y}
                fill={
                  activeArea === index
                    ? "rgba(var(--primary-celeste), 0.6)"
                    : "transparent"
                }
                onMouseMove={() => setActiveArea(index)}
                onClick={props.onClick}
                style={{
                  cursor: "pointer",
                }}
              />
            </>
          ))}
        </svg>
      )}
    </span>
  );
}
