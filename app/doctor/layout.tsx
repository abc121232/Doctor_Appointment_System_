import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="DOCTOR">
      {children}
    </AuthGuard>
  );
}