import { useEffect, useRef, useState } from "react";
import { optimalKMeans, TupleArray } from "./kmeans";
import "./App.css";
import { getPollLayout, pollDataSubscription } from "./firebase";
import { PollLayout } from "./schemas";
import AreaBinning from "./components/AreaBinning";
import Clustering from "./components/Clustering";

function App() {
  const [data, setData] = useState<[number, number][] | undefined>(undefined);
  const [layout, setLayout] = useState<PollLayout | null | undefined>(
    undefined
  );

  // const canvasRef = useRef<HTMLCanvasElement>(null);

  const params = new URLSearchParams(window.location.search);
  const pollId = params.get("pollId");
  const orgId = params.get("orgId");

  if (typeof pollId !== "string")
    return (
      <h1>
        Please supply a <code>pollId</code> query parameter.
      </h1>
    );

  if (typeof orgId !== "string")
    return (
      <h1>
        Please supply an <code>orgId</code> query parameter.
      </h1>
    );

  useEffect(() => {
    const subscription = pollDataSubscription(pollId, (data) => {
      setData(data);
    });
    return () => subscription.unsubscribe();
  }, [pollId]);

  useEffect(() => {
    getPollLayout(pollId, orgId).then((data) => setLayout(data));
  }, [pollId, orgId]);

  // useEffect(() => {
  //   const canvas = canvasRef.current!;
  //   canvas.width = window.innerWidth * 2;
  //   canvas.height = window.innerHeight * 2;
  //   canvas.style.width = `${window.innerWidth}px`;
  //   canvas.style.height = `${window.innerHeight}px`;
  //   const context = canvas.getContext("2d")!;
  //   context.scale(2, 2);
  // }, []);

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

  return (
    <div
      style={{
        position: "absolute",
        top: "0px",
        left: "0px",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          fontFamily: "Thunder",
          fontSize: "3em",
          opacity: data === undefined ? 1 : 0,
          transition: "opacity 150ms ease",
        }}
      >
        <h1>Loading...</h1>
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          fontFamily: "Thunder",
          fontSize: "3em",
          opacity: data?.length === 0 ? 1 : 0,
          transition: "opacity 150ms ease",
        }}
      >
        <h1>No votes yet.</h1>
      </div>
      {data && layout && <AreaBinning layout={layout} points={data} />}
      {data && layout === null && <Clustering points={data} />}
      {/* <canvas
        style={{
          position: "absolute",
          top: "0px",
          left: "0px",
          width: "100vw",
          height: "100vh",
        }}
        ref={canvasRef}
      ></canvas> */}
    </div>
  );
}

export default App;
