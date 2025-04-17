import { SignUp } from "@clerk/clerk-react";

export const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <SignUp 
          path="/signup"
          routing="path"
          signInUrl="/signin"
          appearance={{
            elements: {
              rootBox: "w-full max-w-[450px]",
              card: "shadow-xl rounded-lg border border-gray-100 bg-white",
              headerTitle: "text-xl font-semibold text-gray-900",
              headerSubtitle: "text-sm text-gray-600",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium",
              formFieldInput: "border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900 rounded-md py-2 px-3",
              footerActionLink: "text-blue-600 hover:text-blue-800 font-medium",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500",
              formFieldLabel: "text-gray-700 font-medium",
              socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 text-gray-700 py-2",
              socialButtonsIconButton: "border-gray-200 hover:bg-gray-50"
            }
          }}
        />
      </div>
    </div>
  );
};
