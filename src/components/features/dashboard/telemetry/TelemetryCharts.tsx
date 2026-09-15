'use client';

import { useTranslations } from 'next-intl';
import { useSensorReadings } from '@/hooks/useTelemetry';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
} from 'recharts';
import { Thermometer, Zap, Activity, Waves } from 'lucide-react';
import { format } from 'date-fns';
import { Vibration3DVisualizer } from './Vibration3DVisualizer';

interface TelemetryChartsProps {
  equipmentId: string | undefined;
}

export function TelemetryCharts({ equipmentId }: TelemetryChartsProps) {
  const t = useTranslations('Telemetry.charts');
  const { data: readingsData, isLoading } = useSensorReadings(equipmentId);

  if (!equipmentId) return null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-72 bg-muted/20 border border-border/40 rounded-xl" />
        ))}
      </div>
    );
  }

  const readings = readingsData?.results ? [...readingsData.results].reverse() : [];

  if (readings.length === 0) {
    return (
      <div className="p-8 border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm text-center text-muted-foreground">
        {t('noReadings')}
      </div>
    );
  }

  // Format real-time points
  const chartData = readings.map((r) => ({
    timestamp: r.timestamp,
    formattedTime: format(new Date(r.timestamp), 'HH:mm:ss'),
    temperature: r.temperature,
    voltage: r.voltage,
    vib_x: r.vib_x,
    vib_y: r.vib_y,
    vib_z: r.vib_z,
  }));

  const latest = readings[readings.length - 1];

  return (
    <div className="flex flex-col gap-6">
      {/* 3D Vibration Vector Movement Card */}
      <Vibration3DVisualizer readings={readings} />

      {/* Grid of 5 Individual Single-Metric Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* 1. TEMPERATURE CHART (Amber/Ember) */}
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex flex-col justify-between overflow-hidden">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
                    {t('tempStream')}
                  </CardTitle>
                  <CardDescription className="text-xs">{t('tempDesc')}</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-amber-500 font-mono">
                  {latest?.temperature?.toFixed(1) ?? '--'}°C
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-2 sm:px-4">
            <div className="w-full h-[220px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="formattedTime" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `${v}°C`} width={45} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#f59e0b" strokeWidth={2.5} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. VOLTAGE CHART (Blue) */}
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex flex-col justify-between overflow-hidden">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
                  <Zap className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
                    {t('voltStream')}
                  </CardTitle>
                  <CardDescription className="text-xs">{t('voltDesc')}</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-blue-500 font-mono">
                  {latest?.voltage?.toFixed(2) ?? '--'}V
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-2 sm:px-4">
            <div className="w-full h-[220px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVolt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="formattedTime" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `${v}V`} width={45} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="voltage" name="Voltage (V)" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorVolt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. VIBRATION X CHART (Yellow) */}
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex flex-col justify-between overflow-hidden">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
                  <Activity className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
                    {t('vibXStream')}
                  </CardTitle>
                  <CardDescription className="text-xs">{t('vibXDesc')}</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-yellow-500 font-mono">
                  {latest?.vib_x?.toFixed(3) ?? '--'} <span className="text-xs font-normal text-muted-foreground">g</span>
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-2 sm:px-4">
            <div className="w-full h-[220px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVibX" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="formattedTime" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} width={45} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="vib_x" name="Vib X (g)" stroke="#eab308" strokeWidth={2.5} fill="url(#colorVibX)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4. VIBRATION Y CHART (Teal) */}
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex flex-col justify-between overflow-hidden">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
                  <Waves className="w-4 h-4 text-teal-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
                    {t('vibYStream')}
                  </CardTitle>
                  <CardDescription className="text-xs">{t('vibYDesc')}</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-teal-500 font-mono">
                  {latest?.vib_y?.toFixed(3) ?? '--'} <span className="text-xs font-normal text-muted-foreground">g</span>
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-2 sm:px-4">
            <div className="w-full h-[220px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVibY" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="formattedTime" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} width={45} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="vib_y" name="Vib Y (g)" stroke="#14b8a6" strokeWidth={2.5} fill="url(#colorVibY)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 5. VIBRATION Z CHART (Indigo/Blue) */}
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex flex-col justify-between overflow-hidden md:col-span-2 xl:col-span-1">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground">
                    {t('vibZStream')}
                  </CardTitle>
                  <CardDescription className="text-xs">{t('vibZDesc')}</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-blue-500 font-mono">
                  {latest?.vib_z?.toFixed(3) ?? '--'} <span className="text-xs font-normal text-muted-foreground">g</span>
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-2 sm:px-4">
            <div className="w-full h-[220px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVibZ" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="formattedTime" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} width={45} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="vib_z" name="Vib Z (g)" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorVibZ)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
