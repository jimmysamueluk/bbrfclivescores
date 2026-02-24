"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Check, X } from "lucide-react";
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushSubscribed,
  isPushNotificationSupported,
  sendTestNotification,
} from "@/lib/utils/pushNotifications";

export default function NotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkSubscriptionStatus();
    setIsSupported(isPushNotificationSupported());
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const subscribed = await isPushSubscribed();
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await subscribeToPushNotifications();
      setIsSubscribed(true);
      setSuccess("Successfully subscribed to notifications!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Subscription error:", error);
      setError(
        error.message || "Failed to subscribe to notifications. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
      setSuccess("Successfully unsubscribed from notifications.");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Unsubscribe error:", error);
      setError(
        error.message || "Failed to unsubscribe. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      setSuccess("Test notification sent!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError("Failed to send test notification.");
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">
              Notifications Not Supported
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your browser doesn't support push notifications. Try using Chrome,
              Firefox, or Safari on a supported device.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="w-6 h-6 text-[#800020]" />
        <h2 className="text-xl font-bold text-gray-900">
          Score Notifications
        </h2>
      </div>

      <p className="text-gray-600 mb-6">
        Get instant notifications when scores are updated in matches.
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Subscription Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Status</p>
            <p className="text-sm text-gray-600 mt-1">
              {isSubscribed
                ? "You're receiving notifications"
                : "Notifications are disabled"}
            </p>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${
              isSubscribed ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {!isSubscribed ? (
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#800020] to-[#a6002a] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Enabling..." : "Enable Notifications"}
          </button>
        ) : (
          <>
            <button
              onClick={handleTestNotification}
              className="w-full bg-gradient-to-r from-[#B8860B] to-[#daa520] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Send Test Notification
            </button>
            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Disabling..." : "Disable Notifications"}
            </button>
          </>
        )}
      </div>

      {/* Info Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900 font-medium mb-2">
          What you'll receive:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Live score updates (tries, conversions, penalties)</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Match status changes (kick-off, half-time, full-time)</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Notifications work even when the app is closed</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
