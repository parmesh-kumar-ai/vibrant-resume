"use client";

import { useState } from "react";
import { X, Cloud, Save, AlertCircle, CheckCircle2, Loader2, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadToDrive, requestAccessToken } from "@/lib/gdrive";

interface BackupModalProps {
    isOpen: boolean;
    onClose: () => void;
    resumeName: string;
    resumeContent?: string;
    onBackup: (newName: string) => Promise<void>;
}

export default function BackupModal({ isOpen, onClose, resumeName, onBackup }: BackupModalProps) {
    const [name, setName] = useState(resumeName);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleBackup = async () => {
        setStatus('loading');
        try {
            await onBackup(name);
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
            }, 2000);
        } catch {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                    <Cloud className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Cloud Backup</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-blue-200">
                                    <Globe className="w-8 h-8 text-blue-500 animate-pulse" />
                                </div>
                                <p className="text-gray-500 text-sm font-medium">Save your resume to Google Drive to access it anywhere.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Resume Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Senior Software Engineer Resume"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50"
                                />
                            </div>

                            <button
                                onClick={handleBackup}
                                disabled={status === 'loading' || status === 'success'}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${status === 'success' ? 'bg-green-500 text-white shadow-green-100' :
                                    status === 'error' ? 'bg-red-500 text-white' :
                                        'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
                                    }`}
                            >
                                {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                                {status === 'success' && <CheckCircle2 className="w-5 h-5" />}
                                {status === 'error' && <AlertCircle className="w-5 h-5" />}
                                {status === 'idle' ? "Backup to Google Drive" :
                                    status === 'loading' ? "Syncing..." :
                                        status === 'success' ? "Saved to Cloud!" : "Failed to Sync"}
                            </button>
                        </div>

                        <div className="px-8 pb-8 flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Google Drive API Integrated</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
