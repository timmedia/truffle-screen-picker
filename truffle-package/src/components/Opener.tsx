import { useState } from "react";
import "./OpenerAnimation.css";

export function Opener(props: { topText: string; bottomText: string }) {
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
        transform: animationStage >= 2 ? "skew(10deg, 0deg) scaleX(1.1)" : "",
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
      <div className={`left-door close-left-door-animation`}></div>
      <div
        className={`right-door close-right-door-animation`}
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
          alignmentBaseline="alphabetic"
          x="70"
          y="32"
          style={{
            fontSize: `${(7 / props.topText.length) * 35}px`,
            fill: animationStage >= 1 ? "rgb(255, 147, 192)" : "grey",
            transformOrigin: "50% 100%",
            transform: "scale(2.2)",
            animationName: "textZoom",
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
          alignmentBaseline="hanging"
          x="70"
          y="44"
          style={{
            fontSize: `${(7 / props.bottomText.length) * 35}px`,
            fill: animationStage >= 1 ? "rgb(255, 147, 192)" : "grey",
            transformOrigin: "50% 0%",
            transform: "scale(2.2)",
            animationName: "textZoom",
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
