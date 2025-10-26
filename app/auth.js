import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const AUTH_COOKIE = 'slack-auth-token';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE);
  
  if (!authToken) {
    return null;
  }

  // In a real app, you'd validate the token
  // For now, we'll just return a mock user if token exists
  return {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

export async function setAuthCookie() {
  const cookieStore = await cookies();
  
  // Set a simple auth cookie (in real app, this would be a JWT or session token)
  cookieStore.set(AUTH_COOKIE, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}