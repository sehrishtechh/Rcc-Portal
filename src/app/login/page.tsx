import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return <AuthCard title="Welcome back" description="Sign in with your approved RCC Portal account."><LoginForm /></AuthCard>;
}
