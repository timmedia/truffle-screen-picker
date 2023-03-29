import { useEffect, useRef, useState } from "react";

import "./OpenerAnimation.css";

export function Opener(props: {
  expanded: boolean;
  topText: string;
  bottomText: string;
}) {
  const [animationStage, setAnimationStage] = useState(0);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: "0",
        left: "0",
        transition: "transform 100ms ease, clip-path 200ms linear",
        transitionDelay: "700ms",
        transformOrigin: "50% 50%",
        transform: animationStage >= 2 ? "skew(-11deg, 0deg) scaleX(1.12)" : "",
        clipPath: `polygon(${animationStage > 2 ? "50%" : "-20%"} 0%, ${
          animationStage > 2 ? "50%" : "0%"
        } 100%, ${animationStage > 2 ? "50%" : "120%"} 100%, ${
          animationStage > 2 ? "50%" : "100%"
        } 0%)`,
      }}
      onTransitionEnd={() =>
        animationStage === 2 ? setAnimationStage(3) : null
      }
    >
      <div
        key={`${props.expanded}-l`}
        className={`left-door ${
          props.expanded ? "close-left-door-animation" : ""
        }`}
      ></div>
      <div
        key={`${props.expanded}-r`}
        className={`right-door ${
          props.expanded ? "close-right-door-animation" : ""
        }`}
        onAnimationEnd={() => setAnimationStage(1)}
      ></div>
      <svg
        viewBox="0 0 140 80"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 6000,
        }}
      >
        <text
          textAnchor="middle"
          alignmentBaseline="central"
          x="70"
          y="23"
          style={{
            fontSize: "35px",
            fill: animationStage >= 1 ? "rgb(255, 147, 192)" : "grey",
            transformOrigin: "50% 100%",
            transform: "scale(2.2)",
            animationName: props.expanded ? "textZoom" : "",
            animationDuration: "300ms",
            animationDelay: "250ms",
            animationTimingFunction: "ease-out",
            animationPlayState: "running",
            animationIterationCount: 1,
            animationFillMode: "forwards",
            transition: "fill 500ms linear",
          }}
          onTransitionEnd={() => setAnimationStage(2)}
        >
          {props.topText}
        </text>
        <text
          textAnchor="middle"
          alignmentBaseline="central"
          x="70"
          y="58"
          style={{
            fontSize: "48px",
            fill: animationStage >= 1 ? "rgb(255, 147, 192)" : "grey",
            transformOrigin: "50% 0%",
            transform: "scale(2.2)",
            animationName: props.expanded ? "textZoom" : "",
            animationDuration: "300ms",
            animationDelay: "250ms",
            animationTimingFunction: "ease-out",
            animationPlayState: "running",
            animationIterationCount: 1,
            animationFillMode: "forwards",
            transition: "fill 500ms linear",
          }}
        >
          {props.bottomText}
        </text>
      </svg>
    </div>
  );
}
