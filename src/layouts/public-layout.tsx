import { Header } from "@/components/header";
import AuthHandler from "@/handlers/auth-handler";
import { Outlet } from "react-router-dom";

export const PublicLayout = () => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* handler to store the user data */}
      <AuthHandler />
      
      {/* Add Header to appear on all pages */}
      <Header />
      
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
