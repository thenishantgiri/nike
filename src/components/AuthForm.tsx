"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "signin" | "signup";
  onSubmit: (formData: FormData) => Promise<{ success?: boolean; error?: string } | undefined>;
}

export default function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formDataObj = new FormData();
    formDataObj.append('email', formData.email);
    formDataObj.append('password', formData.password);
    if (mode === 'signup') {
      formDataObj.append('name', formData.name);
    }

    try {
      const result = await onSubmit(formDataObj);
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-dark-900 font-jost mb-2">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required={mode === "signup"}
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-light-300 rounded-lg focus:ring-2 focus:ring-dark-900 focus:border-transparent outline-none font-jost text-body disabled:opacity-50"
            placeholder="Enter your full name"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-dark-900 font-jost mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-light-300 rounded-lg focus:ring-2 focus:ring-dark-900 focus:border-transparent outline-none font-jost text-body disabled:opacity-50"
          placeholder="johndoe@gmail.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-dark-900 font-jost mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-3 pr-12 border border-light-300 rounded-lg focus:ring-2 focus:ring-dark-900 focus:border-transparent outline-none font-jost text-body disabled:opacity-50"
            placeholder="minimum 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-500 hover:text-dark-900 disabled:opacity-50"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange hover:bg-orange/90 text-light-100 font-jost font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : `${mode === "signin" ? "Sign In" : "Sign Up"} →`}
      </button>

      {mode === "signin" && (
        <div className="text-center">
          <a href="#" className="text-dark-700 hover:text-dark-900 font-jost text-body underline">
            Forgot password?
          </a>
        </div>
      )}
    </form>
  );
}
