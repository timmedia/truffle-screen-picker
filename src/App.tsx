import { useEffect, useRef, useState } from "react";
import {
  embed,
  app,
  getSrcByImageObj,
  TruffleOrgClient,
  user,
} from "@trufflehq/sdk";

import "./App.css";

function App() {
  const iframeRef = useRef(null);

  const [count, setCount] = useState(0);

  const [isSmall, setIsSmall] = useState(true);
  const [hasBorder, setHasBorder] = useState(false);

  const setSize = () => {};

  const setBorder = () => {
    if (hasBorder) {
      embed.setStyles({
        border: "none",
      });
      setHasBorder(false);
    } else {
      embed.setStyles({
        border: "5px solid red",
      });
      setHasBorder(true);
    }
  };

  let x = 0,
    y = 0;

  const setPosition = () => {
    user.observable;
    console.log(window.parent.document);
  };

  const onIframeLoad = () => {
    embed.setStyles({
      minHeight: "480px",
    });
  };

  return (
    <div className="app">
      <main>
        <div className="video-container">
          <iframe
            src="https://yewtu.be/embed/DfJcWZoguQY?volume=0&controls=0"
            className="video-frame"
            onLoad={onIframeLoad}
            ref={iframeRef}
          ></iframe>
        </div>
        <div className="controls">
          <h1>Select your position</h1>
          <button onClick={setSize}>Toggle Size</button>
          <button onClick={setBorder}>Toggle Border</button>
          <button onClick={setPosition}>Set position</button>
        </div>
      </main>
    </div>
  );
}

export default App;
