"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/auth/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-burgundy to-gold shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4 gap-2">
            <div className="min-w-0 flex-shrink">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                🏉 Bannockburn RFC
              </h1>
              <p className="text-white/90 text-xs sm:text-sm">Live Scores</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-white font-medium text-sm">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-white/80 text-xs capitalize">{user.role}</p>
              </div>
              <div className="text-right sm:hidden">
                <p className="text-white font-medium text-xs">
                  {user.firstName}
                </p>
                <p className="text-white/80 text-xs capitalize">{user.role}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/protected/settings/notifications")}
                className="text-white hover:bg-white/20 min-w-[40px] h-10"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-white/20 min-w-[40px] h-10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
