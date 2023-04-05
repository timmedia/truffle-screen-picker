import "./OverlayAnimation.css";

export function OverlayAnimation() {
  return (
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
        zIndex: 5502,
        pointerEvents: "none",
      }}
    >
      hi
    </div>
  );
}
