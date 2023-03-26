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

  const onIframeLoad = (e: any) => {
    console.log(e);
    // embed.setStyles({
    //   minHeight: "480px",
    // });
  };

  const handleClick = (event: any) => {
    console.log(event.clientX, event.clientY);
  };

  return (
    <div className="app">
      <main onClick={handleClick}>
        <iframe
          src="https://yewtu.be/embed/DfJcWZoguQY?volume=0&controls=0"
          className="video-frame"
          onLoad={onIframeLoad}
          ref={iframeRef}
        ></iframe>
        <div className="overlay">
          <div className="overlay-text">
            <svg viewBox="0 0 140 80" xmlns="http://www.w3.org/2000/svg">
              <text
                text-anchor="middle"
                alignment-baseline="central"
                x="70"
                y="45"
                color="white"
              >
                Click to submit
              </text>
            </svg>
          </div>
          <div className="overlay-color"></div>
        </div>
      </main>
    </div>
  );
}

export default App;
