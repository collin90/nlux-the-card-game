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

// Dimensions of a full-scale EquationStack for a typical 2-LHS equation
// (worst-case is more LHS cards, but this is used as the sizing basis)
const BASE_STACK_W = 88;  // px at zoom=1
const BASE_STACK_H = 114; // px at zoom=1
const ITEM_GAP = 12;      // px between stacks
const ZONE_PADDING = 10;  // px top/bottom padding inside the equations area

const OceanZone: React.FC<OceanZoneProps> = ({ zone, equations }) => {
  const cfg = ZONE_CONFIG[zone];

  const zoneRef = useRef<HTMLDivElement>(null);    // measures zone height
  const contentRef = useRef<HTMLDivElement>(null); // measures available width

  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const zoneEl = zoneRef.current;
    const contentEl = contentRef.current;
    if (!zoneEl || !contentEl) return;

    // Given a zoom level z, does everything fit within the zone's current height?
    const fits = (z: number, availH: number, availW: number): boolean => {
      const sw = BASE_STACK_W * z;
      const sh = BASE_STACK_H * z;
      const perRow = Math.max(1, Math.floor((availW + ITEM_GAP) / (sw + ITEM_GAP)));
      const rows = Math.ceil(equations.length / perRow);
      const usedH = rows * sh + (rows - 1) * ITEM_GAP + ZONE_PADDING * 2;
      return usedH <= availH;
    };

    const compute = () => {
      if (equations.length === 0) { setZoom(1); return; }

      const availH = zoneEl.getBoundingClientRect().height;
      const availW = contentEl.getBoundingClientRect().width;
      if (availH <= 0 || availW <= 0) return;

      // Fast path: fits at zoom=1?
      if (fits(1, availH, availW)) { setZoom(1); return; }

      // Binary search for largest zoom in [0.2, 1] where everything fits
      let lo = 0.2, hi = 1.0;
      for (let i = 0; i < 22; i++) {
        const mid = (lo + hi) / 2;
        if (fits(mid, availH, availW)) lo = mid;
        else hi = mid;
      }
      setZoom(lo);
    };

    // Re-compute whenever zone is resized (window resize, panel resize, etc.)
    const obs = new ResizeObserver(compute);
    obs.observe(zoneEl);
    compute();
    return () => obs.disconnect();
  }, [equations.length]); // re-run whenever equation count changes

  return (
    <Box
      ref={zoneRef}
      data-zone={zone}
      sx={{
        background: cfg.background,
        flex: 1,         // split available ocean space equally on desktop
        minHeight: 120,  // never collapse below this
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        overflow: 'hidden',
      }}
    >
      {/* Zone emoji — fixed column on the left */}
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

      {/* Equations — auto-scaling to stay within zone height */}
      <Box
        ref={contentRef}
        sx={{
          flex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: `${ITEM_GAP}px`,
          padding: `${ZONE_PADDING}px 14px`,
          alignContent: 'flex-start',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {equations.map(eq => (
          // CSS zoom shrinks both rendered size AND layout footprint —
          // flexbox sees the zoomed size, so wrap thresholds are correct.
          <div key={eq.id} style={{ zoom, flexShrink: 0, lineHeight: 0 }}>
            <EquationStack equation={eq} />
          </div>
        ))}
      </Box>
    </Box>
  );
};

export default OceanZone;
