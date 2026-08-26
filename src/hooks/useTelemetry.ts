import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHealthStatuses,
  getSensorReadings,
  getEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  HealthStatus,
  SensorReading,
  Equipment,
} from '@/lib/api/telemetry';
import { PaginatedResponse } from '@/lib/api/types';
export { useTelemetryWebSocket } from './useTelemetryWebSocket';

export const POLLING_INTERVAL = 60 * 1000; // 60s fallback polling when WebSocket is connected

export function useEquipments(search?: string) {
  return useQuery<Equipment[]>({
    queryKey: ['equipments', search],
    queryFn: () => getEquipments(search),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useHealthStatuses(equipmentId?: number, startDate?: string, endDate?: string, page: number = 1) {
  return useQuery<PaginatedResponse<HealthStatus>>({
    queryKey: ['health-statuses', equipmentId, startDate, endDate, page],
    queryFn: () => getHealthStatuses(equipmentId, startDate, endDate, page),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useSensorReadings(equipmentId: number | undefined, page: number = 1) {
  return useQuery<PaginatedResponse<SensorReading>>({
    queryKey: ['sensor-readings', equipmentId, page],
    queryFn: () => getSensorReadings(equipmentId as number, page),
    enabled: !!equipmentId,
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEquipment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipments'] }),
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Equipment> }) => updateEquipment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipments'] }),
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEquipment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipments'] }),
  });
}
