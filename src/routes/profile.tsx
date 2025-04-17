import { UserProfile } from "@clerk/clerk-react";

export const ProfilePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <UserProfile 
        path="/profile"
        routing="path"
        appearance={{
          elements: {
            rootBox: "w-full max-w-[900px] mx-4",
            card: "shadow-lg rounded-lg border border-gray-100 bg-white",
            navbar: "bg-gray-50 border-b border-gray-200",
            navbarButton: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
            navbarButtonActive: "text-blue-600 bg-white hover:bg-white border-b-2 border-blue-600",
            pageScrollBox: "p-6"
          }
        }}
      />
    </div>
  );
}; 