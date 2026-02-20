"use client";

import React from 'react';
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    // Handle loading state to avoid layout shift
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-gray-500 animate-pulse uppercase tracking-[0.2em]">Restoring Session...</p>
                </div>
            </div>
        );
    }

    const isAuth = !!user;

    return (
        <div className="flex min-h-screen">
            {isAuth && <Sidebar />}
            <main className={`flex-1 min-h-screen transition-all duration-300 ${isAuth ? 'ml-64 p-8' : 'ml-0 p-0'}`}>
                {children}
            </main>
        </div>
    );
}
