'use client';

import { Appointment } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { User, Calendar, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => appointmentsApi.updateAppointmentStatus({
      appointment_id: appointment.id,
      status: 'CANCELLED',
    }),
    onSuccess: () => {
      toast.success('Appointment cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
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
              <AvatarImage src={appointment.doctor?.photo_url} alt={appointment.doctor?.name} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{appointment.doctor?.name}</h3>
              <p className="text-sm text-gray-600">{appointment.doctor?.specialization}</p>
            </div>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formatDate(appointment.date)}</span>
          </div>
          {appointment.status === 'PENDING' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}