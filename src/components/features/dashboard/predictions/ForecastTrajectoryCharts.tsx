'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { Thermometer, Zap, Activity, Waves, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { SensorReading, ForecastPoint } from '@/lib/api/telemetry';

interface ForecastTrajectoryChartsProps {
  readings: SensorReading[];
  forecastPoints: ForecastPoint[];
}

// Custom Rich Tooltip showing Sensor value + Anomaly Probability %
function CustomForecastTooltip({ active, payload, label, unit, t }: any) {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  const isForecast = dataPoint?.isForecast;
  const prob = dataPoint?.anomaly_probability;
  const conf = dataPoint?.confidence;
  const status = dataPoint?.status;

  return (
    <div className="p-3 bg-popover/95 text-popover-foreground border border-border/80 rounded-xl shadow-xl backdrop-blur-md text-xs font-sans min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-border/60">
        <span className="font-mono text-muted-foreground font-semibold">{label}</span>
        {isForecast ? (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
            {t('projected')} {dataPoint?.step ? `+${dataPoint.step}` : ''}
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground border border-border/50">
            {t('actualBaseline')}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {payload.map((item: any, idx: number) => {
          if (item.value === null || item.value === undefined) return null;
          return (
            <div key={idx} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
              </span>
              <span className="font-mono font-bold text-foreground">
                {typeof item.value === 'number' ? item.value.toFixed(2) : item.value} {unit || ''}
              </span>
            </div>
          );
        })}

        {isForecast && prob !== undefined && (
          <div className="mt-2 pt-2 border-t border-border/60 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('probTitle')}:</span>
              <span className={`font-mono font-bold ${
                prob >= 80 ? 'text-red-500 dark:text-red-400' :
                prob >= 50 ? 'text-amber-500 dark:text-amber-400' :
                'text-emerald-500 dark:text-emerald-400'
              }`}>
                {prob.toFixed(1)}%
              </span>
            </div>
            {conf !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-mono font-semibold text-foreground">
                  {conf.toFixed(1)}%
                </span>
              </div>
            )}
            {status && (
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-muted-foreground">Regime:</span>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  status === 'CRITICAL' ? 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20' :
                  status === 'WARNING' ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20'
                }`}>
                  {status}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ForecastTrajectoryCharts({ readings, forecastPoints }: ForecastTrajectoryChartsProps) {
  const t = useTranslations('Predictions.charts');

  if (readings.length === 0 && forecastPoints.length === 0) {
    return (
      <div className="p-8 border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm text-center text-muted-foreground">
        No forecast data available for this equipment node.
      </div>
    );
  }

  // Format historical actual readings
  const actualData = readings.map((r) => ({
    timestamp: r.timestamp,
    formattedTime: format(new Date(r.timestamp), 'HH:mm:ss'),
    temperature: r.temperature,
    voltage: r.voltage,
    vib_x: r.vib_x,
    vib_y: r.vib_y,
    vib_z: r.vib_z,
    forecast_temperature: null as number | null,
    forecast_voltage: null as number | null,
    forecast_vib_x: null as number | null,
    forecast_vib_y: null as number | null,
    forecast_vib_z: null as number | null,
    anomaly_probability: null as number | null,
    confidence: null as number | null,
    isForecast: false,
  }));

  // Seamlessly bridge the last actual point to the start of forecast line
  const lastActual = actualData[actualData.length - 1];
  if (lastActual && forecastPoints.length > 0) {
    lastActual.forecast_temperature = lastActual.temperature;
    lastActual.forecast_voltage = lastActual.voltage;
    lastActual.forecast_vib_x = lastActual.vib_x;
    lastActual.forecast_vib_y = lastActual.vib_y;
    lastActual.forecast_vib_z = lastActual.vib_z;
  }

  // Format forecast points
  const forecastData = forecastPoints.map((f) => {
    let formattedTime = `+${f.step} step`;
    if (f.timestamp) {
      try {
        formattedTime = format(new Date(f.timestamp), 'HH:mm:ss');
      } catch {
        formattedTime = `+${f.step} step`;
      }
    }
    return {
      step: f.step,
      timestamp: f.timestamp,
      formattedTime,
      temperature: null as number | null,
      voltage: null as number | null,
      vib_x: null as number | null,
      vib_y: null as number | null,
      vib_z: null as number | null,
      forecast_temperature: f.temperature,
      forecast_voltage: f.voltage,
      forecast_vib_x: f.vib_x,
      forecast_vib_y: f.vib_y,
      forecast_vib_z: f.vib_z,
      anomaly_probability: f.anomaly_probability ?? (f.status === 'CRITICAL' ? 85.0 : f.status === 'WARNING' ? 55.0 : 12.0),
      confidence: f.confidence ?? (100.0 - (f.anomaly_probability ?? 12.0)),
      status: f.status || 'NORMAL',
      isForecast: true,
    };
  });

  const chartData = [...actualData, ...forecastData];
  const latestForecast = forecastPoints[forecastPoints.length - 1];
  const maxProbability = forecastPoints.length > 0 
    ? Math.max(...forecastPoints.map(p => p.anomaly_probability ?? 0))
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      
      {/* 1. TEMPERATURE FORECAST CHART (Amber/Ember) */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex flex-col justify-between overflow-hidden">
        <CardHeader className="pb-2 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
                <Thermometer className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
                  {t('tempTitle')}
                </CardTitle>
                <CardDescription className="text-xs">{t('tempDesc')}</CardDescription>
              </div>
            </div>
            {latestForecast && (
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase font-mono block">{t('projected')}</span>
                <span className="text-base font-black text-amber-500 font-mono">
                  {latestForecast.temperature?.toFixed(1)}°C
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-2 sm:px-4">
          <div className="w-full h-[230px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={230}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                <XAxis dataKey="formattedTime" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `${v}°C`} width={45} tickLine={false} />
                <Tooltip content={<CustomForecastTooltip unit="°C" t={t} />} />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="temperature" name={t('actualBaseline')} stroke="#71717a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="forecast_temperature" name={t('projectedTrajectory')} stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3, fill: '#f59e0b' }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. VOLTAGE FORECAST CHART (Blue) */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex flex-col justify-between overflow-hidden">
        <CardHeader className="pb-2 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
                <Zap className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
                  {t('voltTitle')}
                </CardTitle>
                <CardDescription className="text-xs">{t('voltDesc')}</CardDescription>
              </div>
            </div>
            {latestForecast && (
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase font-mono block">{t('projected')}</span>
                <span className="text-base font-black text-blue-500 font-mono">
                  {latestForecast.voltage?.toFixed(2)}V
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-2 sm:px-4">
          <div className="w-full h-[230px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={230}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                <XAxis dataKey="formattedTime" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `${v}V`} width={45} tickLine={false} />
                <Tooltip content={<CustomForecastTooltip unit="V" t={t} />} />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="voltage" name={t('actualBaseline')} stroke="#71717a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="forecast_voltage" name={t('projectedTrajectory')} stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3, fill: '#3b82f6' }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3. ANOMALY RISK PROBABILITY (%) FORECAST CHART (Red) */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex flex-col justify-between overflow-hidden">
        <CardHeader className="pb-2 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
                <ShieldAlert className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
                  {t('probTitle')}
                </CardTitle>
                <CardDescription className="text-xs">{t('probDesc')}</CardDescription>
              </div>
            </div>
            {latestForecast && (
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase font-mono block">{t('peakRisk')}</span>
                <span className={`text-base font-black font-mono ${
                  maxProbability >= 80 ? 'text-red-400' :
                  maxProbability >= 50 ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {maxProbability.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-2 sm:px-4">
          <div className="w-full h-[230px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={230}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                <XAxis dataKey="formattedTime" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={45} tickLine={false} />
                <Tooltip content={<CustomForecastTooltip unit="%" t={t} />} />
                <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: t('warningThreshold'), fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: t('criticalThreshold'), fill: '#ef4444', fontSize: 10 }} />
                <Area type="monotone" dataKey="anomaly_probability" name={t('probTitle')} stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#probGradient)" dot={{ r: 4, fill: '#ef4444' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 4. VIBRATION X FORECAST CHART (Yellow) */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex flex-col justify-between overflow-hidden">
        <CardHeader className="pb-2 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
                <Activity className="w-4 h-4 text-yellow-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
                  {t('vibXTitle')}
                </CardTitle>
                <CardDescription className="text-xs">{t('vibXDesc')}</CardDescription>
              </div>
            </div>
            {latestForecast && (
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase font-mono block">{t('projected')}</span>
                <span className="text-base font-black text-yellow-500 font-mono">
                  {latestForecast.vib_x?.toFixed(3)} <span className="text-xs font-normal text-muted-foreground">g</span>
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-2 sm:px-4">
          <div className="w-full h-[230px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={230}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                <XAxis dataKey="formattedTime" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} width={45} tickLine={false} />
                <Tooltip content={<CustomForecastTooltip unit="g" t={t} />} />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="vib_x" name={t('actualBaseline')} stroke="#71717a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="forecast_vib_x" name={t('projectedTrajectory')} stroke="#eab308" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3, fill: '#eab308' }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 5. VIBRATION Y FORECAST CHART (Teal) */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex flex-col justify-between overflow-hidden">
        <CardHeader className="pb-2 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
                <Waves className="w-4 h-4 text-teal-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
                  {t('vibYTitle')}
                </CardTitle>
                <CardDescription className="text-xs">{t('vibYDesc')}</CardDescription>
              </div>
            </div>
            {latestForecast && (
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase font-mono block">{t('projected')}</span>
                <span className="text-base font-black text-teal-500 font-mono">
                  {latestForecast.vib_y?.toFixed(3)} <span className="text-xs font-normal text-muted-foreground">g</span>
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-2 sm:px-4">
          <div className="w-full h-[230px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={230}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                <XAxis dataKey="formattedTime" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} width={45} tickLine={false} />
                <Tooltip content={<CustomForecastTooltip unit="g" t={t} />} />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="vib_y" name={t('actualBaseline')} stroke="#71717a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="forecast_vib_y" name={t('projectedTrajectory')} stroke="#14b8a6" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3, fill: '#14b8a6' }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 6. VIBRATION Z FORECAST CHART (Indigo/Blue) */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex flex-col justify-between overflow-hidden">
        <CardHeader className="pb-2 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
                  {t('vibZTitle')}
                </CardTitle>
                <CardDescription className="text-xs">{t('vibZDesc')}</CardDescription>
              </div>
            </div>
            {latestForecast && (
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase font-mono block">{t('projected')}</span>
                <span className="text-base font-black text-blue-500 font-mono">
                  {latestForecast.vib_z?.toFixed(3)} <span className="text-xs font-normal text-muted-foreground">g</span>
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-2 sm:px-4">
          <div className="w-full h-[230px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={230}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                <XAxis dataKey="formattedTime" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} width={45} tickLine={false} />
                <Tooltip content={<CustomForecastTooltip unit="g" t={t} />} />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="vib_z" name={t('actualBaseline')} stroke="#71717a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="forecast_vib_z" name={t('projectedTrajectory')} stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3, fill: '#3b82f6' }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
