import { AuthGuard } from '@/components/auth/AuthGuard';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="PATIENT">
      {children}
    </AuthGuard>
  );
}