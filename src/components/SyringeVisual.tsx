import React from 'react';

interface SyringeVisualProps {
  units: number;
  maxUnits?: number;
  unitLabel?: string;
  color?: string;
  id?: string;
}

export default function SyringeVisual({
  units,
  maxUnits = 100,
  unitLabel = 'units',
  color = '#22d3ee',
  id,
}: SyringeVisualProps) {
  const safe = Math.min(Math.max(0, isNaN(units) ? 0 : units), maxUnits);
  const pct = maxUnits > 0 ? safe / maxUnits : 0;
  const bX = 28, bY = 14, bW = 240, bH = 26;
  const fillW = Math.min(pct * bW, bW);

  // Tick interval: 10 for 100-unit scale, proportional otherwise
  const tickCount = 10;
  const tickStep = maxUnits / tickCount;

  return (
    <svg
      viewBox="0 0 330 60"
      className="w-full"
      aria-label={`Syringe draw: ${units} ${unitLabel}`}
      id={id}
    >
      {/* Plunger T-bar */}
      <rect x="2" y="9" width="3" height="36" rx="1.5" fill="#475569" />
      <rect x="0" y="9"  width="8" height="4" rx="2" fill="#64748b" />
      <rect x="0" y="41" width="8" height="4" rx="2" fill="#64748b" />

      {/* Plunger rod — extends to current fill line */}
      <rect
        x="5"
        y="25"
        width={Math.max(0, fillW + bX - 5)}
        height="4"
        rx="2"
        fill={color}
        opacity="0.45"
      />

      {/* Barrel */}
      <rect
        x={bX} y={bY} width={bW} height={bH}
        rx="5"
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="1.5"
      />

      {/* Fill inside barrel */}
      {fillW > 0 && (
        <rect
          x={bX} y={bY}
          width={fillW}
          height={bH}
          rx="5"
          fill={color}
          opacity="0.18"
        />
      )}

      {/* Piston / draw line */}
      {fillW > 3 && fillW < bW - 3 && (
        <rect
          x={bX + fillW - 2}
          y={bY + 3}
          width="4"
          height={bH - 6}
          rx="2"
          fill={color}
          opacity="0.85"
        />
      )}
      {/* Full barrel highlight */}
      {fillW >= bW - 3 && (
        <rect x={bX} y={bY} width={bW} height={bH} rx="5" fill={color} opacity="0.22" />
      )}

      {/* Needle hub */}
      <rect
        x={bX + bW} y={bY + 7}
        width="12" height={bH - 14}
        rx="2"
        fill="#334155"
      />
      {/* Needle */}
      <polygon
        points={`${bX + bW + 12},${bY + bH / 2 - 3.5} ${bX + bW + 12},${bY + bH / 2 + 3.5} ${bX + bW + 46},${bY + bH / 2}`}
        fill="#94a3b8"
      />

      {/* Graduation ticks */}
      {Array.from({ length: tickCount + 1 }, (_, i) => {
        const x = bX + (i / tickCount) * bW;
        const showLabel = i % 2 === 0;
        const val = Math.round(i * tickStep * 10) / 10;
        const label = Number.isInteger(val) ? val.toString() : val.toFixed(1);
        return (
          <g key={i}>
            <line
              x1={x} y1={bY + bH}
              x2={x} y2={bY + bH + (showLabel ? 8 : 5)}
              stroke="#374151"
              strokeWidth={showLabel ? 1.5 : 1}
            />
            {showLabel && (
              <text
                x={x}
                y={bY + bH + 17}
                textAnchor="middle"
                fontSize="7"
                fill="#4b5563"
                fontFamily="monospace"
              >
                {label}
              </text>
            )}
          </g>
        );
      })}

      {/* Unit label */}
      <text
        x={bX + bW / 2}
        y="57"
        textAnchor="middle"
        fontSize="7"
        fill="#374151"
        fontFamily="monospace"
      >
        {unitLabel}
      </text>

      {/* Current value badge above draw line */}
      {safe > 0 && (
        <text
          x={Math.min(bX + fillW - 4, bX + bW - 8)}
          y={bY - 2}
          textAnchor="end"
          fontSize="9"
          fill={color}
          fontFamily="monospace"
          fontWeight="bold"
        >
          {safe}
        </text>
      )}
    </svg>
  );
}
