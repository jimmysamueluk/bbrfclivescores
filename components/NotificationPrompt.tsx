"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { isPushSubscribed, isPushNotificationSupported } from "@/lib/utils/pushNotifications";

export default function NotificationPrompt() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    // Check if user has dismissed the prompt
    const isDismissed = localStorage.getItem("notificationPromptDismissed");
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    // Check if notifications are supported
    if (!isPushNotificationSupported()) {
      return;
    }

    // Check if user is already subscribed
    const subscribed = await isPushSubscribed();
    if (!subscribed) {
      setShow(true);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("notificationPromptDismissed", "true");
  };

  const handleEnable = () => {
    router.push("/protected/settings/notifications");
  };

  if (!show || dismissed) {
    return null;
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">
            Get Live Score Updates
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            Enable notifications to receive instant updates when scores change, even
            when the app is closed.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleEnable}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              Enable Notifications
            </button>
            <button
              onClick={handleDismiss}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm border border-gray-300"
            >
              Maybe Later
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
