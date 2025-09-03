'use client';

import { Appointment } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { User, Check, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface DoctorAppointmentCardProps {
  appointment: Appointment;
}

export function DoctorAppointmentCard({ appointment }: DoctorAppointmentCardProps) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: (status: 'COMPLETED' | 'CANCELLED') =>
      appointmentsApi.updateAppointmentStatus({
        appointment_id: appointment.id,
        status,
      }),
    onSuccess: (_, status) => {
      toast.success(`Appointment marked as ${status.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    },
  });

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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={appointment.patient?.photo_url} alt={appointment.patient?.name} />
              <AvatarFallback className="bg-green-100 text-green-600">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{appointment.patient?.name}</h3>
              <p className="text-sm text-gray-600">{appointment.patient?.email}</p>
              <p className="text-sm text-gray-500">{formatDate(appointment.date)}</p>
            </div>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      
      {appointment.status === 'PENDING' && (
        <CardContent className="pt-0">
          <div className="flex space-x-3">
            <Button
              onClick={() => updateStatusMutation.mutate('COMPLETED')}
              disabled={updateStatusMutation.isPending}
              className="flex-1 flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              <span>Complete</span>
            </Button>
            <Button
              variant="destructive"
              onClick={() => updateStatusMutation.mutate('CANCELLED')}
              disabled={updateStatusMutation.isPending}
              className="flex-1 flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}