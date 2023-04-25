import { useCallback, useEffect, useRef, useState, MouseEvent } from "react";
import {
  embed,
  user as userClient,
  org as orgClient,
  TruffleUser,
  TruffleOrg,
  getAccessToken,
} from "@trufflehq/sdk";

import { Opener } from "./components/Opener";
import { MouseVisualizer } from "./components/MouseVisualizer";
import { OverlayAnimation } from "./components/OverlayAnimation";
import { type StoredSetupSchema } from "./schemas";
import { onDocSnapshot, submitVote } from "./firebase";

import "./App.css";

function App() {
  // undefined <=> we don't know, waiting for firebase
  // string <=> we are voting
  // null <=> we are not voting
  // const [pollId, setPollId] = useState<string | undefined | null>(undefined);
  const [setup, setSetup] = useState<StoredSetupSchema | undefined>(undefined);
  const [user, setUser] = useState<TruffleUser | undefined>(undefined);
  const [org, setOrg] = useState<TruffleOrg | undefined>(undefined);

  // 0 <=> wating for a new poll to start
  // 1 <=> opening text showing
  // 2 <=> user can submit entry
  // 3 <=> closing text
  // 4 <=> closing text done, hide embed now
  const [embedState, setEmbedState] = useState<number>(0);

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
      "user-select": "none",
      "pointer-events": "none",
    });
  }, []);

  useEffect(() => {
    console.log(embedState);
    embed.setStyles({
      "pointer-events": embedState === 2 ? "auto" : "none",
    });
    if (embedState === 4) {
      setTimeout(() => embed.setStyles({ opacity: 0 }), 1000);
      setTimeout(() => embed.hide(), 2000);
    }
  }, [embedState]);

  useEffect(() => {
    if (org === undefined) return;
    const unsubscribe = onDocSnapshot("/orgs", org.id, (data) =>
      setSetup(data as StoredSetupSchema)
    );
    return () => unsubscribe();
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
    if (typeof setup?.pollId === "string") {
      setEmbedState(1);
      embed.show();
      setTimeout(() => embed.setStyles({ opacity: 1 }), 300);
    } else if (setup?.pollId === null) {
      setEmbedState(0);
      embed.setStyles({ opacity: 0 });
      setTimeout(() => embed.hide(), 600);
    }
  }, [setup]);

  const handleClick = useCallback(
    async (event: MouseEvent<HTMLElement | SVGElement>) => {
      setEmbedState(3);
      if (user === undefined || org === undefined) return;
      if (typeof setup?.pollId !== "string") return;
      const x = event.clientX / main.current!.clientWidth;
      const y = event.clientY / main.current!.clientHeight;
      console.log(`Submitting (${x}, ${y})`);
      const result = await submitVote({
        accessToken: await getAccessToken(),
        pollId: setup.pollId,
        x,
        y,
      });
      console.log(result);
    },
    [setup]
  );

  return (
    <div className="app">
      <main ref={main}>
        {embedState === 2 && (
          <MouseVisualizer
            layout={setup?.layout ?? null}
            onClick={handleClick}
          />
        )}
        {embedState === 2 && (
          <OverlayAnimation layout={setup?.layout ?? null} />
        )}
        {(embedState === 3 || embedState == 4) && (
          <Opener
            topText="Thanks for"
            bottomText="voting!"
            onAnimationComplete={() => {
              setEmbedState((state) => (state === 3 ? 4 : state));
            }}
          />
        )}
        {(embedState === 1 || embedState === 2) && (
          <Opener
            topText="Time to"
            bottomText="Vote!"
            onAnimationComplete={() =>
              setEmbedState((state) => (state === 1 ? 2 : state))
            }
          />
        )}
      </main>
    </div>
  );
}

export default App;
