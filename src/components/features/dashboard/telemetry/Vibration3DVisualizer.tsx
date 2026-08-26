'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SensorReading } from '@/lib/api/telemetry';

interface Vibration3DVisualizerProps {
  readings: SensorReading[];
}

export function Vibration3DVisualizer({ readings }: Vibration3DVisualizerProps) {
  const t = useTranslations('Telemetry.visualizer3D');
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Latest reading
  const latest = readings[readings.length - 1] || { vib_x: 0, vib_y: 0, vib_z: 0 };
  const vx = latest.vib_x || 0;
  const vy = latest.vib_y || 0;
  const vz = latest.vib_z || 0;

  const magnitude = Math.sqrt(vx * vx + vy * vy + vz * vz);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = resolvedTheme !== 'light';
    let animationFrameId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const cx = width / 2;
      const cy = height / 2 + 10;
      const scale = Math.min(width, height) * 0.45;

      ctx.clearRect(0, 0, width, height);

      // Fixed, stable isometric camera angles (No random spinning)
      const isoAngleX = (28 * Math.PI) / 180; // Pitch tilt
      const isoAngleY = (45 * Math.PI) / 180; // Yaw isometric angle

      const cosX = Math.cos(isoAngleX), sinX = Math.sin(isoAngleX);
      const cosY = Math.cos(isoAngleY), sinY = Math.sin(isoAngleY);

      // Base isometric projection function
      const project = (x: number, y: number, z: number) => {
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const px = cx + x1 * scale;
        const py = cy - y2 * scale;
        return { px, py, z2 };
      };

      // 1. Draw Neutral Reference Ground Grid
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 1.2;
      const gridSteps = 4;

      for (let i = -gridSteps; i <= gridSteps; i++) {
        const p1 = project((i / gridSteps) * gridSize, -0.6, -gridSize);
        const p2 = project((i / gridSteps) * gridSize, -0.6, gridSize);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();

        const p3 = project(-gridSize, -0.6, (i / gridSteps) * gridSize);
        const p4 = project(gridSize, -0.6, (i / gridSteps) * gridSize);
        ctx.beginPath();
        ctx.moveTo(p3.px, p3.py);
        ctx.lineTo(p4.px, p4.py);
        ctx.stroke();
      }

      // Box dimensions representing the equipment chassis (Width, Height, Depth)
      const bw = 0.7; // Width along X
      const bh = 0.5; // Height along Y
      const bd = 0.5; // Depth along Z

      // Physical deflection & tilt caused by current vibration accelerations
      const dx = vx * 0.45; // X displacement
      const dy = vy * 0.45; // Y displacement
      const dz = vz * 0.45; // Z displacement

      // Angular tilt (Pitch & Roll in radians proportional to vibration)
      const pitchTilt = vx * 0.35;
      const rollTilt = vz * 0.35;
      const cosPitch = Math.cos(pitchTilt), sinPitch = Math.sin(pitchTilt);
      const cosRoll = Math.cos(rollTilt), sinRoll = Math.sin(rollTilt);

      // Helper to compute rotated & displaced box vertex
      const getBoxVertex = (x: number, y: number, z: number, applyDeflection: boolean) => {
        if (!applyDeflection) {
          return project(x, y, z);
        }
        // Rotate around X (Pitch) and Z (Roll)
        let ry = y * cosPitch - z * sinPitch;
        let rz = y * sinPitch + z * cosPitch;
        let rx = x * cosRoll - ry * sinRoll;
        ry = x * sinRoll + ry * cosRoll;

        return project(rx + dx, ry + dy, rz + dz);
      };

      const boxVertices = [
        [-bw / 2, -bh / 2, -bd / 2], // 0: Bottom-Back-Left
        [bw / 2, -bh / 2, -bd / 2],  // 1: Bottom-Back-Right
        [bw / 2, -bh / 2, bd / 2],   // 2: Bottom-Front-Right
        [-bw / 2, -bh / 2, bd / 2],  // 3: Bottom-Front-Left
        [-bw / 2, bh / 2, -bd / 2],  // 4: Top-Back-Left
        [bw / 2, bh / 2, -bd / 2],   // 5: Top-Back-Right
        [bw / 2, bh / 2, bd / 2],    // 6: Top-Front-Right
        [-bw / 2, bh / 2, bd / 2],   // 7: Top-Front-Left
      ];

      // 2. Draw Neutral Rest Outline (Subtle dotted ghost box)
      const neutralPts = boxVertices.map((v) => getBoxVertex(v[0], v[1], v[2], false));
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      const drawBoxEdges = (pts: { px: number; py: number }[]) => {
        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
          [4, 5], [5, 6], [6, 7], [7, 4], // Top
          [0, 4], [1, 5], [2, 6], [3, 7], // Pillars
        ];
        edges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(pts[i].px, pts[i].py);
          ctx.lineTo(pts[j].px, pts[j].py);
          ctx.stroke();
        });
      };

      drawBoxEdges(neutralPts);
      ctx.setLineDash([]);

      // 3. Draw Active Deflected Equipment Chassis
      const activePts = boxVertices.map((v) => getBoxVertex(v[0], v[1], v[2], true));

      // Draw Shaded Faces (Back to Front order for isometric angle)
      const drawFace = (indices: number[], fillStyle: string, strokeStyle: string) => {
        ctx.beginPath();
        ctx.moveTo(activePts[indices[0]].px, activePts[indices[0]].py);
        for (let i = 1; i < indices.length; i++) {
          ctx.lineTo(activePts[indices[i]].px, activePts[indices[i]].py);
        }
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      };

      if (isDark) {
        // Dark Mode
        drawFace([4, 5, 6, 7], 'rgba(39, 39, 42, 0.9)', 'rgba(255, 255, 255, 0.4)');
        drawFace([1, 2, 6, 5], 'rgba(24, 24, 27, 0.95)', 'rgba(255, 255, 255, 0.3)');
        drawFace([2, 3, 7, 6], 'rgba(30, 30, 35, 0.95)', 'rgba(255, 255, 255, 0.35)');
      } else {
        // Light Mode
        drawFace([4, 5, 6, 7], 'rgba(255, 255, 255, 0.95)', 'rgba(0, 0, 0, 0.4)');
        drawFace([1, 2, 6, 5], 'rgba(240, 240, 243, 0.95)', 'rgba(0, 0, 0, 0.35)');
        drawFace([2, 3, 7, 6], 'rgba(228, 228, 233, 0.95)', 'rgba(0, 0, 0, 0.35)');
      }

      // 4. Equipment Center Indicator & Deflection Ray
      const centerNeutral = project(0, 0, 0);
      const centerActive = project(dx, dy, dz);

      // Deflection vector line
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 2]);
      ctx.moveTo(centerNeutral.px, centerNeutral.py);
      ctx.lineTo(centerActive.px, centerActive.py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Active center point
      ctx.beginPath();
      ctx.arc(centerActive.px, centerActive.py, 4, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#ffffff' : '#18181b';
      ctx.fill();

      // Axis labels at corners
      ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
      ctx.font = '10px monospace';
      ctx.fillText('Equip Chassis', activePts[7].px - 35, activePts[7].py - 8);

      ctx.restore();
    };

    render();

    // Re-render on readings change
    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [readings, vx, vy, vz, magnitude, resolvedTheme]);

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
              {t('title')}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t('subtitle')}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border/50 font-semibold">
              Isometric View
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col lg:flex-row items-center gap-6">
        {/* Fixed 3D Equipment Viewport */}
        <div className="relative w-full lg:w-3/5 h-[300px] flex items-center justify-center bg-muted/10 dark:bg-muted/10 rounded-xl border border-border/40 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
          />

          <div className="absolute top-3 left-3 flex items-center gap-3 text-[10px] text-muted-foreground font-mono bg-background/80 px-2.5 py-1.5 rounded-md border border-border/40 backdrop-blur-sm shadow-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-zinc-400 dark:border-white/40" /> {t('neutralRest')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-zinc-200 dark:bg-zinc-700 border border-zinc-500 dark:border-white/50" /> {t('activeChassis')}
            </span>
          </div>
        </div>

        {/* Real-Time Deflection Readings Panel */}
        <div className="w-full lg:w-2/5 flex flex-col gap-3">
          <div className="p-3.5 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                {t('totalKineticMag')}
              </span>
              <span className="text-xl font-bold font-mono text-foreground mt-0.5 block">
                {magnitude.toFixed(3)} <span className="text-xs font-normal text-muted-foreground">g</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                {t('chassisState')}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-background border border-border/50 text-foreground">
                {magnitude > 0.28 ? t('deflected') : t('nominal')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-muted/15 border border-border/40 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('pitchX')}
              </span>
              <span className="text-sm font-bold font-mono text-foreground mt-0.5">
                {vx.toFixed(3)} g
              </span>
            </div>

            <div className="p-3 rounded-lg bg-muted/15 border border-border/40 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('yawY')}
              </span>
              <span className="text-sm font-bold font-mono text-foreground mt-0.5">
                {vy.toFixed(3)} g
              </span>
            </div>

            <div className="p-3 rounded-lg bg-muted/15 border border-border/40 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('rollZ')}
              </span>
              <span className="text-sm font-bold font-mono text-foreground mt-0.5">
                {vz.toFixed(3)} g
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed px-1">
            {t('desc')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
