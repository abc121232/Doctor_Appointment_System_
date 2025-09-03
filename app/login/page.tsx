'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { User, Stethoscope } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['DOCTOR', 'PATIENT']),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'DOCTOR' | 'PATIENT'>('PATIENT');
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: 'PATIENT' },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      login(response.data.user, response.data.token);
      toast.success('Login successful!');
      
      if (response.data.user.role === 'DOCTOR') {
        router.push('/doctor/dashboard');
      } else {
        router.push('/patient/dashboard');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const handleRoleSelect = (role: 'DOCTOR' | 'PATIENT') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription>Sign in to your MedConnect account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Login as</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={selectedRole === 'PATIENT' ? 'default' : 'outline'}
                  onClick={() => handleRoleSelect('PATIENT')}
                  className="flex items-center space-x-2 h-12"
                >
                  <User className="h-4 w-4" />
                  <span>Patient</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === 'DOCTOR' ? 'default' : 'outline'}
                  onClick={() => handleRoleSelect('DOCTOR')}
                  className="flex items-center space-x-2 h-12"
                >
                  <Stethoscope className="h-4 w-4" />
                  <span>Doctor</span>
                </Button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}