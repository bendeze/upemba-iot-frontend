'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { EquipmentSelector } from '@/components/features/dashboard/telemetry/EquipmentSelector';
import { useHealthStatuses, useSensorReadings } from '@/hooks/useTelemetry';
import { PredictionStatusCard } from './PredictionStatusCard';
import { VibrationTrajectory3D } from './VibrationTrajectory3D';
import { ForecastTrajectoryCharts } from './ForecastTrajectoryCharts';
import { ForecastValuesTable } from './ForecastValuesTable';
import { TrendingUp } from 'lucide-react';

export function PredictionDashboard() {
  const t = useTranslations('Predictions');
  const [selectedEquipment, setSelectedEquipment] = useState<string | undefined>();

  const { data: healthData, isLoading: isLoadingHealth } = useHealthStatuses(selectedEquipment);
  const { data: readingsData, isLoading: isLoadingReadings } = useSensorReadings(selectedEquipment);

  const latestHealth = healthData?.results?.[0];
  const readings = readingsData?.results ? [...readingsData.results].reverse() : [];
  const forecastPoints = latestHealth?.forecasted_values || [];

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
      
      {/* Top Controller Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-muted/10">
        <div className="flex items-center gap-4">
          <EquipmentSelector 
            value={selectedEquipment} 
            onChange={setSelectedEquipment} 
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span>{t('modelFitBadge')}</span>
        </div>
      </div>

      {selectedEquipment ? (
        <div className="flex flex-col gap-8">
          {/* 1. Prediction Status & Horizon KPI Cards */}
          <PredictionStatusCard 
            latestHealth={latestHealth} 
            isLoading={isLoadingHealth} 
          />

          {/* 2. 3D Spatial Vibration Trajectory Visualizer */}
          {forecastPoints.length > 0 && (
            <VibrationTrajectory3D 
              readings={readings} 
              forecastPoints={forecastPoints} 
            />
          )}

          {/* 3. 5 Individual Single-Metric Forecast Charts */}
          <ForecastTrajectoryCharts 
            readings={readings} 
            forecastPoints={forecastPoints} 
          />

          {/* 4. Tabular Step-by-Step Forecast Values */}
          {forecastPoints.length > 0 && (
            <ForecastValuesTable 
              forecastPoints={forecastPoints} 
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 mt-8 rounded-2xl border-2 border-dashed border-border/50 bg-muted/5 min-h-[400px]">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
            <TrendingUp className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-foreground uppercase tracking-wider mb-1">
            {t('pageTitle')}
          </h3>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-center max-w-md">
            {t('pageSubtitle')}
          </p>
        </div>
      )}

    </div>
  );
}
