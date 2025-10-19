"use client";
import { useApi } from "../../context/ApiContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedLayout({ children }) {
  const { accessToken, userData } = useApi();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(accessToken, userData);
    if (!accessToken) {
      const timer = setTimeout(() => {
        if (!accessToken) {
          console.log("No access token after delay");
          router.push("/login");
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }

    if (accessToken && (!userData.id || !userData.role)) {
      const isUserDataInitialized = userData.id !== "" || userData.role !== "";

      if (isUserDataInitialized && (!userData.id || !userData.role)) {
        router.push("/login");
        return;
      }

      return;
    }

    if (accessToken && userData.id && userData.role) {
      setIsLoading(false);
    }
  }, [accessToken, userData, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  } else return <div>{children}</div>;
}
