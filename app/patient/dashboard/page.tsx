'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorsApi } from '@/lib/api';
import { Doctor } from '@/types';
import { Header } from '@/components/layout/Header';
import { DoctorCard } from '@/components/patient/DoctorCard';
import { BookAppointmentModal } from '@/components/patient/BookAppointmentModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Search, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { data: specializations = [] } = useQuery({
    queryKey: ['specializations'],
    queryFn: doctorsApi.getSpecializations,
  });

  const {
    data: doctorsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['doctors', currentPage, searchTerm, selectedSpecialization],
    queryFn: () =>
      doctorsApi.getDoctors({
        page: currentPage,
        limit: 9,
        search: searchTerm || undefined,
        specialization: selectedSpecialization || undefined,
      }),
  });

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialization('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Your Doctor</h1>
            <p className="text-gray-600 mt-2">Book appointments with qualified healthcare professionals</p>
          </div>
          <Link href="/patient/appointments">
            <Button variant="outline" className="mt-4 sm:mt-0 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>My Appointments</span>
            </Button>
          </Link>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search by Doctor Name</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Enter doctor name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Filter by Specialization</Label>
                  <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                    <SelectTrigger>
                      <SelectValue placeholder="All specializations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All specializations</SelectItem>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1">
                      <Filter className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button type="button" variant="outline" onClick={handleClearFilters}>
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Doctors Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Failed to load doctors. Please try again.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {doctorsResponse?.data.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onBookAppointment={handleBookAppointment}
                />
              ))}
            </div>

            {/* Pagination */}
            {doctorsResponse?.pagination && doctorsResponse.pagination.total_pages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {doctorsResponse.pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(doctorsResponse.pagination.total_pages, currentPage + 1))}
                  disabled={currentPage === doctorsResponse.pagination.total_pages}
                >
                  Next
                </Button>
              </div>
            )}

            {doctorsResponse?.data.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No doctors found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>

      <BookAppointmentModal
        doctor={selectedDoctor}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}