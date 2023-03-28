import { useEffect, useRef, useState } from "react";
import {
  embed,
  app,
  getSrcByImageObj,
  TruffleOrgClient,
  user as userClient,
  org as orgClient,
} from "@trufflehq/sdk";

import { observer } from "@legendapp/state/react";

import "./App.css";
import { fromSpecObservable } from "./from-spec-observable";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { firestore } from "./firebase";

const user = fromSpecObservable(userClient.observable);
const orgUser = fromSpecObservable(userClient.orgUser.observable);
const org = fromSpecObservable(orgClient.observable);

interface StoredSetup {
  currentlyVoting: boolean;
  currentVideoId: string;
}

function App() {
  const ref = collection(firestore, "/admin");

  onSnapshot(doc(ref, "Ogc8Qi42SO1mgDO2PdJv"), (doc) => {
    const { currentlyVoting, currentVideoId } = doc.data() as StoredSetup;
    currentlyVoting ? embed.show() : embed.hide();
    setVideoId(currentVideoId);
  });

  const [videoId, setVideoId] = useState("");

  const [orgId, setOrgId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const subscription = userClient.observable.subscribe({
      next: (org) => {
        // setOrgId(org?.id);
        console.log("new userClient:", org);
      },
      error: (error) => console.log(error),
      complete: () => {},
    });
    return () => subscription.unsubscribe();
  });

  useEffect(() => {
    const subscription = orgClient.observable.subscribe({
      next: (org) => {
        // setOrgId(org?.id);
        console.log("new orgClient:", org);
      },
      error: (error) => console.log(error),
      complete: () => {},
    });
    return () => subscription.unsubscribe();
  });

  const [waiting, setWaiting] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [animationPaused, setAnimationPaused] = useState(false);

  const handleClick = (event: any) => {
    // console.log(event.clientX, event.clientY);
    setSubmitted(true);
    // console.log(document.location);
    console.log(document.referrer);
    setTimeout(() => embed.hide(), 5000);
  };

  return (
    <div className="app">
      <main onClick={handleClick}>
        <iframe
          src={`https://yewtu.be/embed/${videoId}?volume=0&controls=0`}
          className="video-frame"
        ></iframe>
        <div className="overlay">
          <div className={`overlay-text`}>
            <svg viewBox="0 0 140 80" xmlns="http://www.w3.org/2000/svg">
              <text
                textAnchor="start"
                alignmentBaseline="central"
                x="4"
                y="35"
                color="white"
                style={{
                  transform: !submitted
                    ? "translateX(-200px)"
                    : "translateX(0)",
                }}
              >
                Thank you
              </text>
              <text
                textAnchor="end"
                alignmentBaseline="central"
                x="138"
                y="70"
                color="white"
                style={{
                  transform: !submitted ? "translateX(200px)" : "translateX(0)",
                }}
              >
                for voting!
              </text>
            </svg>
          </div>
          <div
            className={`overlay-color  breathing`}
            style={{
              animationPlayState: animationPaused ? "paused" : "running",
            }}
            onAnimationIteration={() => {
              if (submitted) setWaiting(false);
              if (submitted && !waiting) setAnimationPaused(true);
            }}
          ></div>
          <div
            className={`overlay-color-success  ${submitted ? "" : ""}`}
            style={{
              transform: submitted
                ? "scaleX(1.5) scaleY(2) translate(0, 0)"
                : "scaleX(0.15) scaleY(0.25) translate(-360vw, 140vh)",
            }}
          ></div>
        </div>
      </main>
    </div>
  );
}

export default observer(App);
