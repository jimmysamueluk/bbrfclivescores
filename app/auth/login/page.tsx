"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError("");
      const response = await authApi.login(data);
      setAuth(response.user, response.token);
      router.push("/protected/live-scores");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError("");
      const response = await authApi.login({ email, password });
      setAuth(response.user, response.token);
      router.push("/protected/live-scores");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-burgundy via-burgundy-light to-gold p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            🏉 Bannockburn RFC
          </h1>
          <p className="text-white/90 text-base sm:text-lg">Live Scores</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="h-11 sm:h-10"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••"
                  className="h-11 sm:h-10"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1.5">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full min-h-[44px]" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">Demo Accounts:</p>
              <div className="space-y-2.5">
                <Button
                  variant="outline"
                  className="w-full min-h-[44px] text-sm"
                  onClick={() =>
                    demoLogin(
                      "coach@bannockburnrugby.co.uk",
                      "coach123"
                    )
                  }
                  disabled={loading}
                >
                  Coach Login
                </Button>
                <Button
                  variant="outline"
                  className="w-full min-h-[44px] text-sm"
                  onClick={() =>
                    demoLogin("jamie.smith@example.com", "player123")
                  }
                  disabled={loading}
                >
                  Player Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/80 text-xs sm:text-sm mt-4 sm:mt-6 px-4">
          Modern Next.js 15 • Real-time Updates • Mobile-First
        </p>
      </div>
    </div>
  );
}
