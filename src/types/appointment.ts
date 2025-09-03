
export interface Appointment {
    id: string;
    doctorId: string;
    patientId: string;
    date: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    doctor?: {
      name: string;
      specialization: string;
      photo_url?: string;
    };
    patient?: {
      name: string;
      email: string;
      photo_url?: string;
    };
  }
  
  export interface AppointmentsResponse {
    appointments: Appointment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }