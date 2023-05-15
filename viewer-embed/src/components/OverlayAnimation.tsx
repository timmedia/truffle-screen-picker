import { useEffect, useState } from "react";
import "./OverlayAnimation.css";
import { PollLayout } from "../schemas";

export function OverlayAnimation(props: { layout?: PollLayout | null }) {
  const [opacity, setOpacity] = useState(0);
  setTimeout(() => setOpacity(1), 50);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `linear-gradient(-90deg, rgba(var(--primary-celeste), 0.25) 0%,
                                                  rgba(var(--primary-celeste), 0.25) 20%,
                                                  rgba(var(--primary-celeste), 0.5) 50%,
                                                  rgba(var(--primary-celeste), 0.5) 55%,
                                                  rgba(var(--primary-celeste), 0.25) 80%,
                                                  rgba(var(--primary-celeste), 0.25) 100%)`,
          backgroundSize: "300% 100%",
          animation: "overlay-position 3.5s linear infinite",
          animationPlayState: "running",
          zIndex: 5510,
          pointerEvents: "none",
          opacity: `${opacity}`,
          transition: "opacity 150ms ease-out",
          clipPath: "url(#layoutMask)",
          userSelect: "none",
        }}
      ></div>
      {props?.layout && (
        <svg
          viewBox="0 0 1 1"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 5503,
          }}
        >
          <defs>
            <clipPath id="layoutMask" clipPathUnits="objectBoundingBox">
              {props.layout.areas.map(({ x, y, width, height }, index) => (
                <rect key={index} width={width} height={height} x={x} y={y} />
              ))}
            </clipPath>
          </defs>
        </svg>
      )}
    </>
  );
}
