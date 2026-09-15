'use client';

import { useTranslations } from 'next-intl';
import { useHealthStatuses } from '@/hooks/useTelemetry';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, ShieldAlert, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface StatusBadgeProps {
  equipmentId: string | undefined;
}

export function StatusBadge({ equipmentId }: StatusBadgeProps) {
  const t = useTranslations('Telemetry');
  const tCommon = useTranslations('Common');
  const { data: statuses, isLoading } = useHealthStatuses(equipmentId);

  if (!equipmentId) return null;
  if (isLoading) {
    return <div className="h-20 w-full md:w-[360px] bg-muted/20 animate-pulse rounded-xl border border-border/40" />;
  }

  const equipmentStatus = statuses?.results?.[0];

  if (!equipmentStatus) {
    return (
      <div className="flex p-4 border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm items-center justify-center text-muted-foreground text-sm font-medium">
        {t('noActiveStatus')}
      </div>
    );
  }

  const isCritical = equipmentStatus.status === 'CRITICAL';
  const isWarning = equipmentStatus.status === 'WARNING';
  const isNormal = equipmentStatus.status === 'NORMAL';

  const predStatus = equipmentStatus.predicted_status;
  const horizonText = equipmentStatus.prediction_horizon_minutes
    ? `~${equipmentStatus.prediction_horizon_minutes} min`
    : `${equipmentStatus.prediction_horizon_steps || 6} steps`;

  const getStatusLabel = (status: string) => {
    if (status === 'CRITICAL') return tCommon('critical');
    if (status === 'WARNING') return tCommon('warning');
    return tCommon('normal');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 1. REAL-TIME ANOMALY HEALTH BADGE */}
      <div className="flex items-center gap-3 px-4 py-3 border border-border/50 rounded-xl shadow-sm bg-card/50 backdrop-blur-sm">
        <div className="shrink-0">
          {isCritical && <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />}
          {isWarning && <AlertTriangle className="w-6 h-6 text-amber-500" />}
          {isNormal && <CheckCircle className="w-6 h-6 text-emerald-500" />}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            {t('currentAnomalyHealth')}
          </span>
          <span className={cn(
            "text-sm font-black tracking-wider uppercase",
            isCritical ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-400"
          )}>
            {getStatusLabel(equipmentStatus.status)}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            {t('detectorScore')}: {(equipmentStatus.anomaly_score * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 2. NEAR-FUTURE PREDICTIVE STATUS INDICATOR */}
      {predStatus && (
        <Link 
          href="/dashboard/predictions"
          className="group flex items-center gap-3 px-4 py-3 border border-border/50 hover:border-primary/40 rounded-xl shadow-sm bg-card/50 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer"
        >
          <div className="shrink-0 p-2 rounded-lg bg-muted/40 text-foreground border border-border/40 group-hover:border-primary/50 transition-colors">
            <TrendingUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                {t('forecast')} ({horizonText})
              </span>
              <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className={cn(
              "text-xs font-bold uppercase tracking-wider",
              predStatus === 'CRITICAL' ? "text-red-400" :
              predStatus === 'WARNING' ? "text-amber-400" : "text-emerald-400"
            )}>
              {t('predicted')} {getStatusLabel(predStatus)}
            </span>
            <span className="text-[10px] text-muted-foreground/80 font-mono">
              {t('viewForecastHub')}
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}

