import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onSuccess }: AuthModalProps) {
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleView = () => {
    setIsLoginView(!isLoginView);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-lg">
        <h2 className="text-lg font-semibold mb-4">
          {isLoginView ? "Sign In" : "Create an Account"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {isLoginView 
            ? "Sign in to your account to continue" 
            : "Create a new account to get started"}
        </p>
        {isLoginView ? (
          <LoginForm onSuccess={onSuccess} onToggleView={toggleView} />
        ) : (
          <RegisterForm onSuccess={onSuccess} onToggleView={toggleView} />
        )}
      </DialogContent>
    </Dialog>
  );
}
