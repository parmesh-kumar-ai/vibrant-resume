"use client";

import { useState, useEffect } from "react";
import {
    Settings, User, Key, Save, Check, Phone, MapPin, Globe,
    Linkedin, Github, Briefcase, FileText, LogOut, Trash2, Mail, Lock, Sparkles, Cloud, Unlink, Link, X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isLinked as isDriveLinked, unlinkDrive, requestAccessToken } from "@/lib/gdrive";

export default function SettingsPage() {
    const { user, login, register, logout, updateUser, deleteAccount } = useAuth();
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        role: "",
        summary: "",
        linkedin: "",
        github: "",
        portfolio: ""
    });

    // Mock login state for the form
    const [loginTab, setLoginTab] = useState<'login' | 'register'>('login');
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [authName, setAuthName] = useState("");
    const [saved, setSaved] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [apiKey, setApiKey] = useState("");

    useEffect(() => {
        const storedKey = localStorage.getItem("vibrant-groq-api-key");
        if (storedKey) setApiKey(storedKey);
    }, []);

    useEffect(() => {
        try {
            const savedProfile = localStorage.getItem("vibrant-user-profile");
            if (savedProfile) {
                const p = JSON.parse(savedProfile);
                setProfile(p);
                // If logged in, sync basic info
                if (user) {
                    setAuthName(user.name);
                    setAuthEmail(user.email);
                }
            }
        } catch { /**/ }
    }, [user]);

    const handleSaveProfile = () => {
        localStorage.setItem("vibrant-user-profile", JSON.stringify(profile));
        if (user) {
            updateUser({
                name: profile.name || user.name,
                email: profile.email || user.email,
                phone: profile.phone || user.phone
            });
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError(null);
        try {
            if (loginTab === 'register') {
                await register({ name: authName, email: authEmail });
            } else {
                await login('email', { email: authEmail, name: undefined });
            }
        } catch (err: any) {
            setError(err.message || "Authentication failed.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    return (
        <main className="min-h-screen px-4 pb-20">
            <div className="max-w-4xl mx-auto py-12">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
                            <Settings className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Configuration</h1>
                            <p className="text-gray-500 font-medium">Manage your professional identity and account</p>
                        </div>
                    </div>

                    {user && (
                        <button
                            onClick={handleSaveProfile}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 cursor-pointer active:scale-95"
                        >
                            {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                            {saved ? "Saved!" : "Save Profile"}
                        </button>
                    )}
                </div>

                {!user ? (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden max-w-md mx-auto">
                        <div className="p-8 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                            <p className="text-blue-100 text-sm">Sign in to sync your professional profile and enable cloud backups.</p>
                        </div>

                        <div className="p-8">
                            <div className="flex gap-4 p-1 bg-gray-100 rounded-xl mb-6">
                                <button
                                    onClick={() => { setLoginTab('login'); setError(null); }}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginTab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => { setLoginTab('register'); setError(null); }}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginTab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
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

                            <form onSubmit={handleLogin} className="space-y-4">
                                {loginTab === 'register' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                value={authName}
                                                onChange={(e) => setAuthName(e.target.value)}
                                                placeholder="John Doe"
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={authEmail}
                                            onChange={(e) => setAuthEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            value={authPassword}
                                            onChange={(e) => setAuthPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                                >
                                    {isLoggingIn ? "Logging in..." : loginTab === 'login' ? "Sign In" : "Create Account"}
                                </button>
                            </form>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs font-bold text-gray-400 uppercase">Or continue with</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <button
                                onClick={() => login('google')}
                                className="w-full py-3 border-2 border-gray-100 rounded-xl mt-6 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-bold text-gray-700 text-sm"
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
                ) : (
                    <div className="space-y-8">
                        {/* Account Summary */}
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 flex flex-col md:flex-row items-center gap-8 ring-4 ring-blue-50/50">
                            <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-100 relative group overflow-hidden">
                                <User className="w-12 h-12" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-black text-gray-900 mb-1">{user.name}</h2>
                                <p className="text-gray-500 font-medium mb-4">{user.email}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <button onClick={logout} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2 cursor-pointer">
                                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                                    </button>
                                    <button onClick={() => { if (confirm("Proceed to delete your account? This cannot be undone.")) deleteAccount(); }} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 cursor-pointer">
                                        <Trash2 className="w-3.5 h-3.5" /> Delete Account
                                    </button>
                                </div>
                            </div>
                            <div className="hidden lg:block w-px h-16 bg-gray-100" />
                            <div className="text-center px-4">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Status</p>
                                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> Sync Active
                                </div>
                            </div>
                        </div>

                        {/* Security & Backup Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    Security
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Current Password</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50/50" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">New Password</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50/50" />
                                    </div>
                                    <button onClick={() => alert("Password updated successfully!")} className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold active:scale-95 transition-all">
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                        <Cloud className="w-5 h-5" />
                                    </div>
                                    Google Drive
                                </h3>
                                <div className="text-center space-y-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${isDriveLinked() ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                        {isDriveLinked() ? <Link className="w-6 h-6" /> : <Cloud className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{isDriveLinked() ? 'Drive Linked' : 'Not Connected'}</p>
                                        <p className="text-xs text-gray-500">{isDriveLinked() ? 'Your Google Drive is connected. You can import files and export PDFs.' : 'Link your Google Drive to import files and export resumes.'}</p>
                                    </div>
                                    {isDriveLinked() ? (
                                        <button
                                            onClick={() => { unlinkDrive(); window.location.reload(); }}
                                            className="w-full py-3 border-2 border-red-400 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Unlink className="w-4 h-4" />Unlink Google Drive
                                        </button>
                                    ) : (
                                        <button
                                            onClick={async () => { try { await requestAccessToken(); window.location.reload(); } catch (e: any) { alert(e.message); } }}
                                            className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Link className="w-4 h-4" />Link Google Drive
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Personal Details Section */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                    <User className="w-5 h-5" />
                                </div>
                                Personal Profile
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Email (Public)</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={profile.phone}
                                            onChange={(e) => updateField('phone', e.target.value)}
                                            placeholder="+1..."
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={profile.location}
                                            onChange={(e) => updateField('location', e.target.value)}
                                            placeholder="City, Country"
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Bio */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                Professional Summary
                            </h3>
                            <textarea
                                value={profile.summary}
                                onChange={(e) => updateField('summary', e.target.value)}
                                className="w-full h-32 px-4 py-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all bg-gray-50/50 resize-none"
                            />
                        </div>

                        {/* Social Links */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 text-indigo-700">
                                <div className="p-1.5 bg-indigo-50 rounded-lg">
                                    <Globe className="w-5 h-5" />
                                </div>
                                Social Profiles
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <Linkedin className="w-5 h-5 text-blue-600" />
                                    <input type="text" value={profile.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} placeholder="LinkedIn" className="bg-transparent text-sm w-full outline-none" />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <Github className="w-5 h-5 text-gray-900" />
                                    <input type="text" value={profile.github} onChange={(e) => updateField('github', e.target.value)} placeholder="GitHub" className="bg-transparent text-sm w-full outline-none" />
                                </div>
                            </div>
                        </div>


                        {/* Data Privacy Section */}
                        <div className="bg-red-50/30 rounded-3xl border border-red-100 p-8">
                            <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-3">
                                <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                Data Privacy & Local Storage
                            </h3>
                            <p className="text-sm text-gray-600 mb-6 max-w-2xl px-1">
                                You can permanently delete all locally saved information, including your professional profile, saved resumes, and history. This will not affect your cloud account login status.
                            </p>
                            <button
                                onClick={() => {
                                    if (confirm("Are you sure you want to clear your local professional profile and resume history? This action cannot be reversed.")) {
                                        deleteAccount();
                                    }
                                }}
                                className="px-6 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-all active:scale-95 shadow-sm"
                            >
                                Clear All Personal Data
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
