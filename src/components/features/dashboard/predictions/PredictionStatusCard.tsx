'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { HealthStatus } from '@/lib/api/telemetry';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Activity, 
  Calendar 
} from 'lucide-react';
import { format } from 'date-fns';

interface PredictionStatusCardProps {
  latestHealth: HealthStatus | undefined;
  isLoading: boolean;
}

export function PredictionStatusCard({ latestHealth, isLoading }: PredictionStatusCardProps) {
  const t = useTranslations('Predictions');
  const tCommon = useTranslations('Common');

  if (isLoading) {
    return <div className="h-36 w-full bg-muted/20 animate-pulse rounded-2xl border border-border/40" />;
  }

  if (!latestHealth || !latestHealth.predicted_status) {
    return (
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="w-6 h-6 text-muted-foreground/60" />
            <div>
              <p className="text-sm font-bold text-foreground uppercase tracking-wide">
                {t('insufficientDataTitle')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('insufficientDataDesc')}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-muted border border-border/40 text-muted-foreground">
            {t('awaitingTelemetry')}
          </span>
        </div>
      </Card>
    );
  }

  const predStatus = latestHealth.predicted_status;
  const isCrit = predStatus === 'CRITICAL';
  const isWarn = predStatus === 'WARNING';

  const getStatusLabel = (status: string) => {
    if (status === 'CRITICAL') return tCommon('critical');
    if (status === 'WARNING') return tCommon('warning');
    return tCommon('normal');
  };

  const horizonMins = latestHealth.prediction_horizon_minutes;
  const horizonSteps = latestHealth.prediction_horizon_steps || 6;
  const worstScore = latestHealth.predictive_anomaly_score ?? 0;
  const genTime = latestHealth.prediction_generated_at 
    ? format(new Date(latestHealth.prediction_generated_at), 'HH:mm:ss')
    : '--:--:--';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Near-Future Predicted State */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {t('predictedRegime')}
          </span>
          <div className="p-2 rounded-xl bg-muted/40 text-foreground border border-border/40">
            {isCrit && <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />}
            {isWarn && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {!isCrit && !isWarn && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
          </div>
        </div>
        <div className="mt-3">
          <span className={cn(
            "text-2xl font-black uppercase tracking-wider",
            isCrit ? "text-red-400" : isWarn ? "text-amber-400" : "text-emerald-400"
          )}>
            {getStatusLabel(predStatus)}
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isCrit ? t('critDrift') :
             isWarn ? t('warnDrift') :
             t('normDrift')}
          </p>
        </div>
      </Card>

      {/* 2. Forecast Horizon */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {t('forecastHorizon')}
          </span>
          <div className="p-2 rounded-xl bg-muted/40 text-foreground border border-border/40">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-foreground font-mono">
            {horizonMins ? `~${horizonMins.toFixed(1)}` : horizonSteps}{' '}
            <span className="text-sm font-normal text-muted-foreground">
              {horizonMins ? t('minutes') : t('steps')}
            </span>
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('forwardStepsCalc', { count: horizonSteps })}
          </p>
        </div>
      </Card>

      {/* 3. Worst Expected Anomaly Score */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {t('worstScore')}
          </span>
          <div className="p-2 rounded-xl bg-muted/40 text-foreground border border-border/40">
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-foreground font-mono">
            {(worstScore * 100).toFixed(1)}%
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('lowestScoreDesc')}
          </p>
        </div>
      </Card>

      {/* 4. Generation Timestamp */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {t('forecastTimestamp')}
          </span>
          <div className="p-2 rounded-xl bg-muted/40 text-foreground border border-border/40">
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-foreground font-mono">
            {genTime}
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('modelFitDesc')}
          </p>
        </div>
      </Card>
    </div>
  );
}
