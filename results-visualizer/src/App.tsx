import { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import "./App.css";
import { get, ref } from "firebase/database";

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
    refreshScreen();
    // const interval = setInterval(() => refreshScreen(), 10000);
    // return () => clearInterval(interval);
  }, [pollId]);

  const refreshScreen = async () => {
    console.log("refreshing screen");
    const snapshot = await get(ref(db, `polls/${pollId}`));
    const data = snapshot.val() as { [key: string]: [number, number] };
    const canvas = canvasRef.current;
    const context = canvas!.getContext("2d")!;
    context.fillStyle = "rgba(0, 0, 0, 0.2)";
    // context.filter = "blur(20px)";
    Object.values(data).map(([relX, relY]) => {
      context.beginPath();
      context.arc(
        (relX * context.canvas.width) / 2,
        (relY * context.canvas.height) / 2,
        20,
        0,
        2 * Math.PI
      );
      context.fill();
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
