
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";



import { useAuthStore } from "@/stores/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getPatientAppointments, updateAppointmentStatus } from "@/lib/api";

interface Appointment {
  id: string;
  doctor: {
    name: string;
    specialization: string;
    photo_url?: string;
  };
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export default function PatientAppointments() {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cancellingAppointment, setCancellingAppointment] = useState<string | null>(null);



  const { data: appointmentsData, isLoading, refetch } = useQuery({
    queryKey: ["appointments", "patient", currentPage, selectedStatus],
    queryFn: () => 
      getPatientAppointments({
        status: selectedStatus || undefined,
        page: currentPage,
      }),
  });

  const handleCancelAppointment = async (appointmentId: string) => {
    setCancellingAppointment(appointmentId);
    try {
      await updateAppointmentStatus({
        status: 'CANCELLED',
        appointment_id: appointmentId,
      });
      refetch();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setCancellingAppointment(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = appointmentsData?.totalPages || 1;

  return (
    <ProtectedRoute requiredRole="PATIENT">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600 mt-2">Manage your scheduled appointments</p>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="w-full sm:w-auto">
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-lg shadow p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {appointmentsData?.appointments?.map((appointment: Appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                         
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor.name}</h3>
                            <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
                            <p className="text-sm text-gray-500">{formatDate(appointment.date)}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          
                          {appointment.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to cancel this appointment?")) {
                                  handleCancelAppointment(appointment.id);
                                }
                              }}
                              disabled={cancellingAppointment === appointment.id}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
                            >
                              {cancellingAppointment === appointment.id ? "Cancelling..." : "Cancel"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {appointmentsData?.appointments?.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No appointments found.</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-md ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 text-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}