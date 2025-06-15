"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface TrpcProviderProps {
  children: React.ReactNode;
  url?: string; // Keep for compatibility but not used yet
}

const queryClient = new QueryClient();

export default function TrpcProvider({ children }: TrpcProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
