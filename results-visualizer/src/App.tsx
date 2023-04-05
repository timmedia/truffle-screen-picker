import { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import { get, onValue, ref } from "firebase/database";
import { optimalKMeans, TupleArray } from "./kmeans";
import "./App.css";

function App() {
  const [pollId, setPollId] = useState<string | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const context = canvas.getContext("2d")!;
    context.scale(2, 2);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("pollId");
    if (id !== null) setPollId(id);
  }, []);

  useEffect(() => {
    if (pollId === undefined) return;
    ref(db, `polls/${pollId}`);
    const unsubscribe = onValue(ref(db, `polls/${pollId}`), (snapshot) => {
      const data = snapshot.val() as { [key: string]: [number, number] };
      if (!data) return;
      refreshScreen(Object.values(data));
    });
    return () => unsubscribe();
  }, [pollId]);

  const refreshScreen = async (data: TupleArray) => {
    if (data.length < 10) return;
    const canvas = canvasRef.current;
    const context = canvas!.getContext("2d")!;
    const kmax = Math.min(10, Math.floor(data.length / 5));
    const aspectRatio = context.canvas.width / context.canvas.height;
    const { clusters } = optimalKMeans(data, 6, kmax, aspectRatio);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    const maxWidth = context.canvas.width / 70;
    const alpha = 25 / data.length;
    clusters.map((label, index) => {
      const hue = 5 + (360 / clusters.length) * index;
      context.fillStyle = `hsla(${hue}, 95%, 70%, ${alpha})`;
      label.points.map(([x, y]) => {
        for (let i = 5; i < maxWidth; i += 5) {
          context.beginPath();
          context.arc(
            (x * context.canvas.width) / 2,
            (y * context.canvas.height) / 2,
            i,
            0,
            2 * Math.PI
          );
          context.fill();
        }
      });
      const [x, y] = label.centroid;
      const p = label.points.length / data.length;
      context.font = `${context.canvas.width / 30}px Thunder`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.strokeStyle = `hsla(${hue}, 95%, 80%, 1)`;
      context.lineWidth = 10;
      const textX = Math.min(Math.max(0.07, x), 0.93);
      const textY = Math.min(Math.max(0.07, y), 0.93);
      context.strokeText(
        `${Math.round(p * 100)}%`,
        (textX * context.canvas.width) / 2,
        (textY * context.canvas.height) / 2
      );
      context.fillStyle = `hsla(${hue}, 95%, 0%, 1)`;
      context.fillText(
        `${Math.round(p * 100)}%`,
        (textX * context.canvas.width) / 2,
        (textY * context.canvas.height) / 2
      );
    });
  };

  return (
    <>
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

export default App;
