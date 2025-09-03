'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { DoctorAppointmentCard } from '@/components/doctor/DoctorAppointmentCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { Filter, Calendar } from 'lucide-react';

export default function DoctorDashboard() {
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: appointmentsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['doctor-appointments', statusFilter, dateFilter, currentPage],
    queryFn: () =>
      appointmentsApi.getDoctorAppointments({
        status: statusFilter || undefined,
        date: dateFilter || undefined,
        page: currentPage,
      }),
  });

  const handleClearFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  // Get today's date in YYYY-MM-DD format
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-2">Manage your patient appointments and consultations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointmentsResponse?.data.filter(a => a.status === 'PENDING').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointmentsResponse?.data.filter(a => a.status === 'COMPLETED').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointmentsResponse?.data.filter(a => a.status === 'CANCELLED').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-filter">Filter by Date</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <div className="flex space-x-2">
                  <Button onClick={() => setDateFilter(today)} variant="outline" className="flex-1">
                    Today
                  </Button>
                  <Button onClick={handleClearFilters} variant="outline">
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <DoctorAppointmentCard key={appointment.id} appointment={appointment} />
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
                <p className="text-gray-500">No appointments found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}