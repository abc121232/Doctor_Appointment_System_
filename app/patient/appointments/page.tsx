'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { AppointmentCard } from '@/components/patient/AppointmentCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PatientAppointments() {
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: appointmentsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['patient-appointments', statusFilter, currentPage],
    queryFn: () =>
      appointmentsApi.getPatientAppointments({
        status: statusFilter || undefined,
        page: currentPage,
      }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/patient/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Doctors
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600 mt-2">Manage your scheduled appointments</p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All appointments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All appointments</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Failed to load appointments. Please try again.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {appointmentsResponse?.data.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>

            {/* Pagination */}
            {appointmentsResponse?.pagination && appointmentsResponse.pagination.total_pages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {appointmentsResponse.pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(appointmentsResponse.pagination.total_pages, currentPage + 1))}
                  disabled={currentPage === appointmentsResponse.pagination.total_pages}
                >
                  Next
                </Button>
              </div>
            )}

            {appointmentsResponse?.data.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No appointments found.</p>
                <Link href="/patient/dashboard">
                  <Button className="mt-4">Book Your First Appointment</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}