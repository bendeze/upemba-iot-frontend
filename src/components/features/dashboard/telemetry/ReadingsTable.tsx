'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useSensorReadings } from '@/hooks/useTelemetry';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface ReadingsTableProps {
  equipmentId: string | undefined;
  limit?: number;
}

export function ReadingsTable({ equipmentId, limit = 6 }: ReadingsTableProps) {
  const t = useTranslations('Telemetry.table');
  const { data, isLoading, isError } = useSensorReadings(equipmentId);

  if (!equipmentId) return null;

  if (isLoading) {
    return <div className="h-64 w-full bg-muted/20 animate-pulse rounded-xl border border-border/40" />;
  }

  if (isError || !data) {
    return <div className="p-4 text-red-500 text-sm">Failed to load sensor readings.</div>;
  }

  // Display only the most recent 'limit' records (default: 6, matching prediction horizon)
  const recentReadings = data.results.slice(0, limit);

  return (
    <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
              {t('title')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('subtitle', { count: recentReadings.length })}
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono">
              {t('totalIngested', { count: data.count })}
            </span>
            <Link 
              href="/dashboard/logs"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-md border border-primary/20"
            >
              <span>{t('fullLogsBtn')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b border-border/40">
            <tr>
              <th className="px-4 py-3 font-bold tracking-wider">{t('colIndex')}</th>
              <th className="px-4 py-3 font-bold tracking-wider">{t('colTimestamp')}</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colTemp')}</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colVolt')}</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colVibX')}</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colVibY')}</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colVibZ')}</th>
              <th className="px-4 py-3 font-bold tracking-wider text-right">{t('colMagnitude')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 font-mono text-xs">
            {recentReadings.map((reading, index) => {
              const mag = Math.sqrt(
                (reading.vib_x || 0) ** 2 + 
                (reading.vib_y || 0) ** 2 + 
                (reading.vib_z || 0) ** 2
              );

              return (
                <tr key={reading.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-bold text-muted-foreground">
                    #{index + 1}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {format(new Date(reading.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-4 py-3 text-right text-amber-500 font-semibold">
                    {reading.temperature.toFixed(2)} °C
                  </td>
                  <td className="px-4 py-3 text-right text-blue-500 font-semibold">
                    {reading.voltage.toFixed(3)} V
                  </td>
                  <td className="px-4 py-3 text-right text-yellow-500">
                    {reading.vib_x.toFixed(4)} g
                  </td>
                  <td className="px-4 py-3 text-right text-teal-500">
                    {reading.vib_y.toFixed(4)} g
                  </td>
                  <td className="px-4 py-3 text-right text-blue-500">
                    {reading.vib_z.toFixed(4)} g
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {mag.toFixed(4)} g
                  </td>
                </tr>
              );
            })}
            {recentReadings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  {t('noData')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
