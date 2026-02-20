"use client";

import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, Sparkles, Github } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
    const { login, register } = useAuth();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (activeTab === 'register') {
                await register({ name, email });
            } else {
                await login('email', { email, name: undefined });
            }
            onClose();
        } catch (error: any) {
            setError(error.message || "Authentication failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await login('google');
            onClose();
        } catch (error: any) {
            setError(error.message || "Google login failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (tab: 'login' | 'register') => {
        setActiveTab(tab);
        setError(null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="relative p-8 pt-10 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 tracking-tight">
                        {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-blue-100/80 text-sm font-medium">
                        {activeTab === 'login' ? 'Sign in to access your resumes' : 'Join us to optimize your career path'}
                    </p>
                </div>

                <div className="p-8">
                    <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-6">
                        <button
                            onClick={() => handleTabChange('login')}
                            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => handleTabChange('register')}
                            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Register
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl animate-shake">
                            <p className="text-xs font-bold text-red-600 flex items-center gap-2">
                                <X className="w-4 h-4" />
                                {error}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {activeTab === 'register' && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-100 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-100 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-100 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isLoading ? "Processing..." : activeTab === 'login' ? "Sign In" : "Create Account"}
                            {!isLoading && <LogIn className="w-4 h-4" />}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Social Connect</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full py-3.5 border-2 border-gray-100 rounded-2xl mt-6 flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-200 transition-all font-bold text-gray-700 text-sm active:scale-95 cursor-pointer"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12 5.04c1.94 0 3.68.67 5.05 1.97l3.77-3.77C18.44 1.24 15.42 0 12 0 7.31 0 3.25 2.68 1.21 6.6l4.41 3.42c1.07-3.21 4.09-5.98 6.38-5.98z" />
                            <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.17-2.01 3.71-4.97 3.71-8.7z" />
                            <path fill="#FBBC05" d="M5.62 14.39c-.24-.72-.37-1.49-.37-2.29s.13-1.57.37-2.29L1.21 6.6C.44 8.17 0 9.91 0 12s.44 3.83 1.21 5.4l4.41-3.41z" />
                            <path fill="#34A853" d="M12 18.96c-1.94 0-3.68-.67-5.05-1.97l-3.77 3.77c2.38 2.03 5.39 3.24 8.81 3.24 4.69 0 8.75-2.68 10.79-6.6l-4.41-3.42c-1.07 3.21-4.09 5.98-6.38 5.98z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
