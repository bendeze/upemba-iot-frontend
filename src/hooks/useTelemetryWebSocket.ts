'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SensorReading, HealthStatus } from '@/lib/api/telemetry';
import { PaginatedResponse } from '@/lib/api/types';

function getWebSocketBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL.replace(/\/+$/, '');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl.startsWith('http')) {
    const url = new URL(apiUrl);
    const wsProto = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${url.host}`;
  }

  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // If running in development with default Django port 8000
  const host = window.location.hostname;
  return `${proto}//${host}:8000`;
}

interface UseTelemetryWebSocketOptions {
  equipmentId?: number;
  isGlobal?: boolean;
  enabled?: boolean;
}

export function useTelemetryWebSocket({
  equipmentId,
  isGlobal = false,
  enabled = true,
}: UseTelemetryWebSocketOptions = {}) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [latestHealth, setLatestHealth] = useState<HealthStatus | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!enabled || (typeof window === 'undefined')) return;
    if (!equipmentId && !isGlobal) return;

    const baseUrl = getWebSocketBaseUrl();
    if (!baseUrl) return;

    const path = isGlobal
      ? `${baseUrl}/ws/telemetry/global/`
      : `${baseUrl}/ws/telemetry/equipment/${equipmentId}/`;

    try {
      const ws = new WebSocket(path);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Periodic heartbeat ping every 25 seconds
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === 'telemetry_reading' && payload.data) {
            const reading: SensorReading = payload.data;
            setLatestReading(reading);

            // Optimistically update TanStack Query cache for sensor readings
            const targetEquipmentId = reading.equipment;
            queryClient.setQueriesData<PaginatedResponse<SensorReading>>(
              { queryKey: ['sensor-readings', targetEquipmentId] },
              (oldData) => {
                if (!oldData || !oldData.results) {
                  return {
                    count: 1,
                    next: null,
                    previous: null,
                    results: [reading],
                  };
                }

                // Prevent duplicate insertions
                if (oldData.results.some((r) => r.id === reading.id)) {
                  return oldData;
                }

                // Keep newest at front, cap at max buffer size (e.g. 50 items)
                const updatedResults = [reading, ...oldData.results].slice(0, 50);
                return {
                  ...oldData,
                  count: (oldData.count || 0) + 1,
                  results: updatedResults,
                };
              }
            );
          } else if (payload.type === 'health_update' && payload.data) {
            const health: HealthStatus = payload.data;
            setLatestHealth(health);

            // Update TanStack Query cache for health statuses
            queryClient.setQueriesData<PaginatedResponse<HealthStatus>>(
              { queryKey: ['health-statuses'] },
              (oldData) => {
                if (!oldData || !oldData.results) return oldData;
                const updated = oldData.results.map((item) =>
                  item.equipment === health.equipment ? { ...item, ...health } : item
                );
                return {
                  ...oldData,
                  results: updated,
                };
              }
            );
          }
        } catch (e) {
          console.warn('[WebSocket] Error parsing message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        // Exponential backoff reconnect: 1s, 2s, 4s, max 10s
        if (enabled) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          reconnectAttempts.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket] Connection error:', err);
        ws.close();
      };
    } catch (e) {
      console.warn('[WebSocket] Failed to initialize socket:', e);
    }
  }, [enabled, equipmentId, isGlobal, queryClient]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    latestReading,
    latestHealth,
  };
}
