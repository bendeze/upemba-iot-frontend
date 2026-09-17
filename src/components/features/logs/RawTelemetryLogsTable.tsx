'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSensorReadings, useEquipments } from '@/hooks/useTelemetry';
import { Pagination } from '@/components/shared/Pagination';
import { format } from 'date-fns';
import { Thermometer, Zap, Activity, Waves } from 'lucide-react';

interface RawTelemetryLogsTableProps {
  equipmentId?: string;
  startDate?: string;
  endDate?: string;
}

export function RawTelemetryLogsTable({ equipmentId, startDate, endDate }: RawTelemetryLogsTableProps) {
  const t = useTranslations('Logs');
  const tTelemetry = useTranslations('Telemetry.table');
  const [page, setPage] = useState(1);

  // Reset page to 1 whenever filters change to prevent empty page states
  useEffect(() => {
    setPage(1);
  }, [equipmentId, startDate, endDate]);

  const { data: readingsResponse, isLoading } = useSensorReadings(equipmentId, startDate, endDate, page);
  const { data: equipments } = useEquipments();

  const readings = readingsResponse?.results;

  const getEquipmentName = (id: string) => {
    const eq = equipments?.find(e => e.id === id);
    return eq ? `${eq.name} (${eq.mac_address})` : `Node #${id}`;
  };

  return (
    <div className="flex flex-col border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
      
      {/* Table Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-foreground">
            {tTelemetry('title')}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">
            {tTelemetry('totalIngested', { count: readingsResponse?.count || 0 })}
          </p>
        </div>
      </div>

      {/* Data Table Wrapper with Fixed Height */}
      <div className="overflow-y-auto overflow-x-auto max-h-[60vh] relative min-h-[300px]">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-3 sm:px-6 py-4 font-bold tracking-wider">{tTelemetry('colTimestamp')}</th>
              <th className="px-3 sm:px-6 py-4 font-bold tracking-wider">{t('colNode')}</th>
              <th className="px-3 sm:px-6 py-4 font-bold tracking-wider">{tTelemetry('colTemp')}</th>
              <th className="px-3 sm:px-6 py-4 font-bold tracking-wider">{tTelemetry('colVolt')}</th>
              <th className="hidden md:table-cell px-6 py-4 font-bold tracking-wider">Vibration (X / Y / Z)</th>
              <th className="px-3 sm:px-6 py-4 font-bold tracking-wider text-right">{tTelemetry('colMagnitude')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                </td>
              </tr>
            ) : readings?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  {tTelemetry('noData')}
                </td>
              </tr>
            ) : (
              readings?.map((reading) => {
                const magnitude = Math.sqrt(
                  Math.pow(reading.vib_x || 0, 2) + 
                  Math.pow(reading.vib_y || 0, 2) + 
                  Math.pow(reading.vib_z || 0, 2)
                );

                return (
                  <tr key={reading.id} className="border-b border-border/50 hover:bg-muted/5 transition-colors group">
                    <td className="px-3 sm:px-6 py-4 font-mono text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(reading.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-3 sm:px-6 py-4 font-medium text-foreground whitespace-nowrap text-xs sm:text-sm">
                      {getEquipmentName(reading.equipment)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 font-mono text-xs sm:text-sm text-amber-500 font-semibold">
                      {reading.temperature !== null && reading.temperature !== undefined ? `${reading.temperature.toFixed(1)}°C` : '--'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 font-mono text-xs sm:text-sm text-blue-500 font-semibold">
                      {reading.voltage !== null && reading.voltage !== undefined ? `${reading.voltage.toFixed(2)}V` : '--'}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 font-mono text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">X: <strong className="text-foreground">{reading.vib_x?.toFixed(2) ?? 0}g</strong></span>
                        <span className="text-zinc-400">Y: <strong className="text-foreground">{reading.vib_y?.toFixed(2) ?? 0}g</strong></span>
                        <span className="text-zinc-400">Z: <strong className="text-foreground">{reading.vib_z?.toFixed(2) ?? 0}g</strong></span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right font-mono font-bold text-xs sm:text-sm text-emerald-400">
                      {magnitude.toFixed(3)}g
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={page}
        totalPages={Math.ceil((readingsResponse?.count || 0) / 10)}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
