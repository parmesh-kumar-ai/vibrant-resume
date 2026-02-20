"use client";

import { useState, useEffect } from 'react';
import {
    FileText, LayoutDashboard, Settings, UserCircle, History,
    Sparkles, Clock, ChevronRight, Trash2, LogIn, LogOut, User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HistoryItem } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout, deleteAccount } = useAuth();
    const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);

    const loadHistory = () => {
        try {
            const history = JSON.parse(localStorage.getItem('vibrant-resume-history') || '[]');
            setRecentHistory(history.slice(0, 5));
        } catch { /**/ }
    };

    useEffect(() => {
        loadHistory();
        window.addEventListener('vibrant-history-updated', loadHistory);
        return () => window.removeEventListener('vibrant-history-updated', loadHistory);
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
        { id: 'history', label: 'History', icon: History, href: '/history' },
        { id: 'templates', label: 'Templates', icon: FileText, href: '/templates' },
        { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    ];

    const handleDeleteInformation = () => {
        if (confirm("Are you sure you want to delete all your saved personal information? This will reset your profile and history.")) {
            deleteAccount();
        }
    };

    return (
        <div className="w-64 bg-white flex flex-col fixed h-full z-10 border-r border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 m-0 no-underline">
                    <Sparkles className="w-6 h-6" />
                    <span>Vibrant Resume</span>
                </Link>
            </div>

            <nav className="p-4 flex flex-col gap-2 overflow-y-auto flex-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">Menu</div>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const isLocked = !user && item.id !== 'dashboard';

                    if (isLocked) {
                        return (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 rounded-lg font-medium text-gray-300 cursor-not-allowed opacity-50"
                                title="Sign in to access"
                            >
                                <Icon size={18} />
                                <span className="text-sm">{item.label}</span>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-200 w-full text-left no-underline ${isActive
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-700'
                                }`}
                        >
                            <Icon size={18} />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}

                {user && recentHistory.length > 0 && (
                    <>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mt-6 mb-2 flex justify-between items-center">
                            <span>Recent History</span>
                            <Link href="/history" className="hover:text-blue-600 transition-colors capitalize underline-offset-4 decoration-current decoration-1 cursor-pointer no-underline">View All</Link>
                        </div>
                        <div className="space-y-1">
                            {recentHistory.map((item) => (
                                <Link
                                    key={item.id}
                                    href="/history"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all no-underline group"
                                >
                                    <Clock size={12} className="text-gray-400 group-hover:text-blue-500" />
                                    <div className="flex-1 truncate">
                                        <p className="truncate font-medium">{item.name}</p>
                                        <p className="text-[9px] text-gray-400">{new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                    <ChevronRight size={10} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                    </>
                )}

            </nav>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                {user ? (
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <UserCircle size={24} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button onClick={logout} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" title="Log Out">
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <Link href="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all no-underline group">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                            <LogIn size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Sign In</p>
                            <p className="text-xs text-gray-500">Enable Cloud Backup</p>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
}
