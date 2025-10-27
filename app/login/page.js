"use client";

import { useTransition } from "react";
import { loginAction } from "../actions";

function LoginButton() {
  const [isLoading, startTransition] = useTransition();

  return (
    <form action={() => startTransition(loginAction)}>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-6 border border-black rounded-md text-lg font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Signing in..." : "Sign in to Workspace"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-black mb-8">Chat</h1>
          <p className="text-gray-600 mb-8">
            Demo authentication - click to sign in
          </p>

          <LoginButton />
        </div>
      </div>
    </div>
  );
}
