import { useEffect, useRef } from "react";

export function MouseVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
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
  }, []);

  const draw = (e: any) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const canvas = canvasRef.current;
    const context = canvas!.getContext("2d")!;
    context.fillStyle = "white";
    context.beginPath();
    context.arc(offsetX, offsetY, 20, 0, 2 * Math.PI);
    context.fill();
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseMove={draw}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      ></canvas>
    </>
  );
}
