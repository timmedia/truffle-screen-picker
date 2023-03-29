import { useEffect, useRef, useState } from "react";

export function MouseVisualizer() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // useEffect(() => {
  //   const updateMousePosition = (event: MouseEvent) => {
  //     setMousePosition({ x: event.clientX, y: event.clientY });
  //   };
  //   window.addEventListener("mousemove", updateMousePosition);
  //   return () => window.removeEventListener("mousemove", updateMousePosition);
  // }, []);

  // useEffect(() => {

  //   requestAnimationFrame(() => {
  //     ctx.fillStyle = "rgb(128, 128, 128, 0.2)";
  //     ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //     fadeOut();
  //   });
  // }, [mousePosition]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);
    let fadeOut: () => any = () =>
      requestAnimationFrame(() => {
        ctx.fillStyle = "rgb(128, 128, 128, 0.05)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
    // context.fillStyle = "rgb(146, 227, 227)";
    context.fillStyle = "white";
    context.beginPath();
    context.arc(offsetX, offsetY, 20, 0, 2 * Math.PI);
    context.fill();
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: mousePosition.y,
          left: mousePosition.x,
        }}
      >
        hello
      </div>
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
