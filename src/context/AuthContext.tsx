"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchGoogleUserProfile, requestAccessToken } from '@/lib/gdrive';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
}

export type AuthTab = 'login' | 'register';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (method: 'google' | 'email', credentials?: any) => Promise<void>;
    register: (credentials: { name: string, email: string, phone?: string }) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    deleteAccount: () => void;
    openAuthModal: (tab?: AuthTab) => void;
    closeAuthModal: () => void;
}

import AuthModal from '@/components/AuthModal';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState<AuthTab>('login');

    useEffect(() => {
        // Load user from localStorage
        const savedUser = localStorage.getItem('vibrant-auth-user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (method: 'google' | 'email', credentials?: any) => {
        setIsLoading(true);
        // Mock login delay
        await new Promise(resolve => setTimeout(resolve, 800));

        let name = credentials?.name;
        let email = credentials?.email;

        // Persistent User Registry
        const registeredUsers: any[] = JSON.parse(localStorage.getItem('vibrant-registered-users') || '[]');

        if (method === 'google') {
            try {
                const token = await requestAccessToken();
                const profile = await fetchGoogleUserProfile(token);
                name = profile.name;
                email = profile.email;

                // Auto-register Google users if they don't exist
                let existingUser = registeredUsers.find(u => u.email === email);
                if (!existingUser) {
                    existingUser = {
                        id: 'user_google_' + Math.random().toString(36).substr(2, 9),
                        name, email, phone: '', avatar: profile.picture
                    };
                    registeredUsers.push(existingUser);
                    localStorage.setItem('vibrant-registered-users', JSON.stringify(registeredUsers));
                }

                setUser(existingUser);
                localStorage.setItem('vibrant-auth-user', JSON.stringify(existingUser));
                setIsLoading(false);
                return;
            } catch (err) {
                setIsLoading(false);
                throw err;
            }
        }

        // Email Login: Verify Account Exists
        const userFound = registeredUsers.find(u => u.email === email);
        if (!userFound) {
            setIsLoading(false);
            throw new Error("Account not found. Please register first.");
        }

        setUser(userFound);
        localStorage.setItem('vibrant-auth-user', JSON.stringify(userFound));
        setIsLoading(false);
    };

    const register = async (credentials: { name: string, email: string, phone?: string }) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const registeredUsers: any[] = JSON.parse(localStorage.getItem('vibrant-registered-users') || '[]');

        if (registeredUsers.some(u => u.email === credentials.email)) {
            setIsLoading(false);
            throw new Error("Email already registered. Please sign in.");
        }

        const newUser: User = {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            name: credentials.name,
            email: credentials.email,
            phone: credentials.phone || '',
        };

        registeredUsers.push(newUser);
        localStorage.setItem('vibrant-registered-users', JSON.stringify(registeredUsers));

        setUser(newUser);
        localStorage.setItem('vibrant-auth-user', JSON.stringify(newUser));
        setIsLoading(false);
    };

    const clearAllLocalStorageData = () => {
        if (typeof window === 'undefined') return;

        // Find all keys starting with 'vibrant-' and remove them
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // DO NOT remove the registered users registry or the gdrive token
            if (key?.startsWith('vibrant-') &&
                key !== 'vibrant-registered-users' &&
                key !== 'vibrant-gdrive-token') {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
    };

    const logout = () => {
        setUser(null);
        clearAllLocalStorageData();
        // Force a reload to clear all states and triggers home screen redirect
        window.location.href = '/';
    };

    const updateUser = (data: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('vibrant-auth-user', JSON.stringify(updatedUser));
    };

    const deleteAccount = () => {
        if (!user) return;

        // Remove from persistent registry
        const registeredUsers: any[] = JSON.parse(localStorage.getItem('vibrant-registered-users') || '[]');
        const updatedRegistry = registeredUsers.filter(u => u.email !== user.email);
        localStorage.setItem('vibrant-registered-users', JSON.stringify(updatedRegistry));

        clearAllLocalStorageData();
        setUser(null);
        window.location.href = '/';
    };

    const openAuthModal = (tab: AuthTab = 'login') => {
        setAuthModalTab(tab);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    return (
        <AuthContext.Provider value={{
            user, isLoading, login, register, logout, updateUser, deleteAccount,
            openAuthModal, closeAuthModal
        }}>
            {children}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                initialTab={authModalTab}
            />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
