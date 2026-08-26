'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ForecastPoint } from '@/lib/api/telemetry';
import { format } from 'date-fns';

interface ForecastValuesTableProps {
  forecastPoints: ForecastPoint[];
}

export function ForecastValuesTable({ forecastPoints }: ForecastValuesTableProps) {
  const t = useTranslations('Predictions.table');

  if (forecastPoints.length === 0) {
    return null;
  }

  return (
    <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <div>
          <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-xs">
            {t('subtitle')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b border-border/40">
            <tr>
              <th className="px-4 py-3 font-bold tracking-wider">{t('colHorizonStep')}</th>
              <th className="px-4 py-3 font-bold tracking-wider">{t('colProjectedTime')}</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colRisk')}</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colConfidence')}</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colTemp')} (°C)</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colVolt')} (V)</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colVibX')} (Pitch)</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colVibY')} (Yaw)</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colVibZ')} (Roll)</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">Magnitude (||R||)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 font-mono text-xs">
            {forecastPoints.map((point) => {
              let formattedDate = `+${point.step} step`;
              if (point.timestamp) {
                try {
                  formattedDate = format(new Date(point.timestamp), 'yyyy-MM-dd HH:mm:ss');
                } catch {
                  formattedDate = `+${point.step} step`;
                }
              }

              const prob = point.anomaly_probability ?? (point.status === 'CRITICAL' ? 85.0 : point.status === 'WARNING' ? 55.0 : 12.0);
              const conf = point.confidence ?? (100.0 - prob);

              const mag = Math.sqrt(
                (point.vib_x || 0) ** 2 + 
                (point.vib_y || 0) ** 2 + 
                (point.vib_z || 0) ** 2
              );

              return (
                <tr key={point.step} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground">
                    t + {point.step}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formattedDate}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className={`h-full rounded-full ${
                            prob >= 80 ? 'bg-red-500' :
                            prob >= 50 ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(prob, 100)}%` }}
                        />
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        prob >= 80 ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        prob >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {prob.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {conf.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right text-amber-500 font-semibold">
                    {point.temperature?.toFixed(2)} °C
                  </td>
                  <td className="px-4 py-3 text-right text-blue-500 font-semibold">
                    {point.voltage?.toFixed(3)} V
                  </td>
                  <td className="px-4 py-3 text-right text-yellow-500">
                    {point.vib_x?.toFixed(4)} g
                  </td>
                  <td className="px-4 py-3 text-right text-teal-500">
                    {point.vib_y?.toFixed(4)} g
                  </td>
                  <td className="px-4 py-3 text-right text-blue-500">
                    {point.vib_z?.toFixed(4)} g
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {mag.toFixed(4)} g
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
