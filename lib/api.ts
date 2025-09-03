import axios from 'axios';
import { User, Doctor, Appointment, ApiResponse, PaginatedResponse } from '@/types';

const API_BASE_URL = 'https://appointment-manager-node.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (data: { email: string; password: string; role: 'DOCTOR' | 'PATIENT' }) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
    return response.data;
  },

  registerPatient: async (data: { name: string; email: string; password: string; photo_url?: string }) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register/patient', data);
    return response.data;
  },

  registerDoctor: async (data: { name: string; email: string; password: string; specialization: string; photo_url?: string }) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register/doctor', data);
    return response.data;
  },
};

// Doctors API
export const doctorsApi = {
  getDoctors: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    specialization?: string;
  }) => {
    const response = await api.get<PaginatedResponse<Doctor>>('/doctors', { params });
    return response.data;
  },

  getSpecializations: async () => {
    const response = await api.get<string[]>('/specializations');
    return response.data;
  },
};

// Appointments API
export const appointmentsApi = {
  createAppointment: async (data: { doctorId: string; date: string }) => {
    const response = await api.post<ApiResponse<Appointment>>('/appointments', data);
    return response.data;
  },

  getPatientAppointments: async (params: { status?: string; page?: number }) => {
    const response = await api.get<PaginatedResponse<Appointment>>('/appointments/patient', { params });
    return response.data;
  },

  getDoctorAppointments: async (params: { status?: string; date?: string; page?: number }) => {
    const response = await api.get<PaginatedResponse<Appointment>>('/appointments/doctor', { params });
    return response.data;
  },

  updateAppointmentStatus: async (data: { status: 'COMPLETED' | 'CANCELLED'; appointment_id: string }) => {
    const response = await api.patch<ApiResponse<Appointment>>('/appointments/update-status', data);
    return response.data;
  },
};