"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PresenterPage() {
  const router = useRouter();
  
  // Only redirect if accessing exactly /presenter without any sub-path
  // This allows /presenter/edit/[id] and /presenter/[sessionId] to work properly
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/presenter') {
      router.replace("/dashboard");
    }
  }, [router]);

  return null;
}