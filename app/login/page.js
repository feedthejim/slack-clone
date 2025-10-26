import { redirect } from 'next/navigation';
import { setAuthCookie } from '../auth';

async function loginAction() {
  'use server';
  
  await setAuthCookie();
  redirect('/channel/1');
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-black mb-8">Chat</h1>
          <p className="text-gray-600 mb-8">Demo authentication - click to sign in</p>
          
          <form action={loginAction}>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-6 border border-black rounded-md text-lg font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black transition-colors"
            >
              Sign in to Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}