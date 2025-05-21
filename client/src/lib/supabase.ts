import { apiRequest } from "@/lib/queryClient";

export type User = {
  id: number;
  name: string;
  email: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
};

// User authentication functions
export async function loginUser(credentials: LoginCredentials): Promise<User> {
  const response = await apiRequest('POST', '/api/auth/login', credentials);
  return response.json();
}

export async function registerUser(credentials: RegisterCredentials): Promise<User> {
  const response = await apiRequest('POST', '/api/auth/register', credentials);
  return response.json();
}

export async function logoutUser(): Promise<void> {
  await apiRequest('POST', '/api/auth/logout', {});
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/user', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}
