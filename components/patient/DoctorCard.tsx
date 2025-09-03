'use client';

import { Doctor } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment: (doctor: Doctor) => void;
}

export function DoctorCard({ doctor, onBookAppointment }: DoctorCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={doctor.photo_url} alt={doctor.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
            <Badge variant="secondary" className="mt-1">
              {doctor.specialization}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          onClick={() => onBookAppointment(doctor)}
          className="w-full flex items-center space-x-2 h-10"
        >
          <Calendar className="h-4 w-4" />
          <span>Book Appointment</span>
        </Button>
      </CardContent>
    </Card>
  );
}