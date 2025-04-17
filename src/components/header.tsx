import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="border-b border-blue-100 bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <h1 className="text-xl font-bold text-blue-700 hover:text-blue-800 transition-colors cursor-pointer">
              Talent Trail
            </h1>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <SignedIn>
            <div className="flex items-center gap-4">
              <Link to="/generate">
                <Button variant="ghost" className="text-blue-700 hover:text-blue-800 hover:bg-blue-50">
                  Dashboard
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};
