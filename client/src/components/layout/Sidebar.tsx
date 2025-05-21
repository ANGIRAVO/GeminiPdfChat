import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/supabase";
import { getInitials } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

interface Chat {
  id: number;
  title: string;
  createdAt: string;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const [location] = useLocation();
  
  // Fetch user's chats
  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ['/api/chats'],
    enabled: !!user,
  });

  return (
    <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
      <div className="flex flex-col h-0 flex-1">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
          <div className="flex-1 flex items-center">
            <svg className="h-8 w-auto text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3H3V9H9V3Z" fill="currentColor" />
              <path d="M21 3H15V9H21V3Z" fill="currentColor" />
              <path d="M21 15H15V21H21V15Z" fill="currentColor" />
              <path d="M9 15H3V21H9V15Z" fill="currentColor" />
              <path d="M12 3L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h1 className="ml-2 text-xl font-semibold text-gray-900">PDF Chatbot</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="px-4 pt-4">
            <Link href="/">
              <Button 
                className="w-full flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Chat
              </Button>
            </Link>
          </div>
          <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
            {chats.map((chat) => (
              <Link 
                key={chat.id} 
                href={`/chat/${chat.id}`}
              >
                <a className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  location === `/chat/${chat.id}` 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  <svg className="mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {chat.title}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* User Profile Section */}
        {user && (
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-700">
                    <span className="text-sm font-medium leading-none">{getInitials(user.name)}</span>
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user.name}
                  </p>
                  <div className="flex items-center">
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 truncate">
                      {user.email}
                    </p>
                    <button 
                      type="button" 
                      className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={onLogout}
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
