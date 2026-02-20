"use client";

import { useState, useEffect } from "react";
import { ResumeTheme, CustomTemplate } from "@/lib/types";
import { Layout, FileText, AlignCenter, Briefcase, Palette, Code, Sparkles, Building2, Type, PenTool, Save, Trash2 } from "lucide-react";

interface TemplateSelectorProps {
    currentTheme: ResumeTheme;
    onSelect: (theme: ResumeTheme) => void;
    vertical?: boolean;
}

const templates: { id: ResumeTheme; name: string; icon: React.ReactNode; desc: string; thumbBg: string; thumbAccent: string }[] = [
    { id: 'modern', name: 'Modern', icon: <Layout className="w-5 h-5" />, desc: 'Clean, accent colors, sans-serif.', thumbBg: 'bg-white', thumbAccent: 'bg-blue-500' },
    { id: 'classic', name: 'Classic', icon: <FileText className="w-5 h-5" />, desc: 'Traditional serif layout.', thumbBg: 'bg-white', thumbAccent: 'bg-slate-700' },
    { id: 'minimal', name: 'Minimal', icon: <AlignCenter className="w-5 h-5" />, desc: 'High whitespace, clean.', thumbBg: 'bg-white', thumbAccent: 'bg-gray-400' },
    { id: 'executive', name: 'Executive', icon: <Briefcase className="w-5 h-5" />, desc: 'Bold, corporate, leadership.', thumbBg: 'bg-white', thumbAccent: 'bg-blue-800' },
    { id: 'creative', name: 'Creative', icon: <Palette className="w-5 h-5" />, desc: 'Colorful, expressive design.', thumbBg: 'bg-white', thumbAccent: 'bg-violet-500' },
    { id: 'tech', name: 'Tech', icon: <Code className="w-5 h-5" />, desc: 'Developer-focused, monospace.', thumbBg: 'bg-slate-900', thumbAccent: 'bg-green-500' },
    { id: 'elegant', name: 'Elegant', icon: <Sparkles className="w-5 h-5" />, desc: 'Refined, sophisticated style.', thumbBg: 'bg-stone-100', thumbAccent: 'bg-amber-600' },
    { id: 'corporate', name: 'Corporate', icon: <Building2 className="w-5 h-5" />, desc: 'Structured two-tone professional.', thumbBg: 'bg-white', thumbAccent: 'bg-indigo-700' },
    { id: 'bold', name: 'Bold', icon: <Type className="w-5 h-5" />, desc: 'Strong typography, dark header.', thumbBg: 'bg-gray-900', thumbAccent: 'bg-orange-500' },
];

function TemplateThumbnail({ thumbBg, thumbAccent }: { thumbBg: string; thumbAccent: string }) {
    return (
        <div className={`w-full h-16 rounded-md ${thumbBg} border border-gray-200 p-2 flex flex-col gap-1 overflow-hidden shrink-0`}>
            <div className={`h-2 w-3/4 rounded-sm ${thumbAccent}`} />
            <div className="flex gap-1 flex-1">
                <div className="flex-1 flex flex-col gap-0.5">
                    <div className="h-1 w-full rounded-sm bg-gray-200" />
                    <div className="h-1 w-4/5 rounded-sm bg-gray-200" />
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                    <div className={`h-1 w-1/2 rounded-sm ${thumbAccent} opacity-40`} />
                    <div className="h-1 w-full rounded-sm bg-gray-200" />
                </div>
            </div>
        </div>
    );
}

function CustomThumbnail({ template }: { template: CustomTemplate }) {
    return (
        <div className="w-full h-16 rounded-md border border-gray-200 p-2 flex flex-col gap-1 overflow-hidden relative shrink-0" style={{ backgroundColor: template.bgColor }}>
            <div className="h-2 w-3/4 rounded-sm" style={{ backgroundColor: template.headingColor }} />
            <div className="flex gap-1 flex-1">
                <div className="flex-1 flex flex-col gap-0.5">
                    <div className="h-1 w-full rounded-sm" style={{ backgroundColor: template.textColor, opacity: 0.2 }} />
                    <div className="h-1 w-4/5 rounded-sm" style={{ backgroundColor: template.textColor, opacity: 0.2 }} />
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                    <div className="h-1 w-1/2 rounded-sm" style={{ backgroundColor: template.accentColor, opacity: 0.5 }} />
                    <div className="h-1 w-full rounded-sm" style={{ backgroundColor: template.textColor, opacity: 0.2 }} />
                </div>
            </div>
            {template.profilePic?.url && (
                <div className={`absolute top-2 right-2 w-5 h-5 border border-white shadow-sm overflow-hidden ${template.profilePic.shape === 'circle' ? 'rounded-full' : 'rounded-[2px]'}`}>
                    <img src={template.profilePic.url} alt="" className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    );
}

export default function TemplateSelector({ currentTheme, onSelect, vertical = false }: TemplateSelectorProps) {
    const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('vibrant-custom-templates');
            if (saved) setCustomTemplates(JSON.parse(saved));
        } catch { /* ignore */ }
    }, []);

    return (
        <div className={`flex flex-col gap-3 ${vertical ? 'h-full' : ''}`}>
            {!vertical && <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Select Template</h3>}
            <div className={`grid gap-2 ${vertical ? 'grid-cols-1 flex-1 overflow-y-auto max-h-[300px] pr-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                {/* Built-in Templates */}
                {templates.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => onSelect(t.id)}
                        className={`flex flex-col gap-2 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${currentTheme === t.id
                            ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                    >
                        <TemplateThumbnail thumbBg={t.thumbBg} thumbAccent={t.thumbAccent} />
                        <div className="flex items-center gap-2 w-full">
                            <div className={`p-1.5 rounded-md ${currentTheme === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {t.icon}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className={`font-bold text-xs ${currentTheme === t.id ? 'text-blue-900' : 'text-gray-900'}`}>{t.name}</span>
                                <span className="text-[10px] text-gray-500 truncate">{t.desc}</span>
                            </div>
                            {currentTheme === t.id && <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>}
                        </div>
                    </button>
                ))}

                {/* Custom Templates */}
                {customTemplates.map((ct) => (
                    <button
                        key={ct.id}
                        type="button"
                        onClick={() => onSelect(ct.id)}
                        className={`flex flex-col gap-2 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${currentTheme === ct.id
                            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-100 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-emerald-50/50 hover:border-emerald-300'
                            }`}
                    >
                        <CustomThumbnail template={ct} />
                        <div className="flex items-center gap-2 w-full">
                            <div className={`p-1.5 rounded-md ${currentTheme === ct.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-emerald-500'}`}>
                                <PenTool className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className={`font-bold text-xs ${currentTheme === ct.id ? 'text-emerald-900' : 'text-gray-900'}`}>{ct.name}</span>
                                <span className="text-[10px] text-gray-500 truncate">Custom Style</span>
                            </div>
                            {currentTheme === ct.id && <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></div>}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
