import { useEffect, useRef, useState } from "react";
import {
  embed,
  app,
  getSrcByImageObj,
  TruffleOrgClient,
  user as userClient,
  org as orgClient,
  TruffleUser,
  TruffleOrg,
  getAccessToken,
} from "@trufflehq/sdk";

import { observer } from "@legendapp/state/react";

import "./App.css";
import { fromSpecObservable } from "./from-spec-observable";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { docData } from "rxfire/firestore";
import { distinctUntilChanged, filter, map } from "rxjs/operators";
import { firestore, functions } from "./firebase";
import { Opener } from "./components/Opener";
import { MouseVisualizer } from "./components/MouseVisualizer";
import { connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import { StoredSetup, SubmitVoteData } from "../../models";
import { OverlayAnimation } from "./components/OverlayAnimation";

// const user = fromSpecObservable(userClient.observable);
// const orgUser = fromSpecObservable(userClient.orgUser.observable);
// const org = fromSpecObservable(orgClient.observable);

function App() {
  // undefined <=> we don't know, waiting for firebase
  // string <=> we are voting
  // null <=> we are not voting
  const [pollId, setPollId] = useState<string | undefined | null>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<TruffleUser | undefined>(undefined);
  const [org, setOrg] = useState<TruffleOrg | undefined>(undefined);

  const main = useRef<HTMLDivElement>(null);

  useEffect(() => {
    embed.hide();
    embed.setStyles({
      position: "absolute",
      "box-sizing": "border-box",
      height: "100%",
      width: "100%",
      top: "0px",
      left: "0px",
      // "mix-blend-mode": "normal",
      "z-index": 50000,
      boxShadow: "0px 0px 200px rgb(255, 147, 192)",
      transition: "opacity 300ms linear",
      opacity: 0,
    });
  }, []);

  useEffect(() => {
    if (org === undefined) return;
    const docRef = doc(collection(firestore, "/admin"), org.id);
    const subscription = docData(docRef)
      .pipe(
        map((data) => (data as StoredSetup).currentPollId),
        distinctUntilChanged()
      )
      .subscribe((newPollId) => setPollId(newPollId));
    return () => subscription.unsubscribe();
  }, [org]);

  useEffect(() => {
    const subscription = orgClient.observable.subscribe({
      next: (org) => (org ? setOrg(org) : null),
      error: (error) => console.log(error),
      complete: () => void null,
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = userClient.observable.subscribe({
      next: (user) => (user ? setUser(user) : null),
      error: (error) => console.log(error),
      complete: () => void null,
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    app.org.observable.subscribe({
      next: console.log,
      error: console.log,
    });
    app.user.observable.subscribe({
      next: console.log,
      error: console.log,
    });
  }, []);

  useEffect(() => {
    if (typeof pollId === "string") {
      setSubmitted(false);
      embed.show();
      setTimeout(() => embed.setStyles({ opacity: 1 }), 300);
    } else if (pollId === null) {
      embed.setStyles({ opacity: 0 });
      setTimeout(() => embed.hide(), 600);
    }
  }, [pollId]);

  const handleClick = async (event: any) => {
    setSubmitted(true);
    setTimeout(() => embed.setStyles({ opacity: 0 }), 2500);
    setTimeout(() => embed.hide(), 3500);
    if (user === undefined || org === undefined) return;
    if (typeof pollId !== "string") return;
    const accessToken = await getAccessToken();
    // connectFunctionsEmulator(functions, "localhost", 5000);
    const submitVote = httpsCallable<SubmitVoteData, { success: boolean }>(
      functions,
      "submitVote"
    );
    const result = await submitVote({
      accessToken,
      relX: event.clientX / main.current!.clientWidth,
      relY: event.clientY / main.current!.clientHeight,
      userId: user.id,
      pollId: pollId,
      orgId: org.id,
    });
    console.log(result.data);
  };

  return (
    <div className="app">
      <main onClick={handleClick} ref={main}>
        {!submitted && <MouseVisualizer />}
        {!submitted && <OverlayAnimation />}
        {submitted && <Opener topText="Thanks for" bottomText="voting!" />}
        {!submitted && <Opener topText="Time to" bottomText="Vote!" />}
      </main>
    </div>
  );
}

export default observer(App);
