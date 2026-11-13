import { AuthCard } from "@/components/auth/auth-card";
import { ResetRequestForm } from "@/components/auth/reset-request-form";

export default function ForgotPasswordPage() {
  return <AuthCard title="Reset your password" description="Enter your work email and we’ll send a reset link if the account exists."><ResetRequestForm /></AuthCard>;
}
