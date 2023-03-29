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
import { docData } from "rxfire/firestore";
import { distinctUntilChanged, filter, map } from "rxjs/operators";
import { firestore } from "./firebase";
import { Opener } from "./components/Opener";
import { MouseVisualizer } from "./components/MouseVisualizer";

// const user = fromSpecObservable(userClient.observable);
// const orgUser = fromSpecObservable(userClient.orgUser.observable);
// const org = fromSpecObservable(orgClient.observable);

interface StoredSetup {
  currentlyVoting: boolean;
}

function App() {
  const [currentlyVoting, setCurrentlyVoting] = useState<boolean | undefined>(
    undefined
  );
  const [showOpener, setShowOpener] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    embed.hide();
    embed.setStyles({
      position: "absolute",
      "box-sizing": "border-box",
      height: "100%",
      width: "100%",
      top: "0px",
      left: "0px",
      "mix-blend-mode": "hard-light",
      "z-index": 50000,
      boxShadow: "0px 0px 200px rgb(255, 147, 192)",
      transition: "opacity 300ms linear",
      opacity: 0,
    });
  }, []);

  useEffect(() => {
    const docRef = doc(collection(firestore, "/admin"), "Ogc8Qi42SO1mgDO2PdJv");
    const subscription = docData(docRef)
      .pipe(
        map((data) => (data as StoredSetup).currentlyVoting),
        distinctUntilChanged()
      )
      .subscribe((newCurrentlyVoting) =>
        setCurrentlyVoting(newCurrentlyVoting)
      );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentlyVoting === true) {
      setSubmitted(false);
      embed.show();
      const t1 = setTimeout(() => embed.setStyles({ opacity: 1 }), 300);
      const t2 = setTimeout(() => setShowOpener(currentlyVoting), 400);
      // return () => {
      //   console.log("timeout cleared");
      //   clearTimeout(t1);
      //   clearTimeout(t2);
      // };
    } else if (currentlyVoting === false) {
      setShowOpener(currentlyVoting);
      embed.setStyles({ opacity: 0 });
      setTimeout(() => embed.hide(), 600);
    }
  }, [currentlyVoting]);

  // onSnapshot(
  //   doc(collection(firestore, "/admin"), "Ogc8Qi42SO1mgDO2PdJv"),
  //   (doc) => {
  //     const { currentlyVoting: newCurrentlyVoting } = doc.data() as StoredSetup;
  //     if (currentlyVoting === newCurrentlyVoting) return;
  //     setCurrentlyVoting(newCurrentlyVoting);
  //     if (newCurrentlyVoting) {
  //       embed.show();
  //       setTimeout(() => embed.setStyles({ opacity: 1 }), 300);
  //       // setTimeout(() => setCurrentlyVoting(true), 1500);
  //     } else {
  //       embed.setStyles({ opacity: 0 });
  //       setTimeout(() => {
  //         embed.hide();
  //         // setCurrentlyVoting(false);
  //       }, 1500);
  //     }
  //   }
  // );

  // const [orgId, setOrgId] = useState<string | undefined>(undefined);

  // useEffect(() => {
  //   const subscription = userClient.observable.subscribe({
  //     next: (org) => {
  //       // setOrgId(org?.id);
  //       console.log("new userClient:", org);
  //     },
  //     error: (error) => console.log(error),
  //     complete: () => {},
  //   });
  //   return () => subscription.unsubscribe();
  // });

  // useEffect(() => {
  //   const subscription = orgClient.observable.subscribe({
  //     next: (org) => {
  //       // setOrgId(org?.id);
  //       console.log("new orgClient:", org);
  //     },
  //     error: (error) => console.log(error),
  //     complete: () => {},
  //   });
  //   return () => subscription.unsubscribe();
  // });

  // const [waiting, setWaiting] = useState(true);
  // const [submitted, setSubmitted] = useState(false);
  // const [animationPaused, setAnimationPaused] = useState(false);

  const handleClick = (event: any) => {
    console.log("clicked");
    setSubmitted(true);
    // console.log(event.clientX, event.clientY);
    // setSubmitted(true);
    // console.log(document.location);
    // console.log(document.referrer);
    setTimeout(() => embed.setStyles({ opacity: 0 }), 2500);
    setTimeout(() => embed.hide(), 3500);
  };

  return (
    <div className="app">
      <main onClick={handleClick}>
        {showOpener && <MouseVisualizer />}
        {submitted && (
          <Opener
            key={`${submitted}`}
            expanded={true}
            topText="Thanks for"
            bottomText="voting!"
          />
        )}
        {!submitted && (
          <Opener
            key={`${submitted}`}
            expanded={true}
            topText="Time to"
            bottomText="Vote!"
          />
        )}

        {/* <div className="overlay">
          <div className={`overlay-text`}>
            <svg viewBox="0 0 140 80" xmlns="http://www.w3.org/2000/svg"> */}
        {/* <text
                textAnchor="middle"
                alignmentBaseline="central"
                x="70"
                y="23"
                style={{
                  transform: submitted ? "translateX(200px)" : "translateX(0)",
                  fontSize: "25px",
                  fill: "black",
                }}
              >
                Click anywhere
              </text>
              <text
                textAnchor="middle"
                alignmentBaseline="central"
                x="70"
                y="56"
                style={{
                  transform: submitted ? "translateX(-200px)" : "translateX(0)",
                  fontSize: "48px",
                  fill: "rgb(255, 147, 192)",
                }}
              >
                to vote!
              </text> */}
        {/* <text
                textAnchor="start"
                alignmentBaseline="central"
                x="4"
                y="25"
                style={{
                  transform: !submitted
                    ? "translateX(-200px)"
                    : "translateX(0)",
                  fontSize: "35px",
                }}
              >
                Thank you
              </text>
              <text
                textAnchor="end"
                alignmentBaseline="central"
                x="138"
                y="62"
                style={{
                  transform: !submitted ? "translateX(200px)" : "translateX(0)",
                  fontSize: "35px",
                }}
              >
                for voting!
              </text>
            </svg> */}
        {/* </div>
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
                : "scaleX(0.15) scaleY(0.25) translate(-400vw, 140vh)",
            }}
          ></div>
        </div> */}
      </main>
    </div>
  );
}

export default observer(App);
