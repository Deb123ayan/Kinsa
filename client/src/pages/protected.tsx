import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedRoute(props: P) {
    const { isLoggedIn } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
      if (!isLoggedIn) {
        setLocation("/auth");
      }
    }, [isLoggedIn, setLocation]);

    if (!isLoggedIn) {
      return null;
    }

    return <Component {...props} />;
  };
}
