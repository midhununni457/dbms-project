"use client";
import { useApi } from "../context/ApiContext";
import { Button } from "./ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { logout, userData } = useApi();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Check if a navigation link is active
  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    }
    if (href === "/tests") {
      return pathname === "/tests" || pathname.startsWith("/test/");
    }
    return pathname === href;
  };

  // Navigation links based on user role
  const getNavigationLinks = () => {
    if (userData.role === "faculty") {
      return [
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Tests", href: "/tests" },
      ];
    } else if (userData.role === "student") {
      return [
        { label: "Home", href: "/" },
        { label: "Tests", href: "/tests" },
      ];
    }
    return [];
  };

  const navigationLinks = getNavigationLinks();

  return (
    <nav className="bg-gradient-to-r from-pink-600/[.2] via-violet-900 to-indigo-900 backdrop-blur-sm border-b border-purple-800/30 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center">
              <button
                onClick={handleLogoClick}
                className="flex items-center space-x-2 text-2xl font-bold text-white hover:text-blue-400 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span>Exam Portal</span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 ml-10">
              {navigationLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  className={`font-medium transition-colors duration-200 px-3 py-2 rounded-md ${
                    isActive(link.href)
                      ? "text-purple-400 bg-purple-900/30 border border-purple-500/30"
                      : "text-gray-300 hover:text-purple-400 hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {userData.name && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {userData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-300 font-medium">
                  Welcome, {userData.name}
                </span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-500/30 text-red-400 hover:bg-red-900/20 hover:border-red-400 hover:text-red-300 transition-all duration-200 bg-transparent"
            >
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-blue-400 p-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 py-4">
            <div className="flex flex-col space-y-3">
              {navigationLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    router.push(link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left font-medium transition-colors duration-200 px-3 py-2 rounded-md ${
                    isActive(link.href)
                      ? "text-purple-400 bg-purple-900/30 border border-purple-500/30"
                      : "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {userData.name && (
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {userData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-300 font-medium">
                    Welcome, {userData.name}
                  </span>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="mx-3 border-red-500/30 text-red-400 hover:bg-red-900/20 hover:border-red-400 hover:text-red-300 transition-all duration-200 bg-transparent"
              >
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
