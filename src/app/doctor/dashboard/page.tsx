
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDoctorAppointments, updateAppointmentStatus } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Appointment {
  id: string;
  patient: {
    name: string;
    email: string;
    photo_url?: string;
  };
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export default function DoctorDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingAppointment, setUpdatingAppointment] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"COMPLETED" | "CANCELLED" | null>(null);

  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();


  const { data: appointmentsData, isLoading, error } = useQuery({
    queryKey: ["appointments", "doctor", currentPage, selectedStatus, selectedDate],
    queryFn: () => 
      getDoctorAppointments({
        status: selectedStatus || undefined,
        date: selectedDate || undefined,
        page: currentPage,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "doctor"] });
      setUpdatingAppointment(null);
      setActionType(null);
    },
    onError: (error: any) => {
      console.error("Failed to update appointment:", error);
      alert(error.message || "Failed to update appointment status");
      setUpdatingAppointment(null);
      setActionType(null);
    }
  });

  const handleStatusUpdate = async (appointmentId: string, status: 'COMPLETED' | 'CANCELLED') => {
    if (!confirm(`Are you sure you want to mark this appointment as ${status.toLowerCase()}?`)) {
      return;
    }

    setUpdatingAppointment(appointmentId);
    setActionType(status);
    
    try {
      await updateStatusMutation.mutateAsync({
        status,
        appointment_id: appointmentId,
      });
    } catch (error) {
      // Error handling is done in onError callback
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getActionButtonText = (appointmentId: string, status: string, action: 'COMPLETED' | 'CANCELLED') => {
    if (updatingAppointment === appointmentId && actionType === action) {
      return "Updating...";
    }
    return action === 'COMPLETED' ? "Mark Completed" : "Cancel Appointment";
  };

  const isActionDisabled = (appointmentId: string, currentStatus: string, action: 'COMPLETED' | 'CANCELLED') => {
    if (updatingAppointment === appointmentId) return true;
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') return true;
    return false;
  };

  const totalPages = appointmentsData?.totalPages || 1;
  const totalAppointments = appointmentsData?.total || 0;

  return (
    <ProtectedRoute requiredRole="DOCTOR">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Doctor Dashboard - Welcome, Dr. {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your appointments and patient schedule
            </p>
            {totalAppointments > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Total appointments: {totalAppointments}
              </p>
            )}
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
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

              <div>
                <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Date
                </label>
                <input
                  type="date"
                  id="date-filter"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedStatus("");
                    setSelectedDate("");
                    setCurrentPage(1);
                  }}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-lg shadow p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 text-lg">Error loading appointments. Please try again.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Appointment Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {appointmentsData?.appointments?.map((appointment: Appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {appointment.patient.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {appointment.patient.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(appointment.date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'COMPLETED')}
                                disabled={isActionDisabled(appointment.id, appointment.status, 'COMPLETED')}
                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                              >
                                {getActionButtonText(appointment.id, appointment.status, 'COMPLETED')}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'CANCELLED')}
                                disabled={isActionDisabled(appointment.id, appointment.status, 'CANCELLED')}
                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                              >
                                {getActionButtonText(appointment.id, appointment.status, 'CANCELLED')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {appointmentsData?.appointments?.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      {selectedStatus || selectedDate 
                        ? "No appointments found matching your filters." 
                        : "You don't have any appointments yet."
                      }
                    </p>
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