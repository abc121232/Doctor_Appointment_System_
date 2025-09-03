'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { appointmentsApi } from '@/lib/api';
import { Doctor } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar } from 'lucide-react';

const appointmentSchema = z.object({
  date: z.string().min(1, 'Please select a date'),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

interface BookAppointmentModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookAppointmentModal({ doctor, isOpen, onClose }: BookAppointmentModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: (data: { doctorId: string; date: string }) => appointmentsApi.createAppointment(data),
    onSuccess: () => {
      toast.success('Appointment booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    },
  });

  const onSubmit = (data: AppointmentForm) => {
    if (!doctor) return;
    
    const appointmentDate = new Date(data.date);
    const formattedDate = format(appointmentDate, 'yyyy-MM-dd');
    
    bookAppointmentMutation.mutate({
      doctorId: doctor.id,
      date: formattedDate,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!doctor) return null;

  // Get minimum date (today)
  const today = new Date();
  const minDate = format(today, 'yyyy-MM-dd');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Schedule an appointment with Dr. {doctor.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={doctor.photo_url} alt={doctor.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
            <p className="text-sm text-gray-600">{doctor.specialization}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appointment-date">Appointment Date</Label>
            <Input
              id="appointment-date"
              type="date"
              min={minDate}
              {...register('date')}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={bookAppointmentMutation.isPending}
              className="flex-1 flex items-center space-x-2"
            >
              {bookAppointmentMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  <span>Book</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}