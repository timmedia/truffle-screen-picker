import { useEffect, useState } from "react";
import "./Opener.css";

export function Opener(props: {
  topText: string;
  bottomText: string;
  onAnimationComplete?: () => void;
}) {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    if (animationStage === 3) props.onAnimationComplete?.();
  }, [animationStage, props.onAnimationComplete]);

  const w = window.innerWidth;
  const h = window.innerHeight;

  const topFontSize = (3 / props.topText.length) * h;
  const bottomFontSize = (3 / props.bottomText.length) * h;

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
        pointerEvents: "none",
        zIndex: 5555,
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
        viewBox={`0 0 ${w} ${h}`}
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
          x="50%"
          y={`${
            (h - 0.7 * (topFontSize + bottomFontSize)) / 2 +
            0.7 * topFontSize -
            0.02 * h
          }px`}
          style={{
            fontSize: `${topFontSize}px`,
            fill: animationStage >= 1 ? "rgb(255, 147, 192)" : "grey",
            transformOrigin: "50% 100%",
            transform: `scale(2.2)`,
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
          x="50%"
          y={`${
            h - (h - 0.7 * (topFontSize + bottomFontSize)) / 2 + 0.02 * h
          }px`}
          style={{
            fontSize: `${bottomFontSize}px`,
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
