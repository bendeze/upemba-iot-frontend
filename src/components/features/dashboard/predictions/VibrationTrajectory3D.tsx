'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SensorReading, ForecastPoint } from '@/lib/api/telemetry';

interface VibrationTrajectory3DProps {
  readings: SensorReading[];
  forecastPoints: ForecastPoint[];
}

export function VibrationTrajectory3D({ readings, forecastPoints }: VibrationTrajectory3DProps) {
  const t = useTranslations('Predictions.trajectory3D');
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Latest actual and projected forecast reading
  const latestActual = readings[readings.length - 1] || { vib_x: 0, vib_y: 0, vib_z: 0 };
  const latestForecast = forecastPoints[forecastPoints.length - 1] || { vib_x: 0, vib_y: 0, vib_z: 0, step: 6 };

  const actVx = latestActual.vib_x || 0;
  const actVy = latestActual.vib_y || 0;
  const actVz = latestActual.vib_z || 0;

  const projVx = latestForecast.vib_x || 0;
  const projVy = latestForecast.vib_y || 0;
  const projVz = latestForecast.vib_z || 0;

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

      // Stable isometric camera
      const isoAngleX = (28 * Math.PI) / 180;
      const isoAngleY = (45 * Math.PI) / 180;

      const cosX = Math.cos(isoAngleX), sinX = Math.sin(isoAngleX);
      const cosY = Math.cos(isoAngleY), sinY = Math.sin(isoAngleY);

      const project = (x: number, y: number, z: number) => {
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;

        const px = cx + x1 * scale;
        const py = cy - y2 * scale;
        return { px, py };
      };

      // 1. Draw Reference Ground Grid
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

      // Equipment Box Dimensions
      const bw = 0.7;
      const bh = 0.5;
      const bd = 0.5;

      const boxVertices = [
        [-bw / 2, -bh / 2, -bd / 2],
        [bw / 2, -bh / 2, -bd / 2],
        [bw / 2, -bh / 2, bd / 2],
        [-bw / 2, -bh / 2, bd / 2],
        [-bw / 2, bh / 2, -bd / 2],
        [bw / 2, bh / 2, -bd / 2],
        [bw / 2, bh / 2, bd / 2],
        [-bw / 2, bh / 2, bd / 2],
      ];

      const getTransformedVertex = (
        x: number, y: number, z: number,
        vxVal: number, vyVal: number, vzVal: number
      ) => {
        const dx = vxVal * 0.45;
        const dy = vyVal * 0.45;
        const dz = vzVal * 0.45;

        const pitch = vxVal * 0.35;
        const roll = vzVal * 0.35;
        const cp = Math.cos(pitch), sp = Math.sin(pitch);
        const cr = Math.cos(roll), sr = Math.sin(roll);

        let ry = y * cp - z * sp;
        let rz = y * sp + z * cp;
        let rx = x * cr - ry * sr;
        ry = x * sr + ry * cr;

        return project(rx + dx, ry + dy, rz + dz);
      };

      const drawFace = (pts: { px: number; py: number }[], indices: number[], fill: string, stroke: string, isDashed = false) => {
        ctx.beginPath();
        if (isDashed) ctx.setLineDash([4, 3]);
        else ctx.setLineDash([]);
        ctx.moveTo(pts[indices[0]].px, pts[indices[0]].py);
        for (let i = 1; i < indices.length; i++) {
          ctx.lineTo(pts[indices[i]].px, pts[indices[i]].py);
        }
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      };

      // 2. Draw Current Baseline Equipment Box
      const currentPts = boxVertices.map((v) =>
        getTransformedVertex(v[0], v[1], v[2], actVx, actVy, actVz)
      );

      if (isDark) {
        drawFace(currentPts, [4, 5, 6, 7], 'rgba(39, 39, 42, 0.85)', 'rgba(255, 255, 255, 0.3)');
        drawFace(currentPts, [1, 2, 6, 5], 'rgba(24, 24, 27, 0.9)', 'rgba(255, 255, 255, 0.25)');
        drawFace(currentPts, [2, 3, 7, 6], 'rgba(30, 30, 35, 0.9)', 'rgba(255, 255, 255, 0.3)');
      } else {
        drawFace(currentPts, [4, 5, 6, 7], 'rgba(255, 255, 255, 0.95)', 'rgba(0, 0, 0, 0.4)');
        drawFace(currentPts, [1, 2, 6, 5], 'rgba(240, 240, 243, 0.95)', 'rgba(0, 0, 0, 0.35)');
        drawFace(currentPts, [2, 3, 7, 6], 'rgba(228, 228, 233, 0.95)', 'rgba(0, 0, 0, 0.35)');
      }

      // 3. Draw Projected Future Equipment Box & Path
      if (forecastPoints.length > 0) {
        const projPts = boxVertices.map((v) =>
          getTransformedVertex(v[0], v[1], v[2], projVx, projVy, projVz)
        );

        // Projected Ghost Faces
        const amberFill = isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)';
        const amberStroke = isDark ? 'rgba(245, 158, 11, 0.7)' : 'rgba(217, 119, 6, 0.85)';

        drawFace(projPts, [4, 5, 6, 7], amberFill, amberStroke, true);
        drawFace(projPts, [1, 2, 6, 5], amberFill, amberStroke, true);
        drawFace(projPts, [2, 3, 7, 6], amberFill, amberStroke, true);

        // Trajectory vector line
        ctx.save();
        ctx.beginPath();
        const curCenter = project(actVx * 0.45, actVy * 0.45, actVz * 0.45);
        ctx.moveTo(curCenter.px, curCenter.py);

        forecastPoints.forEach(fp => {
          const pt = project((fp.vib_x || 0) * 0.45, (fp.vib_y || 0) * 0.45, (fp.vib_z || 0) * 0.45);
          ctx.lineTo(pt.px, pt.py);
        });

        ctx.strokeStyle = isDark ? '#f59e0b' : '#d97706';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.stroke();

        // End projection point
        const projCenter = project(projVx * 0.45, projVy * 0.45, projVz * 0.45);
        ctx.beginPath();
        ctx.arc(projCenter.px, projCenter.py, 4, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#f59e0b' : '#d97706';
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [actVx, actVy, actVz, projVx, projVy, projVz, forecastPoints, resolvedTheme]);

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
              <span>Horizon: +{latestForecast.step || 6} Steps</span>
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
              <span className="w-2.5 h-2.5 rounded-sm bg-zinc-200 dark:bg-zinc-700 border border-zinc-500 dark:border-white/40" /> {t('currentChassis')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/15 border border-dashed border-amber-600 dark:border-amber-500/80" /> {t('futureTraj')}
            </span>
          </div>
        </div>

        {/* Forecast Deflection Panel */}
        <div className="w-full lg:w-2/5 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/40 flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Pitch (X) Current
              </span>
              <span className="text-sm font-bold font-mono text-foreground mt-0.5">
                {actVx.toFixed(3)} g
              </span>
            </div>

            <div className="p-3 rounded-lg bg-muted/20 border border-border/40 flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                Pitch (X) Projected
              </span>
              <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {projVx.toFixed(3)} g
              </span>
            </div>

            <div className="p-3 rounded-lg bg-muted/20 border border-border/40 flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Roll (Z) Current
              </span>
              <span className="text-sm font-bold font-mono text-foreground mt-0.5">
                {actVz.toFixed(3)} g
              </span>
            </div>

            <div className="p-3 rounded-lg bg-muted/20 border border-border/40 flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                Roll (Z) Projected
              </span>
              <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {projVz.toFixed(3)} g
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed px-1">
            {t('desc')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
