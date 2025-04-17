import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { BrainCircuit, LayoutDashboard, User } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-blue-100 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-full">
              <BrainCircuit className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-blue-700 hover:text-blue-800 transition-colors">
              Talent Trail
            </h1>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link to="/generate">
                <Button 
                  variant="ghost" 
                  className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-1.5"
                  size="sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/profile">
                <Button 
                  variant="ghost" 
                  className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-1.5"
                  size="sm"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 border-2 border-blue-100 hover:border-blue-200",
                    userButtonTrigger: "focus:shadow-outline-blue rounded-full",
                  }
                }}
              />
            </div>
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <Button 
                variant="outline" 
                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                size="sm"
              >
                Sign In
              </Button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};
