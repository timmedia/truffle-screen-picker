import { useEffect, useRef, useState } from "react";
import { Point } from "../schemas";
import { cluster } from "./kmeans";
import colormap from "colormap";
import { distance, distance2, rgba2hsla } from "../math";

type Label = [Point, number, [number, number, number]];

function drawPoints(points: Point[], canvas: HTMLCanvasElement) {
  const aspectRatio = window.innerHeight / window.innerWidth;
  const context = canvas!.getContext("2d")!;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  const radius =
    context.canvas.width / Math.max(Math.min(points.length, 100), 50);
  const clusters = cluster(points, aspectRatio);
  const nshades = Math.max(72, clusters.length);
  const colors = colormap({
    colormap: "jet",
    nshades,
    format: "rgba",
    alpha: Math.max(0.1, 10 / points.length),
  }).map(([r, g, b, a]) => rgba2hsla(r, g, b, a));

  const lables: Array<Label> = clusters.map(
    ([center, clusterPoints], index) => [
      center,
      Math.round((clusterPoints.length / points.length) * 100),
      colors[Math.floor((nshades / clusters.length) * index)].slice(0, -1) as [
        number,
        number,
        number
      ],
    ]
  );
  lables[lables.length - 1][1] =
    100 -
    lables
      .slice(0, -1)
      .map((label) => label[1])
      .reduce((prev, curr) => prev + curr, 0);

  clusters?.forEach(([center, points], index) => {
    points.sort(
      (a, b) =>
        distance2(b, center, aspectRatio) - distance2(a, center, aspectRatio)
    );
    const [h, s, l, a] =
      colors[Math.floor((nshades / clusters.length) * index)];

    context.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${a})`;
    points.forEach(([x, y]) => {
      context.beginPath();
      context.arc(
        (x * context.canvas.width) / 2,
        (y * context.canvas.height) / 2,
        radius,
        0,
        2 * Math.PI
      );
      context.fill();
    });

    const enclosingMaxIndex = Math.max(10, 0.5 * points.length);

    const enclosingRadius = Math.max(
      points
        .slice(0, enclosingMaxIndex)
        .map((point) => distance(point, center, aspectRatio))
        .reduce((prev, curr) => prev + curr) / enclosingMaxIndex,
      0.1
    );

    context.strokeStyle = `hsla(${h}, ${s}%, 90%, 1)`;
    context.fillStyle = `hsla(${h}, ${s}%, 90%, 0.7)`;
    context.lineWidth = 8;
    context.beginPath();
    context.arc(
      (center[0] * context.canvas.width) / 2,
      (center[1] * context.canvas.height) / 2,
      (enclosingRadius * context.canvas.width) / 2,
      0,
      2 * Math.PI
    );
    context.fill();
    context.stroke();
  });
  return lables;
}

export function Clustering({ points }: { points: Point[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lables, setLables] = useState<Array<Label>>([]);

  useEffect(() => {
    if (canvasRef === null) return;
    const canvas = canvasRef.current;
    if (canvas === null) return;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const context = canvas.getContext("2d")!;
    context.scale(2, 2);
  }, [canvasRef]);

  useEffect(() => {
    if (canvasRef === null) return;
    const canvas = canvasRef.current;
    if (canvas === null) return;
    if (points.length === 0) return;
    setLables(drawPoints(points, canvas));
  }, [points]);

  return (
    <>
      <svg
        viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 6000,
        }}
      >
        {lables.map(([center, percentage, [h, s, l]], index) => (
          <text
            key={index}
            textAnchor="middle"
            alignmentBaseline="baseline"
            x={window.innerWidth * center[0]}
            y={window.innerHeight * center[1]}
            style={{
              fill: `hsla(${h}, ${s}%, 5%, 1)`,
              fontFamily: "Thunder",
              fontSize: `clamp(50px, 8vw, 400px)`,
              transform: "translateY(5vh)",
              transition: "x 200ms ease",
            }}
          >
            {percentage}%
          </text>
        ))}
      </svg>
      <canvas
        style={{
          position: "absolute",
          top: "0px",
          left: "0px",
          width: "100vw",
          height: "100vh",
        }}
        ref={canvasRef}
      ></canvas>
    </>
  );
}
