'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useHealthStatuses, useEquipments } from '@/hooks/useTelemetry';
import { useLogs } from '@/hooks/useLogs';
import { LogReportDialog } from './LogReportDialog';
import { Pagination } from '@/components/shared/Pagination';
import { format } from 'date-fns';
import { FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MaintenanceLog } from '@/lib/api/logs';

interface LogsTableProps {
  equipmentId?: number;
  startDate?: string;
  endDate?: string;
}

export function LogsTable({ equipmentId, startDate, endDate }: LogsTableProps) {
  const t = useTranslations('Logs');
  const tCommon = useTranslations('Common');
  const [page, setPage] = useState(1);

  // Reset page to 1 whenever filters change to prevent "Empty Page" bugs
  useEffect(() => {
    setPage(1);
  }, [equipmentId, startDate, endDate]);

  const { data: healthStatusesResponse, isLoading: isStatusesLoading } = useHealthStatuses(equipmentId, startDate, endDate, page);
  const { data: maintenanceLogsResponse } = useLogs(equipmentId, startDate, endDate, page);
  const { data: equipments } = useEquipments();

  const healthStatuses = healthStatusesResponse?.results;
  const maintenanceLogs = maintenanceLogsResponse?.results;

  const [formOpen, setFormOpen] = useState(false);
  const [selectedEqId, setSelectedEqId] = useState<number | undefined>(undefined);
  const [selectedStatusId, setSelectedStatusId] = useState<number | undefined>(undefined);
  const [viewingLog, setViewingLog] = useState<MaintenanceLog | undefined>(undefined);

  const handleOpenCreateForRecord = (eqId: number, statusId: number) => {
    setSelectedEqId(eqId);
    setSelectedStatusId(statusId);
    setViewingLog(undefined);
    setFormOpen(true);
  };

  const handleViewLog = (log: MaintenanceLog) => {
    setViewingLog(log);
    setSelectedEqId(log.equipment);
    setSelectedStatusId(undefined);
    setFormOpen(true);
  };

  const getEquipmentName = (id: number) => {
    const eq = equipments?.find(e => e.id === id);
    return eq ? eq.name : `Node #${id}`;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'CRITICAL') {
      return (
        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold tracking-wider uppercase border bg-red-500/10 text-red-500 border-red-500/20">
          {tCommon('critical')}
        </span>
      );
    }
    if (status === 'WARNING') {
      return (
        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold tracking-wider uppercase border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          {tCommon('warning')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold tracking-wider uppercase border bg-green-500/10 text-green-500 border-green-500/20">
        {tCommon('normal')}
      </span>
    );
  };

  return (
    <div className="flex flex-col border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
      
      {/* Table Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
        <div>
           <h3 className="text-sm font-bold tracking-widest uppercase text-foreground">
             {t('tableTitle')}
           </h3>
           <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">
             {t('tableSubtitle', { count: healthStatuses?.length || 0 })}
           </p>
        </div>
      </div>

      {/* Data Table Wrapper with Fixed Height */}
      <div className="overflow-y-auto overflow-x-auto max-h-[60vh] relative min-h-[300px]">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-3 sm:px-6 py-4 font-bold tracking-wider">{t('colEvalTime')}</th>
              <th className="px-3 sm:px-6 py-4 font-bold tracking-wider">{t('colNode')}</th>
              <th className="px-3 sm:px-6 py-4 font-bold tracking-wider">{t('colHealth')}</th>
              <th className="hidden md:table-cell px-6 py-4 font-bold tracking-wider">{t('colRiskIndex')}</th>
              <th className="hidden lg:table-cell px-6 py-4 font-bold tracking-wider">{t('colEdgeMetrics')}</th>
              <th className="px-3 sm:px-6 py-4 font-bold tracking-wider text-right">{t('colAction')}</th>
            </tr>
          </thead>
          <tbody>
            {isStatusesLoading ? (
              <tr>
                 <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                 </td>
              </tr>
            ) : healthStatuses?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  {t('noLogs')}
                </td>
              </tr>
            ) : (
              healthStatuses?.map((status) => {
                // Determine if a Maintenance Log has already been mapped to this exact prediction
                const linkedLog = maintenanceLogs?.find(log => log.description.includes(`#sys_ref:${status.id}`));

                return (
                  <tr key={status.id} className="border-b border-border/50 hover:bg-muted/5 transition-colors group">
                    <td className="px-3 sm:px-6 py-4 font-mono text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(status.prediction_timestamp), 'HH:mm')}
                    </td>
                    <td className="px-3 sm:px-6 py-4 font-medium text-foreground whitespace-nowrap text-xs sm:text-sm">
                      {getEquipmentName(status.equipment)}
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      {getStatusBadge(status.status)}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 font-mono text-muted-foreground text-xs">
                      {status.anomaly_score.toFixed(3)}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 font-mono text-muted-foreground text-[10px]">
                      {status.cpu_load_percent !== undefined ? (
                        <div className="flex flex-col gap-0.5">
                          <span>CPU: {status.cpu_load_percent}%</span>
                          <span>RAM: {status.ram_allocation_mb}MB</span>
                          <span>Latency: {status.processing_latency_ms}ms</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">N/A</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right">
                      {linkedLog ? (
                        <button 
                          onClick={() => handleViewLog(linkedLog)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-muted/50 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md border border-border transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t('viewLog')}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleOpenCreateForRecord(status.equipment, status.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-foreground bg-muted/30 hover:bg-muted rounded-md border border-border transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {t('createLog')}
                        </button>
                      )}
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
        totalPages={Math.ceil((healthStatusesResponse?.count || 0) / 10)}
        onPageChange={setPage}
        isLoading={isStatusesLoading}
      />

      {formOpen && (
        <LogReportDialog 
          isOpen={formOpen} 
          onClose={() => setFormOpen(false)} 
          defaultEquipmentId={selectedEqId}
          targetStatusId={selectedStatusId}
          initialData={viewingLog}
        />
      )}
    </div>
  );
}
