"use client";

import { useGlobalMessageInjection } from "./hooks";

// Client component to start message injection
export function MessageInjectionStarter() {
  // Start global message injection
  useGlobalMessageInjection(true);
  
  return null; // This component doesn't render anything
}