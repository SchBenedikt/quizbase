"use client";

import { useEffect } from "react";
import { useUser } from "@/firebase";

export function AuthManager() {
  const { user } = useUser();

  useEffect(() => {
    const setTokenCookie = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          // Set the token in a cookie with secure attributes
          document.cookie = `firebase-token=${token}; path=/; max-age=3600; sameSite=strict; secure`;
        } catch (error) {
          console.error('Error setting auth token cookie:', error);
        }
      } else {
        // Clear the token cookie when user logs out
        document.cookie = 'firebase-token=; path=/; max-age=0';
      }
    };

    setTokenCookie();
  }, [user]);

  // This component doesn't render anything
  return null;
}
