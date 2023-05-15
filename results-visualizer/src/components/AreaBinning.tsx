import { useEffect, useState } from "react";
import { pointsInArea } from "../math";
import { Point, PollLayout } from "../schemas";

const STROKE_WIDTH = 0.002;

export function AreaBinning({
  layout,
  points,
}: {
  layout: PollLayout;
  points: Point[];
}) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setOpacity(1);
  }, []);

  const w = window.innerWidth;
  const h = window.innerHeight;
  const pointsPerArea = layout.areas.map((area) => pointsInArea(area, points));

  // disregard points not submitted within a voting area from total percentage
  const nEligibleVotes = pointsPerArea.reduce((tot, curr) => tot + curr);
  const percentages = pointsPerArea.map(
    (n) => Math.round((n / nEligibleVotes) * 1000) / 10
  );
  const totalPercentages = percentages.reduce((t, n) => n + t);
  // avoid having 33.3 + 33.3 + 33.3 = 99.9 =/= 100 in total
  percentages[percentages.length - 1] =
    Math.round((100 - totalPercentages + percentages.at(-1)!) * 10) / 10;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 5511,
        opacity,
        transition: "opacity 250ms ease",
        filter: "drop-shadow(5px 5px 20px rgba(var(--primary-celeste), 1))",
      }}
    >
      <rect width={w} height={h} x={0} y={0} fill="transparent" />
      {layout.areas.map(({ x, y, width, height }, index) => (
        <g key={`group-${index}`}>
          <line
            key={`top-${index}`}
            x1={(x - STROKE_WIDTH / 2) * w}
            y1={y * h}
            x2={(x + width + STROKE_WIDTH / 2) * w}
            y2={y * h}
            stroke={"white"}
            strokeWidth={STROKE_WIDTH * w}
          />
          <line
            key={`bottom-${index}`}
            x1={(x - STROKE_WIDTH / 2) * w}
            y1={(y + height) * h}
            x2={(x + width + STROKE_WIDTH / 2) * w}
            y2={(y + height) * h}
            stroke={"white"}
            strokeWidth={STROKE_WIDTH * w}
            strokeLinejoin="round"
          />
          <line
            key={`left-${index}`}
            x1={x * w}
            y1={y * h}
            x2={x * w}
            y2={(y + height) * h}
            stroke={"white"}
            strokeWidth={STROKE_WIDTH * w}
            strokeLinejoin="round"
          />
          <line
            key={`right-${index}`}
            x1={(x + width) * w}
            y1={(y - STROKE_WIDTH / 2) * h}
            x2={(x + width) * w}
            y2={(y + height) * h}
            stroke={"white"}
            strokeWidth={STROKE_WIDTH * w}
            strokeLinejoin="round"
          />
          <rect
            key={`area-${index}`}
            width={width * w}
            height={height * h}
            x={x * w}
            y={y * h}
            fill={`rgba(var(--primary-celeste), ${
              pointsPerArea[index] / nEligibleVotes / 1.5
            })`}
            style={{
              transition: "fill 150ms ease",
            }}
          />
          <text
            textAnchor="middle"
            alignmentBaseline="central"
            x={(x + width / 2) * w}
            y={(y + height / 2) * h}
            style={{
              fontFamily: "Thunder",
              fontSize: `clamp(50px, ${(width * w) / 4}px, 200px)`,
              transform: "translateY(clamp(20px, 1vh, 100px))",
              fill: "black",
              userSelect: "none",
            }}
          >
            {percentages[index]}%
          </text>
        </g>
      ))}
    </svg>
  );
}
