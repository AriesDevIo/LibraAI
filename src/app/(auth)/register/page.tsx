import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create your account · Libra",
  description:
    "Sign up for Libra with passwordless email verification — a security-first, AI-powered alternative to Notion.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
