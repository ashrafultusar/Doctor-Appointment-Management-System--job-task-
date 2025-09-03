// app/patient/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDoctors, getSpecializations, createAppointment } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  photo_url?: string;
}

export default function PatientDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const user = useAuthStore((state) => state.user);
  const limit = 6; // Number of doctors per page

  // Fetch doctors with pagination and filters
  const { data: doctorsData, isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors", currentPage, searchTerm, selectedSpecialization],
    queryFn: () => 
      getDoctors({
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        specialization: selectedSpecialization || undefined,
      }),
  });

  // Fetch specializations for filter
  const { data: specializations = [] } = useQuery({
    queryKey: ["specializations"],
    queryFn: getSpecializations,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSpecializationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSpecialization(e.target.value);
    setCurrentPage(1);
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedDate) return;

    setBookingStatus("loading");
    try {
      await createAppointment({
        doctorId: selectedDoctor.id,
        date: selectedDate,
      });
      setBookingStatus("success");
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingStatus("idle");
        setSelectedDoctor(null);
        setSelectedDate("");
      }, 2000);
    } catch (error) {
      console.error("Booking failed:", error);
      setBookingStatus("error");
    }
  };

  const totalPages = doctorsData?.totalPages || 1;

  return (
    <ProtectedRoute requiredRole="PATIENT">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Find and book appointments with our specialist doctors
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Doctors
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by doctor name..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Specialization
                </label>
                <select
                  id="specialization"
                  value={selectedSpecialization}
                  onChange={handleSpecializationChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec: string) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSpecialization("");
                    setCurrentPage(1);
                  }}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="bg-white rounded-lg shadow p-6">
            {loadingDoctors ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {doctorsData?.doctors?.map((doctor: Doctor) => (
                    <div key={doctor.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-4">
                        <img
                          src={doctor.photo_url || "/default-avatar.png"}
                          alt={doctor.name}
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{doctor.email}</span>
                        <button
                          onClick={() => handleBookAppointment(doctor)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {doctorsData?.doctors?.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No doctors found matching your criteria.</p>
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

        {/* Booking Modal */}
        {showBookingModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
              
              <div className="mb-4">
                <p className="text-gray-600">Doctor: <span className="font-semibold">{selectedDoctor.name}</span></p>
                <p className="text-gray-600">Specialization: <span className="font-semibold">{selectedDoctor.specialization}</span></p>
              </div>

              <div className="mb-4">
                <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date and Time
                </label>
                <input
                  type="datetime-local"
                  id="appointment-date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedDoctor(null);
                    setSelectedDate("");
                    setBookingStatus("idle");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={!selectedDate || bookingStatus === "loading"}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingStatus === "loading" ? "Booking..." : "Confirm Booking"}
                </button>
              </div>

              {bookingStatus === "success" && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                  Appointment booked successfully!
                </div>
              )}
              {bookingStatus === "error" && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                  Failed to book appointment. Please try again.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}