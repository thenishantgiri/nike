import React, { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import SocialProviders from "@/components/SocialProviders";
import { signUp } from "@/lib/auth/actions";

export default function SignUp() {
  const handleSignUp = signUp;

  return (
    <div className="space-y-8">
      <div className="text-right">
        <span className="text-dark-700 font-jost text-body">Already have an account? </span>
        <Link href="/sign-in" className="text-dark-900 font-jost font-medium underline">
          Sign In
        </Link>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-dark-900 font-jost">
          Join Nike Today!
        </h1>
        <p className="text-dark-700 font-jost text-body">
          Create your account to start your fitness journey
        </p>
      </div>

      <SocialProviders />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-light-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-light-100 text-dark-700 font-jost">Or sign up with</span>
        </div>
      </div>

      <Suspense fallback={<div className="text-center font-jost text-body">Loading form…</div>}>
        <AuthForm mode="signup" onSubmit={handleSignUp} />
      </Suspense>

      <div className="text-center text-sm text-dark-700 font-jost">
        By signing up, you agree to our{" "}
        <Link href="#" className="underline hover:text-dark-900">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline hover:text-dark-900">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
