"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AuthLoading from "@/app/components/AuthLoading";

export default function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedRoute(props: P) {
    const { isLoggedIn, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isLoggedIn) {
        router.push("/login");
      }
    }, [isLoggedIn, isLoading, router]);

    if (isLoading) {
      return <AuthLoading />;
    }

    if (!isLoggedIn) {
      return null; // Will redirect to login in useEffect
    }

    return <Component {...props} />;
  };
}
