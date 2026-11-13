import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Set a new password" description="Choose a strong password to secure your RCC Portal account.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
