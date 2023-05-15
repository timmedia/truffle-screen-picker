import { useEffect, useRef, useState } from "react";
import "./App.css";
import { getPollLayout, pollDataSubscription } from "./firebase";
import { PollLayout } from "./schemas";
import { AreaBinning } from "./components/AreaBinning";
import { Clustering } from "./components/Clustering";

function App() {
  const [data, setData] = useState<[number, number][] | undefined>(undefined);
  const [layout, setLayout] = useState<PollLayout | null | undefined>(
    undefined
  );

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
    </div>
  );
}

export default App;
