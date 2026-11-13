import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return <AuthCard title="Request an account" description="Share your work details. An administrator will review and assign your access."><RegisterForm /></AuthCard>;
}
