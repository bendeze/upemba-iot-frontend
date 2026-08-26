'use client';

import { useTranslations } from 'next-intl';
import { useEquipments, useHealthStatuses } from '@/hooks/useTelemetry';
import { AlertTriangle, Wrench } from 'lucide-react';

export function MaintenanceNeeded() {
  const t = useTranslations('Logs');
  const tCommon = useTranslations('Common');
  const { data: equipments } = useEquipments();
  const { data: healthStatuses } = useHealthStatuses();

  const hardwareNeedingMaintenance = equipments?.filter(eq => {
    const status = healthStatuses?.results?.find(h => h.equipment === eq.id)?.status;
    return status === 'WARNING' || status === 'CRITICAL';
  }) || [];

  if (hardwareNeedingMaintenance.length === 0) {
    return (
      <div className="bg-card/50 border border-border/50 rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm shadow-sm transition-all duration-300">
        <div className="bg-muted p-2 rounded-lg text-foreground border border-border/40">
          <Wrench className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">
            {t('allNominalTitle')}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('allNominalDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-muted p-2 rounded-lg text-foreground border border-border/40">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground tracking-wide">
            {t('attentionNeededTitle')}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            {t('attentionNeededDesc', { count: hardwareNeedingMaintenance.length })}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {hardwareNeedingMaintenance.map(eq => {
          const status = healthStatuses?.results?.find(h => h.equipment === eq.id)?.status;
          const isCritical = status === 'CRITICAL';
          return (
            <div 
              key={eq.id} 
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50"
            >
              <div className="flex flex-col">
                <span className={`text-sm font-bold truncate ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>
                  {eq.name}
                </span>
                <span className="text-xs font-mono opacity-70 mt-0.5">{eq.mac_address}</span>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded border ${
                isCritical 
                  ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {status === 'CRITICAL' ? tCommon('critical') : tCommon('warning')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
