import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { User } from "@/lib/supabase";
import { getCurrentUser, logoutUser } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>
      
      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileSidebar}></div>
          <div className="relative flex flex-col w-full max-w-xs bg-white h-full">
            <Sidebar user={user} onLogout={handleLogout} />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex items-center justify-between border-b border-gray-200 bg-white">
          <button 
            type="button" 
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
            onClick={toggleMobileSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center">
            <svg className="h-8 w-auto text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3H3V9H9V3Z" fill="currentColor" />
              <path d="M21 3H15V9H21V3Z" fill="currentColor" />
              <path d="M21 15H15V21H21V15Z" fill="currentColor" />
              <path d="M9 15H3V21H9V15Z" fill="currentColor" />
              <path d="M12 3L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h1 className="ml-2 text-xl font-semibold text-gray-900">PDF Chatbot</h1>
          </div>
          <div className="h-12 w-12"></div>
        </div>
        
        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
