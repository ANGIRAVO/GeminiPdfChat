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
      <DialogContent className="sm:max-w-lg" aria-describedby="auth-description">
        <div id="auth-description" className="sr-only">
          Authentication form for the PDF Chatbot application. Sign in or register to continue.
        </div>
        {isLoginView ? (
          <LoginForm onSuccess={onSuccess} onToggleView={toggleView} />
        ) : (
          <RegisterForm onSuccess={onSuccess} onToggleView={toggleView} />
        )}
      </DialogContent>
    </Dialog>
  );
}
