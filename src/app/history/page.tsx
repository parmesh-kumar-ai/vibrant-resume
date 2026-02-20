"use client";

import { useState, useEffect } from "react";
import { History, Clock, FileText, Trash2, RotateCcw, ChevronRight, Search, Calendar, Hash, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HistoryItem } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

export default function HistoryPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [search, setSearch] = useState("");
    const router = useRouter();

    if (!user) return <LoginRequired title="Resume Archive" message="Your saved resumes and optimization history are stored securely in the cloud. Sign in to retrieve your work." icon={History} />;

    const loadHistory = () => {
        try {
            const data = JSON.parse(localStorage.getItem("vibrant-resume-history") || "[]");
            setHistory(data);
        } catch { /**/ }
    };

    useEffect(() => {
        loadHistory();
        window.addEventListener('vibrant-history-updated', loadHistory);
        return () => window.removeEventListener('vibrant-history-updated', loadHistory);
    }, []);

    const handleRestore = (item: HistoryItem) => {
        if (!confirm(`Are you sure you want to restore the version from ${new Date(item.timestamp).toLocaleString()}? This will overwrite your current draft.`)) return;

        const saveObj = {
            sections: item.sections,
            contactInfo: item.contactInfo,
            contactAlignment: item.contactAlignment,
            pageTarget: item.pageTarget,
            globalFont: item.globalFont,
            theme: item.theme,
            savedAt: new Date().toISOString()
        };

        localStorage.setItem("vibrant-resume-saved", JSON.stringify(saveObj));
        // Redirect to dashboard
        router.push("/");
    };

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this history record?")) return;
        const newHistory = history.filter(h => h.id !== id);
        localStorage.setItem("vibrant-resume-history", JSON.stringify(newHistory));
        setHistory(newHistory);
        window.dispatchEvent(new CustomEvent('vibrant-history-updated'));
    };

    const handleClearAll = () => {
        if (!confirm("Are you sure you want to clear ALL history? This cannot be undone.")) return;
        localStorage.removeItem("vibrant-resume-history");
        setHistory([]);
        window.dispatchEvent(new CustomEvent('vibrant-history-updated'));
    };

    const filtered = history.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        new Date(h.timestamp).toLocaleString().toLowerCase().includes(search.toLowerCase())
    );

    return (
        <section className="min-h-screen">
            <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <History className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Resume Archive</h1>
                            <p className="text-gray-500 font-medium">Manage and restore your previously optimized versions</p>
                        </div>
                    </div>

                    {history.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All History
                        </button>
                    )}
                </div>

                {/* Search & Stats Bar */}
                {history.length > 0 && (
                    <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm mb-8 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or date..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-bold text-gray-700">{history.length}</span>
                                <span className="text-xs text-gray-400 font-medium lowercase tracking-wide">Total</span>
                            </div>
                            <div className="w-px h-6 bg-gray-200" />
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs text-gray-500 font-medium">Last saved {new Date(history[0]?.timestamp).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* List Section */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((item) => (
                            <div
                                key={item.id}
                                className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                                        <FileText className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <button
                                            onClick={() => handleRestore(item)}
                                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            title="Restore this version"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            title="Delete record"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate mb-1">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">
                                            {new Date(item.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${['Executive', 'Modern', 'Elegant'].includes(item.theme) ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            }`}>
                                            {item.theme}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 tracking-tight">
                                            {item.sections.length} Sections
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRestore(item)}
                                        className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
                                    >
                                        Restore <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-gray-200 border-dashed p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                            <Clock className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">{search ? "No matches found" : "No history records yet"}</h3>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8 leading-relaxed">
                            {search
                                ? "We couldn't find any saved resumes matching your search. Try a different term or clear the filter."
                                : "Every time you save your optimized resume, a record of that version will appear here automatically for you to manage."}
                        </p>
                        {!search && (
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2.5 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all hover:-translate-y-0.5"
                            >
                                <Sparkles className="w-5 h-5 rotate-12" />
                                Create Your First Save
                            </Link>
                        )}
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                View all records
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

function LoginRequired({ title, message, icon: Icon }: { title: string; message: string; icon: any }) {
    const { openAuthModal } = useAuth();
    return (
        <div className="min-h-screen flex items-center justify-center -mt-20 px-4">
            <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
                <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-50">
                    <Icon className="w-10 h-10" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
                    <p className="text-gray-500 font-medium leading-relaxed">{message}</p>
                </div>
                <div className="flex flex-col gap-3 pt-4">
                    <button onClick={() => openAuthModal('login')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer">
                        <Sparkles className="w-5 h-5" /> Sign In to Access
                    </button>
                    <Link href="/" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
