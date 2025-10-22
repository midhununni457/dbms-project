"use client";
import { useApi } from "../context/ApiContext";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { logout, userData } = useApi();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-card border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-foreground">LOGO</h1>
        </div>

        <div className="flex items-center space-x-4">
          {userData.name && (
            <span className="text-sm text-muted-foreground">
              Welcome, {userData.name}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
