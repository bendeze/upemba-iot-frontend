import { apiClient } from '../axios';
import { z } from 'zod';
import { PaginatedResponse } from './types';

export interface ForecastPoint {
  step: number;
  timestamp: string;
  temperature: number;
  voltage: number;
  vib_x: number;
  vib_y: number;
  vib_z: number;
  anomaly_score?: number;
  anomaly_probability?: number;
  confidence?: number;
  status?: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface HealthStatus {
  id: number;
  equipment: string;
  equipment_name: string;
  anomaly_score: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  prediction_timestamp: string;
  predicted_status?: 'NORMAL' | 'WARNING' | 'CRITICAL' | null;
  predictive_anomaly_score?: number | null;
  prediction_horizon_steps?: number;
  prediction_horizon_minutes?: number | null;
  forecasted_values?: ForecastPoint[] | null;
  prediction_generated_at?: string | null;
  cpu_load_percent?: number;
  ram_allocation_mb?: number;
  processing_latency_ms?: number;
}

export interface Equipment {
  id: string;
  name: string;
  equipment_type: string;
  mac_address: string;
  location_notes: string;
  is_active: boolean;
}

export interface SensorReading {
  id: number;
  equipment: string;
  temperature: number;
  voltage: number;
  vib_x: number;
  vib_y: number;
  vib_z: number;
  timestamp: string;
}


export const getEquipments = async (search?: string): Promise<Equipment[]> => {
  try {
    const params = search ? { search } : {};
    const response = await apiClient.get<Equipment[]>('/equipment/', { params });
    console.log("[API] /equipment/ raw response:", response.data);
    if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      return (response.data as any).results;
    }
    return response.data || [];
  } catch (error: any) {
    console.error("[API ERROR] /equipment/:", error.response?.data || error.message);
    throw error;
  }
};

export const createEquipment = async (data: Partial<Equipment>): Promise<Equipment> => {
  const response = await apiClient.post<Equipment>('/equipment/', data);
  return response.data;
};

export const updateEquipment = async (id: string, data: Partial<Equipment>): Promise<Equipment> => {
  const response = await apiClient.patch<Equipment>(`/equipment/${id}/`, data);
  return response.data;
};

export const deleteEquipment = async (id: string): Promise<void> => {
  await apiClient.delete(`/equipment/${id}/`);
};

// Fetch all health statuses (with optional filters)
export const getHealthStatuses = async (
  equipmentId?: string,
  startDate?: string,
  endDate?: string,
  page: number = 1
): Promise<PaginatedResponse<HealthStatus>> => {
  const params: any = { page };
  if (equipmentId) params.equipment = equipmentId;
  
  // Start date inherently starts at 00:00:00, which is perfectly inclusive
  if (startDate) params.start_date = startDate;
  
  // End date of '2026-03-25' translates to 00:00:00 in Django. 
  // We must append 23:59:59 to include all logs that occurred during that day!
  if (endDate) {
    if (endDate.length === 10) {
      params.end_date = `${endDate}T23:59:59.999Z`;
    } else {
      params.end_date = endDate;
    }
  }

  const response = await apiClient.get<PaginatedResponse<HealthStatus>>('/health-status/', { params });
  return response.data;
};

// Fetch sensor readings (with optional filters)
export const getSensorReadings = async (
  equipmentId?: string,
  startDate?: string,
  endDate?: string,
  page: number = 1
): Promise<PaginatedResponse<SensorReading>> => {
  const params: any = {
    ordering: '-timestamp', // Expect newest first
    page,
  };
  if (equipmentId) params.equipment = equipmentId;
  if (startDate) params.start_date = startDate;
  if (endDate) {
    if (endDate.length === 10) {
      params.end_date = `${endDate}T23:59:59.999Z`;
    } else {
      params.end_date = endDate;
    }
  }

  const response = await apiClient.get<PaginatedResponse<SensorReading>>('/sensor-readings/', { params });
  return response.data;
};
