'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi, doctorsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  photo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const doctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  specialization: z.string().min(1, 'Please select a specialization'),
  photo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type PatientForm = z.infer<typeof patientSchema>;
type DoctorForm = z.infer<typeof doctorSchema>;

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState('patient');
  const router = useRouter();
  const { login } = useAuthStore();

  const { data: specializations = [] } = useQuery({
    queryKey: ['specializations'],
    queryFn: doctorsApi.getSpecializations,
  });

  const patientForm = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
  });

  const doctorForm = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
  });

  const patientMutation = useMutation({
    mutationFn: authApi.registerPatient,
    onSuccess: (response) => {
      login(response.data.user, response.data.token);
      toast.success('Registration successful!');
      router.push('/patient/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const doctorMutation = useMutation({
    mutationFn: authApi.registerDoctor,
    onSuccess: (response) => {
      login(response.data.user, response.data.token);
      toast.success('Registration successful!');
      router.push('/doctor/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const onPatientSubmit = (data: PatientForm) => {
    const submitData = {
      ...data,
      photo_url: data.photo_url || undefined,
    };
    patientMutation.mutate(submitData);
  };

  const onDoctorSubmit = (data: DoctorForm) => {
    const submitData = {
      ...data,
      photo_url: data.photo_url || undefined,
    };
    doctorMutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
          <CardDescription>Join MedConnect today</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
            </TabsList>

            <TabsContent value="patient" className="mt-6">
              <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-name">Full Name</Label>
                  <Input
                    id="patient-name"
                    placeholder="Enter your full name"
                    {...patientForm.register('name')}
                    className={patientForm.formState.errors.name ? 'border-red-500' : ''}
                  />
                  {patientForm.formState.errors.name && (
                    <p className="text-sm text-red-500">{patientForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient-email">Email</Label>
                  <Input
                    id="patient-email"
                    type="email"
                    placeholder="Enter your email"
                    {...patientForm.register('email')}
                    className={patientForm.formState.errors.email ? 'border-red-500' : ''}
                  />
                  {patientForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{patientForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient-password">Password</Label>
                  <Input
                    id="patient-password"
                    type="password"
                    placeholder="Create a password"
                    {...patientForm.register('password')}
                    className={patientForm.formState.errors.password ? 'border-red-500' : ''}
                  />
                  {patientForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{patientForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient-photo">Profile Photo URL (Optional)</Label>
                  <Input
                    id="patient-photo"
                    placeholder="https://example.com/photo.jpg"
                    {...patientForm.register('photo_url')}
                    className={patientForm.formState.errors.photo_url ? 'border-red-500' : ''}
                  />
                  {patientForm.formState.errors.photo_url && (
                    <p className="text-sm text-red-500">{patientForm.formState.errors.photo_url.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={patientMutation.isPending}
                >
                  {patientMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Create Patient Account'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="doctor" className="mt-6">
              <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor-name">Full Name</Label>
                  <Input
                    id="doctor-name"
                    placeholder="Enter your full name"
                    {...doctorForm.register('name')}
                    className={doctorForm.formState.errors.name ? 'border-red-500' : ''}
                  />
                  {doctorForm.formState.errors.name && (
                    <p className="text-sm text-red-500">{doctorForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor-email">Email</Label>
                  <Input
                    id="doctor-email"
                    type="email"
                    placeholder="Enter your email"
                    {...doctorForm.register('email')}
                    className={doctorForm.formState.errors.email ? 'border-red-500' : ''}
                  />
                  {doctorForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{doctorForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor-password">Password</Label>
                  <Input
                    id="doctor-password"
                    type="password"
                    placeholder="Create a password"
                    {...doctorForm.register('password')}
                    className={doctorForm.formState.errors.password ? 'border-red-500' : ''}
                  />
                  {doctorForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{doctorForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select onValueChange={(value) => doctorForm.setValue('specialization', value)}>
                    <SelectTrigger className={doctorForm.formState.errors.specialization ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {doctorForm.formState.errors.specialization && (
                    <p className="text-sm text-red-500">{doctorForm.formState.errors.specialization.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor-photo">Profile Photo URL (Optional)</Label>
                  <Input
                    id="doctor-photo"
                    placeholder="https://example.com/photo.jpg"
                    {...doctorForm.register('photo_url')}
                    className={doctorForm.formState.errors.photo_url ? 'border-red-500' : ''}
                  />
                  {doctorForm.formState.errors.photo_url && (
                    <p className="text-sm text-red-500">{doctorForm.formState.errors.photo_url.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={doctorMutation.isPending}
                >
                  {doctorMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Create Doctor Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}