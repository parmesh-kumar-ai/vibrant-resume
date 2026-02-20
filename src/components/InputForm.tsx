"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Upload, Link as LinkIcon, FileText, CheckCircle2, User, Plus, HardDrive } from "lucide-react";
import TemplateSelector from "./TemplateSelector";
import { ResumeTheme } from "@/lib/types";
import { isLinked as isDriveLinked } from "@/lib/gdrive";

interface InputFormProps {
    onSubmit: (data: { profile: string; jd: string; apiKey: string; theme: ResumeTheme }) => void;
    onScratchSubmit: () => void;
    isLoading: boolean;
}

type InputType = 'text' | 'file' | 'url';

export default function InputForm({ onSubmit, onScratchSubmit, isLoading }: InputFormProps) {
    const [profileType, setProfileType] = useState<InputType>('text');
    const [jdType, setJdType] = useState<InputType>('text');

    const [profileText, setProfileText] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem("vibrant-draft-profile") || "";
        return "";
    });
    const [jdText, setJdText] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem("vibrant-draft-jd") || "";
        return "";
    });
    const [apiKey, setApiKey] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("vibrant-groq-api-key") || "";
        }
        return "";
    });
    const [selectedTheme, setSelectedTheme] = useState<ResumeTheme>(() => {
        if (typeof window !== 'undefined') return (localStorage.getItem("vibrant-draft-theme") as ResumeTheme) || 'modern';
        return 'modern';
    });

    const [isParsingProfile, setIsParsingProfile] = useState(false);
    const [isParsingJd, setIsParsingJd] = useState(false);

    // Auto-save drafts
    useEffect(() => {
        localStorage.setItem("vibrant-draft-profile", profileText);
    }, [profileText]);

    useEffect(() => {
        localStorage.setItem("vibrant-draft-jd", jdText);
    }, [jdText]);

    useEffect(() => {
        localStorage.setItem("vibrant-draft-theme", selectedTheme);
    }, [selectedTheme]);

    // File Inputs Refs
    const profileFileRef = useRef<HTMLInputElement>(null);
    const jdFileRef = useRef<HTMLInputElement>(null);
    const profileUrlRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File, target: 'profile' | 'jd') => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            if (target === 'profile') setIsParsingProfile(true);
            else setIsParsingJd(true);

            const res = await fetch('/api/parse', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                if (target === 'profile') {
                    setProfileText(data.text);
                    setProfileType('text');
                } else {
                    setJdText(data.text);
                    setJdType('text');
                }
            } else {
                alert('Failed to parse file: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Error uploading file');
        } finally {
            if (target === 'profile') setIsParsingProfile(false);
            else setIsParsingJd(false);
        }
    };

    const handleUrlParse = async () => {
        const url = profileUrlRef.current?.value;
        if (!url) return;

        try {
            setIsParsingProfile(true);
            const res = await fetch('/api/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (data.success) {
                setProfileText(data.text);
                setProfileType('text');
            } else {
                alert('Failed to parse URL: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Error parsing URL');
        } finally {
            setIsParsingProfile(false);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileText || !jdText) return;
        // The server provides a default Groq API key if not provided here
        onSubmit({ profile: profileText, jd: jdText, apiKey, theme: selectedTheme });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Create New Resume</h1>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    AI Optimization Mode
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Column 1: Candidate Profile */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-lg font-semibold text-gray-900 mb-0">
                                1. Your Profile
                            </label>
                            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        try {
                                            const saved = localStorage.getItem("vibrant-user-profile");
                                            if (saved) {
                                                const p = JSON.parse(saved);
                                                const lines = [];
                                                if (p.name) lines.push(`# ${p.name}`);
                                                if (p.role) lines.push(`## ${p.role}`);

                                                const contact = [];
                                                if (p.email) contact.push(p.email);
                                                if (p.phone) contact.push(p.phone);
                                                if (p.location) contact.push(p.location);
                                                if (contact.length) lines.push(contact.join(" | "));

                                                const links = [];
                                                if (p.linkedin) links.push(`LinkedIn: ${p.linkedin}`);
                                                if (p.github) links.push(`GitHub: ${p.github}`);
                                                if (p.portfolio) links.push(`Portfolio: ${p.portfolio}`);
                                                if (links.length) lines.push(links.join(" • "));

                                                if (p.summary) {
                                                    lines.push("\n### Professional Summary");
                                                    lines.push(p.summary);
                                                }

                                                setProfileText(lines.join("\n"));
                                                setProfileType('text');
                                            } else {
                                                alert("No profile info found. Please save your information in Settings first.");
                                            }
                                        } catch { /**/ }
                                    }}
                                    className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-all flex items-center gap-1.5"
                                    title="Fetch from Profile Settings"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase">Use Profile</span>
                                </button>
                                <button type="button" onClick={() => setProfileType('text')} className={`p-1.5 rounded-md transition-all ${profileType === 'text' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><FileText className="w-4 h-4" /></button>
                                <button type="button" onClick={() => setProfileType('file')} className={`p-1.5 rounded-md transition-all ${profileType === 'file' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><Upload className="w-4 h-4" /></button>
                                <button type="button" onClick={() => setProfileType('url')} className={`p-1.5 rounded-md transition-all ${profileType === 'url' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><LinkIcon className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-1 border border-dashed border-gray-300 relative group flex-1 min-h-[250px]">
                            {isParsingProfile && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 rounded-lg backdrop-blur-sm">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                                    <span className="text-xs text-gray-500">Extracting text...</span>
                                </div>
                            )}

                            {profileType === 'text' && (
                                <textarea
                                    id="profile"
                                    value={profileText}
                                    onChange={(e) => setProfileText(e.target.value)}
                                    className="w-full h-full bg-transparent border-none focus:ring-0 p-4 resize-none text-base text-gray-700 leading-relaxed placeholder:text-gray-400"
                                    placeholder="Paste your full resume or professional bio here..."
                                    required={profileType === 'text'}
                                />
                            )}

                            {profileType === 'file' && (
                                <div className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-100 transition-colors rounded-lg" onClick={() => profileFileRef.current?.click()}>
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-500">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-base font-medium text-gray-700 mb-1">Upload Resume</p>
                                    <span className="text-sm text-gray-400">PDF or DOCX</span>
                                    <input
                                        type="file"
                                        ref={profileFileRef}
                                        className="hidden"
                                        accept=".pdf,.docx,.doc"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'profile');
                                        }}
                                    />
                                </div>
                            )}

                            {profileType === 'url' && (
                                <div className="flex flex-col items-center justify-center h-full p-6 space-y-4">
                                    <div className="w-full">
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Portfolio / LinkedIn URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                ref={profileUrlRef}
                                                type="url"
                                                placeholder="https://linkedin.com/in/..."
                                                className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleUrlParse}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-sm whitespace-nowrap"
                                            >
                                                Import
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Job Description */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-lg font-semibold text-gray-900 mb-0">
                                2. Job Description
                            </label>
                            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                                <button type="button" onClick={() => setJdType('text')} className={`p-1.5 rounded-md transition-all ${jdType === 'text' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><FileText className="w-4 h-4" /></button>
                                <button type="button" onClick={() => setJdType('file')} className={`p-1.5 rounded-md transition-all ${jdType === 'file' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><Upload className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-1 border border-dashed border-gray-300 relative group flex-1 min-h-[400px]">
                            {isParsingJd && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 rounded-lg backdrop-blur-sm">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                                    <span className="text-xs text-gray-500">Extracting text...</span>
                                </div>
                            )}

                            {jdType === 'text' && (
                                <textarea
                                    id="jd"
                                    value={jdText}
                                    onChange={(e) => setJdText(e.target.value)}
                                    className="w-full h-full bg-transparent border-none focus:ring-0 p-4 resize-none text-base text-gray-700 leading-relaxed placeholder:text-gray-400"
                                    placeholder="Paste the complete job description here..."
                                    required={jdType === 'text'}
                                />
                            )}

                            {jdType === 'file' && (
                                <div className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-100 transition-colors rounded-lg" onClick={() => jdFileRef.current?.click()}>
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-500">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-base font-medium text-gray-700 mb-1">Upload JD</p>
                                    <span className="text-sm text-gray-400">PDF, DOCX or TXT</span>
                                    <input
                                        type="file"
                                        ref={jdFileRef}
                                        className="hidden"
                                        accept=".pdf,.docx,.doc,.txt"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'jd');
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Templates */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                        <label className="text-lg font-semibold text-gray-900 mb-4 block">
                            3. Template
                        </label>
                        <div className="flex-1 flex flex-col">
                            <TemplateSelector currentTheme={selectedTheme} onSelect={setSelectedTheme} vertical={true} />
                        </div>
                    </div>
                </div>

                {/* Row 2: Action Hub (Green Box) */}
                <div className="mt-8 overflow-hidden bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 shadow-sm p-1">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 md:p-6 bg-white/40 backdrop-blur-sm rounded-xl">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-emerald-900 mb-1 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-emerald-600" />
                                Ready to build your resume?
                            </h3>
                            <p className="text-sm text-emerald-700/70 font-medium">Choose an optimization mode or start from a blank professional template.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={onScratchSubmit}
                                disabled={isLoading}
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white text-emerald-700 border-2 border-emerald-100 hover:bg-emerald-50 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                                Create from Scratch
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading || !profileText || !jdText}
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        <span>Generate Optimized Resume</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Note: AI optimization uses a system-wide API key by default */}
                </div>
            </form>
        </motion.div>
    );
}
