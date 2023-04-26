import { useEffect, useRef } from "react";
import { Point } from "../../schemas";
import { cluster } from "./kmeans";

// const refreshScreen = async (data: TupleArray) => {
//   if (data.length < 10) return;
//   const canvas = canvasRef.current;
//   const context = canvas!.getContext("2d")!;
//   const aspectRatio = context.canvas.width / context.canvas.height;
//   const { clusters } = optimalKMeans(data, 100, 4, aspectRatio);
//   context.clearRect(0, 0, context.canvas.width, context.canvas.height);
//   const maxWidth = context.canvas.width / 70;
//   const alpha = 25 / data.length;
//   clusters.map((label, index) => {
//     const hue = 5 + (360 / clusters.length) * index;
//     context.fillStyle = `hsla(${hue}, 95%, 70%, ${alpha})`;
//     label.points.map(([x, y]) => {
//       for (let i = 5; i < maxWidth; i += 5) {
//         context.beginPath();
//         context.arc(
//           (x * context.canvas.width) / 2,
//           (y * context.canvas.height) / 2,
//           i,
//           0,
//           2 * Math.PI
//         );
//         context.fill();
//       }
//     });
//     const [x, y] = label.centroid;
//     const p = label.points.length / data.length;
//     context.font = `${context.canvas.width / 30}px Thunder, "Arial Black"`;
//     context.textAlign = "center";
//     context.textBaseline = "middle";
//     context.strokeStyle = `hsla(${hue}, 95%, 80%, 1)`;
//     context.lineWidth = 10;
//     const textX = Math.min(Math.max(0.07, x), 0.93);
//     const textY = Math.min(Math.max(0.07, y), 0.93);
//     context.strokeText(
//       `${Math.round(p * 100)}%`,
//       (textX * context.canvas.width) / 2,
//       (textY * context.canvas.height) / 2
//     );
//     context.fillStyle = `hsla(${hue}, 95%, 0%, 1)`;
//     context.fillText(
//       `${Math.round(p * 100)}%`,
//       (textX * context.canvas.width) / 2,
//       (textY * context.canvas.height) / 2
//     );
//   });
// };

function drawPoints(points: Point[], canvas: HTMLCanvasElement) {
  const context = canvas!.getContext("2d")!;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  const radius = Math.min(
    Math.max(context.canvas.width / points.length / 1.5, 15),
    90
  );
  const alpha = Math.max(0.1, 50 / points.length);

  const clusters = cluster(points, window.innerHeight / window.innerWidth);
  clusters?.forEach(([center, points, error], index) => {
    console.log("center", center);
    const hue = 5 + (360 / clusters.length) * index;
    context.fillStyle = `hsla(${hue}, 95%, 70%, ${alpha})`;
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
  });
}

export default function Clustering({ points }: { points: Point[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    drawPoints(points, canvas);
  }, [points]);

  return (
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
  );
}
