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
      setTimeout(() => embed.setStyles({ opacity: 1 }), 300);
    } else if (currentlyVoting === false) {
      embed.setStyles({ opacity: 0 });
      setTimeout(() => embed.hide(), 600);
    }
  }, [currentlyVoting]);

  const handleClick = (event: any) => {
    setSubmitted(true);
    setTimeout(() => embed.setStyles({ opacity: 0 }), 2500);
    setTimeout(() => embed.hide(), 3500);
  };

  return (
    <div className="app">
      <main onClick={handleClick}>
        {!submitted && <MouseVisualizer />}
        {submitted && <Opener topText="Thanks for" bottomText="voting!" />}
        {!submitted && <Opener topText="Time to" bottomText="Vote!" />}
      </main>
    </div>
  );
}

export default observer(App);
