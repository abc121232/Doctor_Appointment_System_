export interface User {
  id: string;
  name: string;
  email: string;
  role: 'DOCTOR' | 'PATIENT';
  photo_url?: string;
  specialization?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  photo_url?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  doctor?: Doctor;
  patient?: {
    id: string;
    name: string;
    email: string;
    photo_url?: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}