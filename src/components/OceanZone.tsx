import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import type { OceanZone as OceanZoneType, PlayedEquation } from '../logic/types';
import EquationStack from './EquationStack';

interface OceanZoneProps {
  zone: OceanZoneType;
  equations: PlayedEquation[];
}

const ZONE_CONFIG: Record<OceanZoneType, { background: string; emoji: string; border: string }> = {
  daylight: {
    background: 'linear-gradient(180deg, #90E0EF 0%, #ADE8F4 40%, #48CAE4 100%)',
    emoji: '☀️',
    border: '1px solid rgba(0,100,150,0.25)',
  },
  twilight: {
    background: 'linear-gradient(180deg, #0077B6 0%, #023e8a 100%)',
    emoji: '🌙',
    border: '1px solid rgba(144,224,239,0.18)',
  },
  midnight: {
    background: 'linear-gradient(180deg, #03045E 0%, #010b1a 100%)',
    emoji: '🌑',
    border: '1px solid rgba(144,224,239,0.1)',
  },
};

// Dimensions of a full-scale EquationStack (at zoom 1)
const BASE_STACK_W = 88;   // px — typical width including stack offset
const BASE_STACK_H = 114;  // px — typical height including stack offset
const ITEM_GAP = 12;   // px — gap between stacks
const H_PAD = 14;   // px — left/right padding in content area
const V_PAD = 10;   // px — top/bottom padding in content area

const OceanZone: React.FC<OceanZoneProps> = ({ zone, equations }) => {
  const cfg = ZONE_CONFIG[zone];

  const zoneRef = useRef<HTMLDivElement>(null); // whole zone — measures height
  const contentRef = useRef<HTMLDivElement>(null); // equation row — measures width

  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const zoneEl = zoneRef.current;
    const contentEl = contentRef.current;
    if (!zoneEl || !contentEl) return;

    const compute = () => {
      const zoneH = zoneEl.getBoundingClientRect().height;
      const contentW = contentEl.getBoundingClientRect().width;
      if (zoneH <= 0 || contentW <= 0) return;

      if (equations.length === 0) { setZoom(1); return; }

      const N = equations.length;
      const availH = zoneH - V_PAD * 2;
      const availW = contentW - H_PAD * 2;

      // Single-row: all stacks side-by-side, no wrapping
      // Scale must satisfy BOTH:
      //   N * BASE_W * s + (N-1) * GAP  <=  availW   (width constraint)
      //   BASE_H * s                    <=  availH   (height constraint)
      const totalBaseW = N * BASE_STACK_W + (N - 1) * ITEM_GAP;
      const widthScale = availW / totalBaseW;
      const heightScale = availH / BASE_STACK_H;

      const newZoom = Math.min(1, widthScale, heightScale);
      setZoom(Math.max(0.12, newZoom)); // hard floor so cards never vanish entirely
    };

    const obs = new ResizeObserver(compute);
    obs.observe(zoneEl);
    compute();
    return () => obs.disconnect();
  }, [equations.length]);

  return (
    <Box
      ref={zoneRef}
      data-zone={zone}
      sx={{
        background: cfg.background,
        flex: 1,              // divide ocean height equally across all 3 zones
        minHeight: 0,         // allow flex child to shrink below content size
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        overflow: 'hidden',   // never grow or scroll
      }}
    >
      {/* Fixed emoji column */}
      <Box
        sx={{
          width: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 28,
          borderRight: cfg.border,
        }}
      >
        {cfg.emoji}
      </Box>

      {/* Single-row equation area — stacks scale to fit, never wrap */}
      <Box
        ref={contentRef}
        sx={{
          flex: 1,
          display: 'flex',
          flexWrap: 'nowrap',       // ← single row, no wrapping
          flexDirection: 'row',
          alignItems: 'center',
          gap: `${ITEM_GAP}px`,
          padding: `${V_PAD}px ${H_PAD}px`,
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {equations.map(eq => (
          // CSS zoom shrinks layout footprint AND rendered size —
          // the equation stacks compress to fit whatever space is available.
          <div key={eq.id} style={{ zoom, flexShrink: 0, lineHeight: 0 }}>
            <EquationStack equation={eq} compactFace={zoom < 1} />
          </div>
        ))}
      </Box>
    </Box>
  );
};

export default OceanZone;
