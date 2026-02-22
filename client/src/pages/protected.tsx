import React, { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";

export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedRoute(props: P) {
    const { isLoggedIn, loading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
      if (!loading && !isLoggedIn) {
        setLocation("/auth");
      }
    }, [isLoggedIn, loading, setLocation]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isLoggedIn) {
      return null;
    }

    return <Component {...props} />;
  };
}
