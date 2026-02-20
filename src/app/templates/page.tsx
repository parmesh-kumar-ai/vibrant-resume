"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Layout, Briefcase, Code, Palette, Sparkles, AlignCenter, Plus, X, Image as ImageIcon, Link as LinkIcon, Save, Trash2, LogIn } from "lucide-react";
import { CustomTemplate } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Link from 'next/link';

const defaultTemplates = [
    { name: "Modern", desc: "Clean, accent colors, sans-serif font.", icon: Layout, color: "bg-blue-500" },
    { name: "Classic", desc: "Traditional serif layout with formal headers.", icon: FileText, color: "bg-slate-700" },
    { name: "Minimal", desc: "High whitespace, ultra-clean design.", icon: AlignCenter, color: "bg-gray-400" },
    { name: "Executive", desc: "Bold corporate style with structured sections.", icon: Briefcase, color: "bg-blue-800" },
    { name: "Creative", desc: "Colorful gradients and expressive design.", icon: Palette, color: "bg-violet-500" },
    { name: "Tech", desc: "Developer-focused with monospace and terminal styling.", icon: Code, color: "bg-emerald-600" },
    { name: "Elegant", desc: "Refined serif with amber accents on warm tones.", icon: Sparkles, color: "bg-amber-600" },
    { name: "Corporate", desc: "Structured two-tone professional format.", icon: Briefcase, color: "bg-indigo-700" },
    { name: "Bold", desc: "Strong typography with dark header and high contrast.", icon: Layout, color: "bg-gray-900" },
];

export default function TemplatesPage() {
    const { user, login, openAuthModal } = useAuth();
    const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
    const [isDesigning, setIsDesigning] = useState(false);
    const [activeDesign, setActiveDesign] = useState<CustomTemplate>({
        id: "",
        name: "",
        headingColor: "#2563eb",
        accentColor: "#3b82f6",
        bgColor: "#ffffff",
        textColor: "#1a1a1a",
        fontFamily: "Inter, sans-serif",
        profilePic: { url: "", shape: "circle", source: "link", position: 'top-center', size: 96 }
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("vibrant-custom-templates");
            if (saved) setCustomTemplates(JSON.parse(saved));
        } catch { /**/ }
    }, []);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center -mt-20 px-4">
                <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
                    <div className="mx-auto w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-50">
                        <Palette className="w-10 h-10" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-extrabold text-gray-900">Premium Templates</h1>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Unlock our full collection of ATS-optimized templates and create your own custom styles by joining our community.
                        </p>
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

    const saveDesign = () => {
        if (!activeDesign.name.trim()) { alert("Please name your template."); return; }

        const newTemplates = [...customTemplates];
        const id = activeDesign.id || `custom-${Date.now()}`;
        const finalDesign = { ...activeDesign, id };

        const existingIdx = newTemplates.findIndex(t => t.id === id);
        if (existingIdx >= 0) newTemplates[existingIdx] = finalDesign;
        else newTemplates.unshift(finalDesign);

        localStorage.setItem("vibrant-custom-templates", JSON.stringify(newTemplates));
        setCustomTemplates(newTemplates);
        // Notify same-tab listeners (like ResumeEditor) that templates have been updated
        window.dispatchEvent(new CustomEvent('vibrant-template-updated', { detail: { id } }));
        setIsDesigning(false);
        setActiveDesign({
            id: "",
            name: "",
            headingColor: "#2563eb",
            accentColor: "#3b82f6",
            bgColor: "#ffffff",
            textColor: "#1a1a1a",
            fontFamily: "Inter, sans-serif",
            profilePic: { url: "", shape: "circle", source: "link", position: 'top-center', size: 96 }
        });
    };

    const deleteTemplate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Delete this custom template?")) {
            const nt = customTemplates.filter(t => t.id !== id);
            localStorage.setItem("vibrant-custom-templates", JSON.stringify(nt));
            setCustomTemplates(nt);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setActiveDesign(prev => ({
                ...prev,
                profilePic: {
                    // Preserve ALL existing settings (position, size, offsetY, shape, etc.)
                    shape: 'circle',
                    position: 'top-center',
                    size: 96,
                    offsetY: 0,
                    ...prev.profilePic,
                    // Only override url and source
                    url: reader.result as string,
                    source: 'local',
                }
            }));
        };
        reader.readAsDataURL(file);
    };

    return (
        <section className="min-h-screen px-4 pb-20 bg-gray-50/30">
            <div className="max-w-6xl mx-auto py-12">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Templates Gallery</h1>
                            <p className="text-sm font-medium text-gray-500">Create or choose a design that fits your career story.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Create New Card */}
                    <button
                        onClick={() => {
                            setActiveDesign({
                                id: "",
                                name: "",
                                headingColor: "#2563eb",
                                accentColor: "#3b82f6",
                                bgColor: "#ffffff",
                                textColor: "#1a1a1a",
                                fontFamily: "Inter, sans-serif",
                                profilePic: { url: "", shape: "circle", source: "link", position: 'top-center', size: 96 }
                            });
                            setIsDesigning(true);
                        }}
                        className="bg-white rounded-2xl border-2 border-dashed border-blue-200 p-6 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/30 transition-all group min-h-[320px] cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-gray-900">Create Custom</span>
                            <span className="text-xs text-gray-500">Build your unique style</span>
                        </div>
                    </button>

                    {/* Custom Templates */}
                    {customTemplates.map((t) => (
                        <div key={t.id} onClick={() => { setActiveDesign(t); setIsDesigning(true); }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative"
                        >
                            <div className="h-40 relative flex items-center justify-center" style={{ backgroundColor: t.bgColor }}>
                                <div className="absolute top-3 left-3 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-md text-[10px] font-bold text-blue-600 border border-blue-100 uppercase tracking-wider">Custom</div>
                                <button onClick={(e) => deleteTemplate(t.id, e)} className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                {t.profilePic?.url && (
                                    <img src={t.profilePic.url} alt="pic" className={`w-16 h-16 border-2 border-white shadow-lg ${t.profilePic.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`} />
                                )}
                                {!t.profilePic?.url && <Palette className="w-12 h-12" style={{ color: t.headingColor }} />}

                                <div className="absolute bottom-0 inset-x-0 h-10 flex gap-2 px-4">
                                    <div className="h-1 flex-1 rounded-full opacity-20" style={{ backgroundColor: t.headingColor }} />
                                    <div className="h-1 flex-1 rounded-full opacity-20" style={{ backgroundColor: t.accentColor }} />
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t.name}</h3>
                                <p className="text-xs text-gray-500 font-medium">Modified recently</p>
                            </div>
                        </div>
                    ))}

                    {/* Default Templates */}
                    {defaultTemplates.map((t) => {
                        const Icon = t.icon;
                        return (
                            <div key={t.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                                <div className={`h-40 ${t.color} flex items-center justify-center relative`}>
                                    <Icon className="w-12 h-12 text-white/50 group-hover:scale-110 group-hover:text-white/80 transition-all" />
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-800">{t.name}</h3>
                                    <p className="text-xs text-gray-400 font-medium">{t.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* DESIGNER MODAL */}
            {isDesigning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
                        {/* Preview Side */}
                        <div className="w-full md:w-5/12 bg-gray-100/50 p-8 flex flex-col items-center justify-center gap-6 border-r border-gray-100 overflow-y-auto">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Real-time Preview</div>

                            <div className="w-full bg-white shadow-2xl rounded-sm p-8 min-h-[400px] flex flex-col gap-4 relative" style={{ backgroundColor: activeDesign.bgColor, fontFamily: activeDesign.fontFamily, color: activeDesign.textColor }}>
                                {activeDesign.profilePic?.url && (activeDesign.profilePic.position === 'top-center' || activeDesign.profilePic.position === 'top-left' || activeDesign.profilePic.position === 'top-right') && (
                                    <div className={`flex w-full mb-4 ${activeDesign.profilePic.position === 'top-center' ? 'justify-center' : activeDesign.profilePic.position === 'top-right' ? 'justify-end' : 'justify-start'}`}
                                        style={{ transform: `translateY(${activeDesign.profilePic.offsetY || 0}px)` }}>
                                        <img src={activeDesign.profilePic.url} alt="p"
                                            style={{ width: `${activeDesign.profilePic.size || 64}px`, height: `${activeDesign.profilePic.size || 64}px` }}
                                            className={`shadow-md border-2 border-white shrink-0 object-cover ${activeDesign.profilePic.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`} />
                                    </div>
                                )}
                                <div className={`flex items-center gap-4 ${activeDesign.profilePic?.position === 'inline-right' ? 'flex-row-reverse' : ''}`}>
                                    {activeDesign.profilePic?.url && (activeDesign.profilePic.position === 'inline-left' || activeDesign.profilePic.position === 'inline-right') && (
                                        <img src={activeDesign.profilePic.url} alt="p"
                                            style={{ width: `${activeDesign.profilePic.size || 64}px`, height: `${activeDesign.profilePic.size || 64}px`, transform: `translateY(${activeDesign.profilePic.offsetY || 0}px)` }}
                                            className={`shadow-md border-2 border-white shrink-0 object-cover ${activeDesign.profilePic.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`} />
                                    )}
                                    <div className={`flex-1 ${activeDesign.profilePic?.position === 'top-center' ? 'text-center' : activeDesign.profilePic?.position === 'top-right' || activeDesign.profilePic?.position === 'inline-right' ? 'text-right' : 'text-left'}`}>
                                        <h2 className="text-xl font-bold leading-tight" style={{ color: activeDesign.headingColor }}>Parmesh Kumar</h2>
                                        <div className={`h-1 w-12 mt-1 ${activeDesign.profilePic?.position === 'top-center' ? 'mx-auto' : activeDesign.profilePic?.position === 'top-right' || activeDesign.profilePic?.position === 'inline-right' ? 'ml-auto' : ''}`} style={{ backgroundColor: activeDesign.accentColor }} />
                                    </div>
                                </div>
                                <div className="space-y-3 mt-4">
                                    <div className="h-1.5 w-full rounded-full opacity-10" style={{ backgroundColor: activeDesign.textColor }} />
                                    <div className="h-1.5 w-11/12 rounded-full opacity-10" style={{ backgroundColor: activeDesign.textColor }} />
                                    <div className="h-1.5 w-3/4 rounded-full opacity-10" style={{ backgroundColor: activeDesign.textColor }} />
                                    <div className="pt-2">
                                        <div className="h-2 w-1/4 rounded-sm mb-2" style={{ backgroundColor: activeDesign.accentColor }} />
                                        <div className="h-1.5 w-full rounded-full opacity-10" style={{ backgroundColor: activeDesign.textColor }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Config Side */}
                        <div className="flex-1 p-8 overflow-y-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-900">{activeDesign.id ? "Edit Template" : "New Template"}</h2>
                                <button onClick={() => setIsDesigning(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                            </div>

                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Template Name</label>
                                    <input type="text" value={activeDesign.name} onChange={e => setActiveDesign({ ...activeDesign, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900"
                                        placeholder="e.g. My Executive Style" />
                                </div>

                                {/* Colors */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Heading</label>
                                        <div className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                                            <input type="color" value={activeDesign.headingColor} onChange={e => setActiveDesign({ ...activeDesign, headingColor: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                                            <span className="text-sm font-mono text-gray-500 uppercase">{activeDesign.headingColor}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Accent</label>
                                        <div className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                                            <input type="color" value={activeDesign.accentColor} onChange={e => setActiveDesign({ ...activeDesign, accentColor: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                                            <span className="text-sm font-mono text-gray-500 uppercase">{activeDesign.accentColor}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Pic Config */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest">Shape</label>
                                        <div className="flex gap-1 bg-white p-1 rounded-lg border border-blue-200">
                                            <button onClick={() => setActiveDesign({ ...activeDesign, profilePic: { ...activeDesign.profilePic!, shape: 'circle' } })}
                                                className={`px-2 py-1 text-[10px] font-bold rounded ${activeDesign.profilePic?.shape === 'circle' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-blue-600'}`}>CIRCLE</button>
                                            <button onClick={() => setActiveDesign({ ...activeDesign, profilePic: { ...activeDesign.profilePic!, shape: 'rectangle' } })}
                                                className={`px-2 py-1 text-[10px] font-bold rounded ${activeDesign.profilePic?.shape === 'rectangle' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-blue-600'}`}>SQUARE</button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Layout Position</label>
                                        <div className="grid grid-cols-5 gap-1">
                                            {([
                                                { v: 'top-left', l: 'Top L' },
                                                { v: 'top-center', l: 'Top C' },
                                                { v: 'top-right', l: 'Top R' },
                                                { v: 'inline-left', l: 'Side L' },
                                                { v: 'inline-right', l: 'Side R' },
                                            ] as const).map(pos => (
                                                <button key={pos.v} onClick={() => setActiveDesign({ ...activeDesign, profilePic: { ...activeDesign.profilePic!, position: pos.v } })}
                                                    className={`py-1.5 rounded text-[9px] font-black border transition-all ${activeDesign.profilePic?.position === pos.v ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-100 text-blue-400 hover:bg-blue-50'}`}>
                                                    {pos.l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest">Image Size</label>
                                            <span className="text-[10px] font-black text-blue-900">{activeDesign.profilePic?.size || 96}px</span>
                                        </div>
                                        <input type="range" min="48" max="160" step="4" value={activeDesign.profilePic?.size || 96} onChange={e => setActiveDesign({ ...activeDesign, profilePic: { ...activeDesign.profilePic!, size: parseInt(e.target.value) } })}
                                            className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest">Vertical Position</label>
                                            <span className="text-[10px] font-black text-blue-900">{activeDesign.profilePic?.offsetY || 0}px</span>
                                        </div>
                                        <input type="range" min="-100" max="100" step="1" value={activeDesign.profilePic?.offsetY || 0} onChange={e => setActiveDesign({ ...activeDesign, profilePic: { ...activeDesign.profilePic!, offsetY: parseInt(e.target.value) } })}
                                            className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => setActiveDesign({ ...activeDesign, profilePic: { ...activeDesign.profilePic!, source: 'link' } })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-bold transition-all ${activeDesign.profilePic?.source === 'link' ? 'bg-white border-blue-400 text-blue-700 shadow-sm' : 'bg-transparent border-transparent text-gray-400'}`}>
                                            <LinkIcon className="w-3 h-3" />Link
                                        </button>
                                        <button onClick={() => setActiveDesign({ ...activeDesign, profilePic: { ...activeDesign.profilePic!, source: 'local' } })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-bold transition-all ${activeDesign.profilePic?.source === 'local' ? 'bg-white border-blue-400 text-blue-700 shadow-sm' : 'bg-transparent border-transparent text-gray-400'}`}>
                                            <Plus className="w-3 h-3" />Upload
                                        </button>
                                    </div>

                                    {activeDesign.profilePic?.source === 'link' ? (
                                        <input type="text" placeholder="https://image-url.com/profile.jpg"
                                            value={activeDesign.profilePic.url} onChange={e => setActiveDesign({ ...activeDesign, profilePic: { ...activeDesign.profilePic!, url: e.target.value } })}
                                            className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl outline-none text-xs text-blue-900 font-medium" />
                                    ) : (
                                        <div onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); }} className="w-full py-4 bg-white border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center gap-1 cursor-pointer hover:bg-white/50 transition-all">
                                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                                            <Plus className="w-4 h-4 text-blue-400" />
                                            <span className="text-[10px] font-bold text-blue-400">SELECT IMAGE FROM DEVICE</span>
                                        </div>
                                    )}
                                </div>

                                {activeDesign.profilePic?.url && <button onClick={() => setActiveDesign({ ...activeDesign, profilePic: { ...activeDesign.profilePic!, url: "" } })} className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase self-end">Remove Picture</button>}
                            </div>

                            {/* Save Button */}
                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setIsDesigning(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95">Cancel</button>
                                <button onClick={saveDesign} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <Save className="w-5 h-5" />
                                    Save Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
