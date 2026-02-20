"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    Pencil, GripVertical, ArrowUp, ArrowDown, Link2, Palette, Plus, Trash2, X, Columns,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline,
    Phone, Mail, Globe, Save, User, MapPin, List, Type, ChevronDown, SpellCheck, Loader2, Check, AlertTriangle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ResumeTheme, CustomTemplate } from "@/lib/types";

/* ─── SVG Icons for contact (since lucide doesn't have LeetCode) ─── */
const LinkedInIcon = () => (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 inline-block mr-1" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);
const GitHubIcon = () => (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 inline-block mr-1" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);
const LeetCodeIcon = () => (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 inline-block mr-1" fill="currentColor">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.yles 3.165c.642.587 1.658.55 2.225-.083a1.379 1.379 0 0 0-.083-1.952l-3.162-3.143a5.956 5.956 0 0 0-4.057-1.624zM18.613 5.5a2 2 0 1 0-.001 4 2 2 0 0 0 .001-4z" />
    </svg>
);

/* ─── Types ─────────────────────────────────────────── */
interface ResumeSection {
    id: string;
    content: string;
    headingColor?: string;
    contentColor?: string;
    headingBgColor?: string;
    bulletBgColor?: string;
    twoColumn?: boolean;
    hideMarkers?: boolean;   // suppresses decorative ::before bullets and list-style markers
    headingAlignment?: "left" | "center" | "right" | "justify";
    contentAlignment?: "left" | "center" | "right" | "justify";
    lineSpacing?: number;   // 1.1=tight, 1.45=normal, 1.8=relaxed
    sectionGap?: number;    // px gap above this section: 0,8,16,32
    headingFontSize?: number; // pt size for section headings
    contentFontSize?: number; // pt size for body/content text
}

interface ContactInfo {
    phone?: string;
    email?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
    leetcode?: string;
    location?: string;
}

interface ResumeEditorProps {
    content: string;
    theme?: ResumeTheme;
    onContentChange: (newContent: string) => void;
    // Optional metrics for history
    matchScore?: number;
    originalScore?: number;
    missingKeywords?: string[];
    commitedChanges?: string[];
}

/* ─── Helpers ───────────────────────────────────────── */
function parseMarkdownSections(markdown: string): ResumeSection[] {
    const lines = markdown.split("\n");
    const sections: ResumeSection[] = [];
    let current: string[] = [];
    let idx = 0;
    for (const line of lines) {
        if (line.match(/^#{1,2}\s/) && current.length > 0) {
            sections.push({ id: `section-${idx++}`, content: current.join("\n").trim() });
            current = [line];
        } else { current.push(line); }
    }
    if (current.join("").trim()) sections.push({ id: `section-${idx}`, content: current.join("\n").trim() });
    return sections;
}

function sectionsToMarkdown(sections: ResumeSection[]): string {
    return sections.map((s) => s.content).join("\n\n");
}

function splitForColumns(content: string): [string, string] {
    const lines = content.split("\n");
    const body: string[] = [];
    let pastH = false;
    for (const l of lines) {
        if (!pastH && l.match(/^#{1,3}\s/)) { pastH = true; }
        else { body.push(l); }
    }
    const mid = Math.ceil(body.length / 2);
    return [body.slice(0, mid).join("\n"), body.slice(mid).join("\n")];
}

function getSectionHeading(c: string): string {
    const m = c.match(/^(#{1,3}\s+.+)/m);
    return m ? m[1] : "";
}

function getSectionLabel(c: string): string {
    const m = c.match(/^#{1,3}\s+(.+)/m);
    return m ? m[1].trim() : "Content Block";
}

const COLOR_PRESETS = [
    "#2563eb", "#1e3a5f", "#0d9488", "#059669", "#7c3aed", "#e11d48", "#d97706", "#334155", "#4b5563", "#111827", "#ffffff", "#f3f4f6"
];

const BG_PRESETS = [
    { label: "None", value: "" },
    "#dbeafe", "#e0e7ff", "#dcfce7", "#fef3c7", "#fce7f3", "#f3f4f6", "#1e3a5f", "#3730a3", "#334155", "#111827"
];

const ALIGN_OPTS: { v: ResumeSection["headingAlignment"]; icon: React.ReactNode; label: string }[] = [
    { v: "left", icon: <AlignLeft className="w-3.5 h-3.5" />, label: "Left" },
    { v: "center", icon: <AlignCenter className="w-3.5 h-3.5" />, label: "Center" },
    { v: "right", icon: <AlignRight className="w-3.5 h-3.5" />, label: "Right" },
    { v: "justify", icon: <AlignJustify className="w-3.5 h-3.5" />, label: "Justify" },
];

const PROFESSIONAL_FONTS = [
    { name: 'Inter (Modern Sans)', family: '"Inter", sans-serif' },
    { name: 'Roboto (Standard Sans)', family: '"Roboto", sans-serif' },
    { name: 'Montserrat (Bold Sans)', family: '"Montserrat", sans-serif' },
    { name: 'Outfit (Geometric Sans)', family: '"Outfit", sans-serif' },
    { name: 'Lora (Modern Serif)', family: '"Lora", serif' },
    { name: 'Playfair Display (Premium Serif)', family: '"Playfair Display", serif' },
    { name: 'EB Garamond (Traditional Serif)', family: '"EB Garamond", serif' },
    { name: 'JetBrains Mono (Tech/Mono)', family: '"JetBrains Mono", monospace' },
];

function ac(a?: string) {
    switch (a) { case "center": return "text-center"; case "right": return "text-right"; case "justify": return "text-justify"; default: return "text-left"; }
}

/* ─── Contact bar renderer ─────────────────────────── */
function ContactBar({ info, linkClass, alignment = "left" }: { info: ContactInfo; linkClass: string; alignment?: string }) {
    const alignClass = alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : alignment === "justify" ? "justify-between" : "justify-start";
    const parts: React.ReactNode[] = [];
    if (info.phone) parts.push(
        <span key="phone" className="inline-flex items-center gap-1 shrink-0"><Phone className="w-2.5 h-2.5" />{info.phone}</span>
    );
    if (info.location) parts.push(
        <span key="loc" className="inline-flex items-center gap-1 shrink-0"><MapPin className="w-2.5 h-2.5" />{info.location}</span>
    );
    if (info.email) parts.push(
        <a key="email" href={`mailto:${info.email}`} className={`inline-flex items-center gap-1 shrink-0 ${linkClass}`}>
            <Mail className="w-2.5 h-2.5" />{info.email}
        </a>
    );
    if (info.linkedin) parts.push(
        <a key="li" href={info.linkedin} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 shrink-0 ${linkClass}`}>
            <LinkedInIcon />LinkedIn
        </a>
    );
    if (info.github) parts.push(
        <a key="gh" href={info.github} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 shrink-0 ${linkClass}`}>
            <GitHubIcon />GitHub
        </a>
    );
    if (info.portfolio) parts.push(
        <a key="pf" href={info.portfolio} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 shrink-0 ${linkClass}`}>
            <Globe className="w-2.5 h-2.5" />Portfolio
        </a>
    );
    if (info.website) parts.push(
        <a key="ws" href={info.website} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 shrink-0 ${linkClass}`}>
            <Globe className="w-2.5 h-2.5" />Website
        </a>
    );
    if (info.leetcode) parts.push(
        <a key="lc" href={info.leetcode} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 shrink-0 ${linkClass}`}>
            <LeetCodeIcon />LeetCode
        </a>
    );
    if (!parts.length) return null;
    return (
        <div className={`flex flex-nowrap items-center gap-x-2 text-[11px] mt-0.5 mb-2 overflow-hidden ${alignClass}`}>
            {parts.map((p, i) => (
                <span key={i} className="inline-flex items-center">
                    {i > 0 && <span className="mr-2 text-gray-300 opacity-50">·</span>}
                    {p}
                </span>
            ))}
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────── */
export default function ResumeEditor({
    content,
    theme = "modern",
    onContentChange,
    matchScore = 0,
    originalScore = 0,
    missingKeywords = [],
    commitedChanges = []
}: ResumeEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [sections, setSections] = useState<ResumeSection[]>(() => parseMarkdownSections(content));
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [activePanel, setActivePanel] = useState<{ id: string; panel: string } | null>(null);
    const [linkModal, setLinkModal] = useState<{ sectionId: string } | null>(null);
    const [linkText, setLinkText] = useState(""); const [linkUrl, setLinkUrl] = useState("");
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
    const [contactInfo, setContactInfo] = useState<ContactInfo>({});
    const [contactAlignment, setContactAlignment] = useState<"left" | "center" | "right" | "justify">("left");
    const [showContactEditor, setShowContactEditor] = useState(false);
    const [savedMsg, setSavedMsg] = useState(false);
    const [pageTarget, setPageTarget] = useState<'auto' | '1' | '2' | '3'>('auto');
    const [globalFont, setGlobalFont] = useState<string>(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('vibrant-resume-font') || '"Inter", sans-serif';
        return '"Inter", sans-serif';
    });
    const [customTemplate, setCustomTemplate] = useState<CustomTemplate | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Grammar check state
    interface GrammarIssue { original: string; suggestion: string; type: string; explanation: string; }
    const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([]);
    const [grammarLoading, setGrammarLoading] = useState(false);
    const [grammarOpen, setGrammarOpen] = useState(false);

    useEffect(() => {
        const loadTemplate = () => {
            if (!theme) return;
            try {
                const saved = localStorage.getItem('vibrant-custom-templates');
                if (saved) {
                    const templates: CustomTemplate[] = JSON.parse(saved);
                    const found = templates.find(t => t.id === theme);
                    setCustomTemplate(found || null);
                }
            } catch { /**/ }
        };

        loadTemplate();

        // Also re-load when localStorage changes (e.g. user edits and saves same template)
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'vibrant-custom-templates') loadTemplate();
        };
        // Also listen for same-tab updates dispatched from TemplatesPage
        const onCustomEvent = () => loadTemplate();
        window.addEventListener('storage', onStorage);
        window.addEventListener('vibrant-template-updated', onCustomEvent);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('vibrant-template-updated', onCustomEvent);
        };
    }, [theme]);

    const commitChanges = useCallback(
        (ns: ResumeSection[]) => { setSections(ns); onContentChange(sectionsToMarkdown(ns)); },
        [onContentChange]
    );

    // Load saved resume
    useEffect(() => {
        try {
            const saved = localStorage.getItem("vibrant-resume-saved");
            if (saved) {
                const data = JSON.parse(saved);
                if (data.sections?.length > 0) { setSections(data.sections); onContentChange(sectionsToMarkdown(data.sections)); }
                if (data.contactInfo) setContactInfo(data.contactInfo);
                if (data.contactAlignment) setContactAlignment(data.contactAlignment);
                if (data.pageTarget) setPageTarget(data.pageTarget);
                if (data.globalFont) setGlobalFont(data.globalFont);
            }
        } catch { /* ignore */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist pageTarget separately so PDF printer can read it without a full save
    useEffect(() => {
        localStorage.setItem('vibrant-page-target', pageTarget);
    }, [pageTarget]);

    useEffect(() => {
        localStorage.setItem('vibrant-resume-font', globalFont);
    }, [globalFont]);

    // Sync sections to dedicated key so DOCX exporter can read columns/spacing
    useEffect(() => {
        localStorage.setItem('vibrant-resume-sections', JSON.stringify(sections));
    }, [sections]);

    const handleSave = () => {
        const timestamp = new Date().toISOString();
        const saveObj = { sections, contactInfo, contactAlignment, pageTarget, globalFont, theme, savedAt: timestamp };
        localStorage.setItem("vibrant-resume-saved", JSON.stringify(saveObj));

        // Update history
        try {
            const h1Match = sections[0]?.content.match(/^#\s+(.+)/m);
            const candidateName = h1Match ? h1Match[1].trim() : "Untitled Resume";

            const history: any[] = JSON.parse(localStorage.getItem("vibrant-resume-history") || "[]");

            // Limit to 20 saves with confirmation
            if (history.length >= 20) {
                const confirmed = confirm("Recent history limit reached (max 20). If you save this, your oldest resume snapshot will be permanently deleted. Do you want to proceed?");
                if (!confirmed) return;
            }

            const newItem = {
                id: Math.random().toString(36).substring(2, 9),
                timestamp,
                name: candidateName,
                matchScore,
                originalScore,
                missingKeywords,
                commitedChanges,
                ...saveObj
            };

            // Keep only last 20
            const newHistory = [newItem, ...history].slice(0, 20);
            localStorage.setItem("vibrant-resume-history", JSON.stringify(newHistory));

            // Notify other components (like Sidebar)
            window.dispatchEvent(new CustomEvent('vibrant-history-updated'));
        } catch (e) {
            console.error("Failed to save history:", e);
        }

        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 2000);
    };

    const startEditing = (s: ResumeSection) => { setEditingSection(s.id); setEditText(s.content); };
    const saveEdit = () => {
        if (!editingSection) return;
        commitChanges(sections.map((s) => s.id === editingSection ? { ...s, content: editText } : s));
        setEditingSection(null); setEditText("");
    };
    const cancelEdit = () => { setEditingSection(null); setEditText(""); };

    const wrapSelected = (before: string, after: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart, end = ta.selectionEnd;
        const sel = editText.substring(start, end);
        setEditText(editText.substring(0, start) + before + sel + after + editText.substring(end));
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, end + before.length); }, 0);
    };

    const move = (i: number, dir: "up" | "down") => {
        const t = dir === "up" ? i - 1 : i + 1;
        if (t < 0 || t >= sections.length) return;
        const ns = [...sections];[ns[i], ns[t]] = [ns[t], ns[i]]; commitChanges(ns);
    };

    const setProp = (id: string, prop: Partial<ResumeSection>) =>
        commitChanges(sections.map((s) => s.id === id ? { ...s, ...prop } : s));

    const togglePanel = (id: string, panel: string) =>
        setActivePanel(activePanel?.id === id && activePanel.panel === panel ? null : { id, panel });

    const addLink = () => {
        if (!linkModal || !linkText || !linkUrl) return;
        commitChanges(sections.map((s) => s.id === linkModal.sectionId ? { ...s, content: s.content + `\n[${linkText}](${linkUrl})` } : s));
        setLinkModal(null); setLinkText(""); setLinkUrl("");
    };

    const applyContact = (info: ContactInfo) => {
        setContactInfo(info);
        setShowContactEditor(false);
    };

    const addSection = () =>
        commitChanges([...sections, { id: `section-${Date.now()}`, content: "## New Section\n\n- Add content here" }]);
    const delSection = (id: string) => commitChanges(sections.filter((s) => s.id !== id));

    // Theme classes
    const getThemeClasses = () => {
        const custom = () => {
            let c: Record<string, string> = {};
            try { c = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('custom-resume-template') || '{}') : {}; } catch { /* */ }
            return { headingColor: c.headingColor || '#2563eb', accentColor: c.accentColor || '#3b82f6', fontFamily: c.fontFamily || 'sans-serif', bgColor: c.bgColor || '#ffffff', textColor: c.textColor || '#1a1a1a' };
        };
        if (theme === 'custom') {
            const cv = custom();
            return { wrapper: `font-sans`, h1: `text-3xl font-bold mb-4 pb-2 border-b-2`, h2: `text-xl font-bold mt-6 mb-3`, h3: `text-lg font-bold mt-4 mb-2`, p: "mb-3 leading-relaxed text-sm", ul: "list-disc pl-5 space-y-1 mb-4", li: "text-sm leading-relaxed", strong: "font-semibold", a: "underline", _c: cv };
        }
        const map: Record<string, Record<string, string>> = {
            classic: { wrapper: "font-serif bg-white text-slate-900", h1: "text-3xl font-bold border-b-2 border-slate-900 pb-2 mb-4 uppercase tracking-widest", h2: "text-lg font-bold uppercase border-b border-slate-300 pb-1 mt-4 mb-3", h3: "text-base font-bold mt-4 mb-2 text-slate-800", p: "mb-3 leading-relaxed", ul: "list-disc pl-5 space-y-1 mb-4 marker:text-slate-400", li: "text-sm leading-relaxed", strong: "font-semibold text-slate-900", a: "text-blue-700 underline" },
            minimal: { wrapper: "font-sans bg-white text-slate-800", h1: "text-4xl font-light mb-6 tracking-tight", h2: "text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-6 mb-4", h3: "text-sm font-semibold mt-4 mb-2 text-slate-600", p: "mb-4 leading-7 text-sm", ul: "list-disc pl-5 space-y-1 mb-4 marker:text-slate-300", li: "text-sm leading-relaxed", strong: "font-medium text-slate-800", a: "text-slate-600 underline" },
            executive: { wrapper: "font-sans bg-white text-gray-900", h1: "text-3xl font-extrabold uppercase tracking-wider mb-2 text-gray-900 border-b-4 border-blue-800 pb-3", h2: "text-base font-bold uppercase tracking-widest text-blue-800 mt-6 mb-3 bg-blue-50 px-3 py-1.5 rounded", h3: "text-base font-bold mt-4 mb-2 text-gray-800", p: "mb-3 leading-relaxed text-gray-700 text-sm", ul: "list-none pl-4 space-y-1.5 mb-4", li: "text-sm leading-relaxed relative pl-4 before:content-['▸'] before:absolute before:left-0 before:text-blue-800 before:font-bold", strong: "font-bold text-gray-900", a: "text-blue-800 underline" },
            creative: { wrapper: "font-sans bg-white text-gray-800", h1: "text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500", h2: "text-lg font-bold mt-6 mb-3 text-violet-700 border-l-4 border-violet-400 pl-3", h3: "text-base font-bold mt-4 mb-2 text-pink-600", p: "mb-3 leading-relaxed text-gray-600", ul: "list-none pl-4 space-y-1.5 mb-4", li: "text-sm leading-relaxed relative pl-4 before:content-['●'] before:absolute before:left-0 before:text-violet-400", strong: "font-bold text-violet-800", a: "text-violet-600 underline" },
            tech: { wrapper: "font-mono bg-slate-950 text-green-100", h1: "text-2xl font-bold mb-4 text-green-400 border-b border-green-800 pb-2", h2: "text-base font-bold mt-6 mb-3 text-cyan-400", h3: "text-sm font-bold mt-4 mb-2 text-yellow-400", p: "mb-3 leading-relaxed text-slate-300 text-sm", ul: "list-none pl-4 space-y-1 mb-4", li: "text-sm relative pl-5 before:content-['→'] before:absolute before:left-0 before:text-green-500", strong: "font-bold text-green-300", a: "text-cyan-400 underline" },
            elegant: { wrapper: "font-serif bg-stone-50 text-stone-900", h1: "text-3xl font-light mb-2 tracking-[0.15em] uppercase text-stone-800", h2: "text-sm font-semibold uppercase tracking-[0.2em] text-amber-700 mt-6 mb-3", h3: "text-base font-semibold mt-4 mb-2 text-stone-700 italic", p: "mb-3 leading-7 text-stone-600 text-sm", ul: "list-none pl-4 space-y-1.5 mb-4", li: "text-sm relative pl-4 before:content-['◆'] before:absolute before:left-0 before:text-amber-600 before:text-xs", strong: "font-bold text-stone-800", a: "text-amber-700 underline" },
            corporate: { wrapper: "font-sans bg-white text-gray-900", h1: "text-3xl font-bold mb-2 text-white bg-indigo-800 px-4 py-3 rounded-lg -mx-4", h2: "text-base font-bold uppercase tracking-wider text-indigo-800 mt-6 mb-3 border-b-2 border-indigo-200 pb-1", h3: "text-base font-semibold mt-4 mb-2 text-gray-800", p: "mb-3 leading-relaxed text-gray-700 text-sm", ul: "list-none pl-4 space-y-1.5 mb-4", li: "text-sm relative pl-4 before:content-['■'] before:absolute before:left-0 before:text-indigo-600 before:text-xs", strong: "font-bold text-gray-900", a: "text-indigo-700 underline" },
            bold: { wrapper: "font-sans bg-gray-50 text-gray-900", h1: "text-4xl font-black uppercase mb-3 text-white bg-gradient-to-r from-gray-900 to-gray-700 px-5 py-4 -mx-4 rounded-lg", h2: "text-lg font-extrabold uppercase tracking-wide text-orange-600 mt-6 mb-3 border-l-4 border-orange-500 pl-3", h3: "text-base font-bold mt-4 mb-2 text-gray-800", p: "mb-3 leading-relaxed text-gray-600 text-sm", ul: "list-none pl-4 space-y-1.5 mb-4", li: "text-sm relative pl-4 before:content-['▶'] before:absolute before:left-0 before:text-orange-500 before:text-xs", strong: "font-black text-gray-900", a: "text-orange-600 underline" },
        };

        if (customTemplate) {
            return {
                wrapper: `text-gray-900`,
                h1: `text-3xl font-bold mb-4 pb-2 border-b-2`,
                h2: `text-xl font-bold mt-6 mb-3`,
                h3: `text-lg font-bold mt-4 mb-2`,
                p: "mb-3 leading-relaxed text-sm",
                ul: "list-disc pl-5 space-y-1 mb-4",
                li: "text-sm leading-relaxed",
                strong: "font-semibold",
                a: "underline",
                _c: customTemplate
            };
        }

        return map[theme] || { wrapper: "font-sans bg-white text-slate-900", h1: "text-3xl font-bold uppercase text-blue-600 border-b-2 border-blue-100 pb-2 mb-4", h2: "text-xl font-bold text-slate-700 mt-4 mb-3", h3: "text-lg font-bold mt-4 mb-2 text-slate-800", p: "mb-3 leading-relaxed text-slate-600", ul: "list-disc pl-5 space-y-1 mb-4 marker:text-slate-400", li: "text-sm leading-relaxed", strong: "font-semibold text-slate-900", a: "text-blue-600 underline" };
    };

    const cls = getThemeClasses() as Record<string, any>;
    const customStyles = customTemplate ? { fontFamily: customTemplate.fontFamily, backgroundColor: customTemplate.bgColor, color: customTemplate.textColor } : {};

    const linkClass = (cls.a || "text-blue-600").replace('underline', 'no-underline');

    const renderMd = (md: string, section?: ResumeSection, isHeading = false, noH1Border = false) => {
        const safeId = section?.id.replace(/[^a-z0-9]/gi, '') || 'default';
        const scopeClass = section?.hideMarkers ? `nm-${safeId}` : '';
        return (
            <>
                {section?.hideMarkers && (
                    <style>{`
                        .${scopeClass} > ul > li::before { content: none !important; display: none !important; }
                        .${scopeClass} > ul > li { padding-left: 0 !important; }
                        .${scopeClass} > ol > li::before { content: none !important; display: none !important; }
                        .${scopeClass} h3::before { content: none !important; display: none !important; }
                        .${scopeClass} h3 { padding-left: 0 !important; }
                    `}</style>
                )}
                <div className={scopeClass}>
                    <ReactMarkdown
                        components={{
                            h1: ({ ...p }) => <h1 className={`${cls.h1} ${isHeading ? '' : ac(section?.headingAlignment)}`} style={{ color: section?.headingColor || (theme === 'custom' && cls._c?.headingColor) || undefined, backgroundColor: section?.headingBgColor || undefined, ...(section?.headingBgColor ? { padding: '6px 12px', borderRadius: '4px' } : {}), ...(noH1Border ? { borderBottom: 'none', marginBottom: 0, paddingBottom: 0 } : {}), ...(section?.headingFontSize ? { fontSize: `${section.headingFontSize}pt` } : {}) }} {...p} />,
                            h2: ({ ...p }) => <h2 className={`${cls.h2} ${isHeading ? '' : ac(section?.headingAlignment)}`} style={{ color: section?.headingColor || (theme === 'custom' && cls._c?.headingColor) || undefined, backgroundColor: section?.headingBgColor || undefined, ...(section?.headingBgColor ? { padding: '4px 10px', borderRadius: '4px' } : {}), ...(section?.headingFontSize ? { fontSize: `${section.headingFontSize}pt` } : {}) }} {...p} />,
                            h3: ({ ...p }) => <h3 className={`${cls.h3} ${isHeading ? '' : ac(section?.headingAlignment)}`} style={{ color: section?.headingColor || undefined, ...(section?.headingFontSize ? { fontSize: `${section.headingFontSize}pt` } : {}) }} {...p} />,
                            ul: ({ ...p }) => <ul className={cls.ul} {...p} />,
                            li: ({ ...p }) => <li className={`${cls.li} ${ac(section?.contentAlignment)}`} style={{ color: section?.contentColor || undefined, backgroundColor: section?.bulletBgColor || undefined, ...(section?.bulletBgColor ? { padding: '2px 8px', borderRadius: '3px', marginBottom: '2px' } : {}), ...(section?.contentFontSize ? { fontSize: `${section.contentFontSize}pt` } : {}) }} {...p} />,
                            p: ({ ...p }) => <p className={`${cls.p} ${ac(section?.contentAlignment)}`} style={{ color: section?.contentColor || undefined, ...(section?.contentFontSize ? { fontSize: `${section.contentFontSize}pt` } : {}) }} {...p} />,
                            strong: ({ ...p }) => <strong className={cls.strong} {...p} />,
                            a: ({ ...p }) => <a className={linkClass} target="_blank" rel="noopener noreferrer" {...p} />,
                        }}
                    >{md}</ReactMarkdown>
                </div>
            </>
        );
    };

    const renderSection = (section: ResumeSection, injectContactBar = false, injectProfilePic = false) => {
        const pic = customTemplate?.profilePic;
        const isInline = pic?.url && (pic.position === 'inline-left' || pic.position === 'inline-right');

        const renderHeaderContent = () => {
            const heading = getSectionHeading(section.content);
            // When a contact bar is present, we move the separator line BELOW the contacts.
            // We suppress the H1's border-bottom here and add it back after the contact bar.
            const hasContact = injectContactBar && Object.values(contactInfo).some(Boolean);
            const contactBar = hasContact && (
                <ContactBar info={contactInfo} linkClass={linkClass} alignment={contactAlignment} />
            );
            // Separator shown after contact bar (replaces H1 border-bottom)
            // Extract color from the ACTUAL h1 class (e.g. border-slate-900) so it always matches
            // what the original H1 border would have shown for the current theme.
            const h1BorderColorMap: Record<string, string> = {
                'border-slate-900': '#0f172a',
                'border-blue-800': '#1e3a8a',
                'border-green-800': '#166534',
                'border-indigo-200': '#e0e7ff',
                'border-stone-200': '#e7e5e4',
            };
            const matchedBorder = Object.keys(h1BorderColorMap).find(k => cls.h1.includes(k));
            const separatorColor = matchedBorder
                ? h1BorderColorMap[matchedBorder]
                : (customTemplate ? '#000000' : '#d1d5db');
            const separator = hasContact && (
                <div className="border-b-2 mb-1 mt-1" style={{ borderColor: separatorColor }} />
            );

            // inline positions (inline-left / inline-right) and top-left / top-right:
            // All render side-by-side with the name heading to avoid a large empty space.
            const isSideBySide = pic?.url &&
                (pic.position === 'inline-left' || pic.position === 'inline-right' ||
                    pic.position === 'top-left' || pic.position === 'top-right');
            const imgOnRight = pic?.position === 'inline-right' || pic?.position === 'top-right';

            if (isSideBySide && injectProfilePic) {
                return (
                    <div className={`flex items-center gap-4 mb-4 ${imgOnRight ? 'flex-row-reverse' : 'flex-row'}`}>
                        <img src={pic!.url} alt="Profile"
                            style={{ width: `${pic!.size || 80}px`, height: `${pic!.size || 80}px`, transform: `translateY(${pic!.offsetY || 0}px)`, flexShrink: 0 }}
                            className={`object-cover border-2 shadow-sm shrink-0 border-white ${pic!.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`} />
                        <div className={`flex-1 min-w-0 ${ac(section.headingAlignment)}`}>
                            {heading && renderMd(heading, section, false, hasContact)}
                            {contactBar}
                            {separator}
                        </div>
                    </div>
                );
            }

            return (
                <div className={ac(section.headingAlignment)}>
                    {heading && renderMd(heading, section, false, hasContact)}
                    {contactBar}
                    {separator}
                </div>
            );
        };

        if (section.twoColumn) {
            const [c1, c2] = splitForColumns(section.content);
            return (
                <div className="mb-4">
                    {renderHeaderContent()}
                    <div className="grid grid-cols-2 gap-6">
                        <div className={ac(section.contentAlignment)}>{renderMd(c1, section)}</div>
                        <div className={ac(section.contentAlignment)}>{renderMd(c2, section)}</div>
                    </div>
                </div>
            );
        }

        const bodyContent = section.content.replace(/^#{1,3}\s+.+\n?/, "");
        return (
            <div className="mb-4">
                {renderHeaderContent()}
                <div className={ac(section.contentAlignment)}>
                    {renderMd(bodyContent, section)}
                </div>
            </div>
        );
    };

    /* ─── Density CSS per page target ─────────────────── */
    const densityCSS: Record<string, string> = {
        '1': `
            #resume-preview { padding: 20px 32px !important; }
            #resume-preview h1 { font-size: 1.5rem !important; margin-top: 0 !important; margin-bottom: 0.1em !important; padding-bottom: 0.15em !important; }
            #resume-preview h2 { font-size: 0.85rem !important; margin-top: 0.35em !important; margin-bottom: 0.2em !important; padding-top: 0.1em !important; padding-bottom: 0.1em !important; }
            #resume-preview h3 { font-size: 0.8rem !important; margin-top: 0.3em !important; margin-bottom: 0.15em !important; }
            #resume-preview p  { margin-top: 0 !important; margin-bottom: 0.1em !important; line-height: 1.2 !important; font-size: 0.78rem !important; }
            #resume-preview ul { margin-top: 0.1em !important; margin-bottom: 0.1em !important; padding-left: 1rem !important; }
            #resume-preview li { line-height: 1.2 !important; margin-bottom: 0.05em !important; font-size: 0.78rem !important; }
            #resume-preview strong { font-size: inherit !important; }
        `,
        '2': `
            #resume-preview { padding: 24px 32px !important; }
            #resume-preview h1 { font-size: 1.7rem !important; margin-top: 0 !important; margin-bottom: 0.15em !important; }
            #resume-preview h2 { font-size: 0.9rem !important; margin-top: 0.5em !important; margin-bottom: 0.25em !important; }
            #resume-preview h3 { font-size: 0.85rem !important; margin-top: 0.4em !important; margin-bottom: 0.2em !important; }
            #resume-preview p  { margin-bottom: 0.2em !important; line-height: 1.35 !important; font-size: 0.82rem !important; }
            #resume-preview ul { margin-top: 0.15em !important; margin-bottom: 0.15em !important; }
            #resume-preview li { line-height: 1.35 !important; margin-bottom: 0.1em !important; font-size: 0.82rem !important; }
        `,
        '3': `
            #resume-preview h1 { margin-bottom: 0.2em !important; }
            #resume-preview h2 { margin-top: 0.7em !important; margin-bottom: 0.3em !important; }
            #resume-preview p  { margin-bottom: 0.35em !important; line-height: 1.5 !important; }
            #resume-preview li { line-height: 1.5 !important; }
        `,
    };
    const activeDensityCSS = pageTarget !== 'auto' ? densityCSS[pageTarget] || '' : '';

    /* ─── PREVIEW MODE ─────────────────────────────────── */
    if (!isEditing) {
        return (
            <div className="relative">
                {activeDensityCSS && <style>{activeDensityCSS}</style>}
                <div className="flex items-center justify-between gap-2 mb-3 print:hidden flex-wrap">
                    {/* Page target selector */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-500 mr-1">Pages:</span>
                        {(['auto', '1', '2', '3'] as const).map((opt) => (
                            <button key={opt} onClick={() => setPageTarget(opt)}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer transition-all ${pageTarget === opt
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                    }`}>
                                {opt === 'auto' ? 'Auto' : `${opt}P`}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Global Font Selector */}
                        <div className="relative group mr-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-400 cursor-pointer transition-colors">
                                <Type className="w-3.5 h-3.5 text-gray-400" />
                                <select
                                    value={globalFont}
                                    onChange={(e) => setGlobalFont(e.target.value)}
                                    className="bg-transparent text-xs font-medium text-gray-700 outline-none cursor-pointer appearance-none pr-4"
                                    style={{ fontFamily: globalFont }}
                                >
                                    {PROFESSIONAL_FONTS.map(f => (
                                        <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>{f.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 pointer-events-none" />
                            </div>
                        </div>

                        <button onClick={handleSave}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${savedMsg ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                            <Save className="w-3.5 h-3.5" />
                            {savedMsg ? "Saved!" : "Save"}
                        </button>
                        <button onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50/50 rounded-xl p-4 md:p-8 min-h-[500px] flex justify-center border border-gray-100 shadow-sm overflow-hidden">
                    <div ref={previewRef} id="resume-preview"
                        className={`prose prose-slate bg-white shadow-xl transition-all duration-300 ${cls.wrapper}`}
                        style={{
                            ...customStyles,
                            fontFamily: globalFont, // Global font override
                            width: '100%',
                            maxWidth: '850px',
                            padding: '40px 60px', // Original comfortable padding
                            boxSizing: 'border-box',
                            position: 'relative',
                        }}>
                        {/* Only top-center renders image as a stacked block above sections */}
                        {customTemplate?.profilePic?.url && customTemplate.profilePic.position === 'top-center' && (
                            <div className="flex w-full mb-6 justify-center"
                                style={{ transform: `translateY(${customTemplate.profilePic.offsetY || 0}px)` }}>
                                <img
                                    src={customTemplate.profilePic.url}
                                    alt="Profile"
                                    style={{ width: `${customTemplate.profilePic.size || 96}px`, height: `${customTemplate.profilePic.size || 96}px` }}
                                    className={`object-cover border-4 border-white shadow-lg ${customTemplate.profilePic.shape === 'circle' ? 'rounded-full' : 'rounded-xl'}`}
                                />
                            </div>
                        )}
                        {sections.map((section, idx) => {
                            const safeId = section.id.replace(/[^a-z0-9]/gi, '');
                            const lsClass = section.lineSpacing ? `ls-${safeId}` : '';
                            return (
                                <React.Fragment key={section.id}>
                                    {section.lineSpacing && (
                                        <style>{`
                                            .${lsClass} p, .${lsClass} li, .${lsClass} h1, .${lsClass} h2, .${lsClass} h3, .${lsClass} h4, .${lsClass} h5, .${lsClass} h6, .${lsClass} span { 
                                                line-height: ${section.lineSpacing} !important; 
                                            }
                                        `}</style>
                                    )}
                                    <div className={`${lsClass} ${section.hideMarkers ? `nm-${safeId}` : ''}`}
                                        style={{ marginTop: section.sectionGap !== undefined ? `${section.sectionGap}px` : undefined }}>
                                        {renderSection(section, idx === 0, idx === 0)}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {pageTarget !== 'auto' && (
                    <div className="mt-2 text-center">
                        <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            Spacing compressed for <strong>{pageTarget}-page</strong> resume — download PDF to verify fit
                        </span>
                    </div>
                )}
            </div>
        );
    }

    /* ─── EDIT MODE ────────────────────────────────────── */
    return (
        <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-800">Editing Mode</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setShowContactEditor(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 cursor-pointer">
                        <User className="w-3.5 h-3.5" />Contact Links
                    </button>
                    <button onClick={addSection}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 cursor-pointer">
                        <Plus className="w-3.5 h-3.5" />Add Section
                    </button>
                    <button onClick={handleSave}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer ${savedMsg ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                        <Save className="w-3.5 h-3.5" />{savedMsg ? "Saved!" : "Save"}
                    </button>
                    <button onClick={async () => {
                        setGrammarLoading(true); setGrammarOpen(true);
                        try {
                            const allText = sections.map(s => s.content).join('\n\n');
                            const apiKey = localStorage.getItem('vibrant-groq-api-key') || '';
                            const res = await fetch('/api/grammar', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text: allText, apiKey }),
                            });
                            const data = await res.json();
                            setGrammarIssues(data.success ? data.issues : []);
                        } catch { setGrammarIssues([]); }
                        setGrammarLoading(false);
                    }}
                        disabled={grammarLoading}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer ${grammarLoading ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'}`}>
                        {grammarLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SpellCheck className="w-3.5 h-3.5" />}
                        {grammarLoading ? 'Checking...' : 'Grammar'}
                    </button>
                    <button onClick={() => setIsEditing(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />Preview
                    </button>
                </div>
            </div>

            {/* Grammar Issues Panel */}
            {grammarOpen && (
                <div className="mb-4 bg-white rounded-lg border border-amber-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50 border-b border-amber-100">
                        <div className="flex items-center gap-2">
                            <SpellCheck className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-800">Grammar Check</span>
                            {!grammarLoading && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${grammarIssues.length === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {grammarIssues.length === 0 ? '✓ No issues found' : `${grammarIssues.length} issue${grammarIssues.length > 1 ? 's' : ''}`}
                                </span>
                            )}
                        </div>
                        <button onClick={() => setGrammarOpen(false)} className="p-1 rounded hover:bg-amber-100 text-amber-600 cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>
                    {grammarLoading ? (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                            Analyzing your resume for grammar, spelling, and style issues...
                        </div>
                    ) : grammarIssues.length > 0 ? (
                        <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                            {grammarIssues.map((issue, i) => {
                                const typeColors: Record<string, string> = {
                                    grammar: 'bg-red-100 text-red-700',
                                    spelling: 'bg-orange-100 text-orange-700',
                                    punctuation: 'bg-yellow-100 text-yellow-700',
                                    style: 'bg-purple-100 text-purple-700',
                                    clarity: 'bg-blue-100 text-blue-700',
                                };
                                return (
                                    <div key={i} className="px-4 py-2.5 hover:bg-gray-50 flex items-start gap-3">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase shrink-0 mt-0.5 ${typeColors[issue.type] || 'bg-gray-100 text-gray-600'}`}>{issue.type}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs">
                                                <span className="line-through text-red-500 mr-1">{issue.original}</span>
                                                <span className="text-green-600 font-medium">→ {issue.suggestion}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{issue.explanation}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const updated = sections.map(s => ({
                                                    ...s,
                                                    content: s.content.split(issue.original).join(issue.suggestion)
                                                }));
                                                commitChanges(updated);
                                                setGrammarIssues(prev => prev.filter((_, idx) => idx !== i));
                                            }}
                                            className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 cursor-pointer"
                                            title="Apply fix"
                                        >
                                            <Check className="w-3 h-3" />Fix
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Sections */}
            <div className="space-y-3">
                {sections.map((section, index) => (
                    <div key={section.id}
                        draggable={editingSection !== section.id}
                        onDragStart={() => setDraggedIdx(index)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverIdx(index); }}
                        onDrop={(e) => { e.preventDefault(); if (draggedIdx !== null && draggedIdx !== index) { const ns = [...sections]; const [r] = ns.splice(draggedIdx, 1); ns.splice(index, 0, r); commitChanges(ns); } setDraggedIdx(null); setDragOverIdx(null); }}
                        onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
                        className={`bg-white rounded-xl border transition-all duration-200 ${dragOverIdx === index ? "border-blue-400 ring-2 ring-blue-200" : draggedIdx === index ? "opacity-50 border-gray-300" : "border-gray-200 hover:border-gray-300"}`}
                    >
                        {/* Section top bar */}
                        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 rounded-t-xl flex-wrap gap-y-1">
                            <div className="flex items-center gap-2 min-w-0">
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing shrink-0" />
                                <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">{getSectionLabel(section.content)}</span>
                                {section.twoColumn && <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">2-COL</span>}
                            </div>

                            <div className="flex items-center gap-0.5 flex-wrap">
                                {/* Move */}
                                <button onClick={() => move(index, "up")} disabled={index === 0} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" title="Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                                <button onClick={() => move(index, "down")} disabled={index === sections.length - 1} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" title="Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                                <div className="w-px h-4 bg-gray-200 mx-0.5" />
                                {/* Columns */}
                                <button onClick={() => setProp(section.id, { twoColumn: !section.twoColumn })}
                                    className={`p-1.5 rounded-md cursor-pointer ${section.twoColumn ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`} title="Toggle 2 columns"><Columns className="w-3.5 h-3.5" /></button>
                                {/* Hide Markers */}
                                <button onClick={() => setProp(section.id, { hideMarkers: !section.hideMarkers })}
                                    className={`p-1.5 rounded-md cursor-pointer ${section.hideMarkers ? 'text-rose-600 bg-rose-50' : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'}`} title={section.hideMarkers ? 'Markers hidden (click to show)' : 'Hide bullet/decorative markers'}><List className="w-3.5 h-3.5" /></button>
                                {/* Colors */}
                                <button onClick={() => togglePanel(section.id, "colors")}
                                    className={`p-1.5 rounded-md cursor-pointer ${activePanel?.id === section.id && activePanel.panel === 'colors' ? 'text-violet-600 bg-violet-50' : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'}`} title="Colors"><Palette className="w-3.5 h-3.5" /></button>
                                {/* Link */}
                                <button onClick={() => { setLinkModal({ sectionId: section.id }); setLinkText(""); setLinkUrl(""); }}
                                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer" title="Add link"><Link2 className="w-3.5 h-3.5" /></button>
                                {/* Edit */}
                                {editingSection !== section.id && (
                                    <button onClick={() => startEditing(section)} className="p-1.5 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer" title="Edit text"><Pencil className="w-3.5 h-3.5" /></button>
                                )}
                                {/* Delete */}
                                {sections.length > 1 && (
                                    <button onClick={() => delSection(section.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                )}
                            </div>
                        </div>

                        {/* Alignment rows */}
                        <div className="flex items-center gap-4 px-3 py-1.5 bg-gray-50/50 border-b border-gray-100 flex-wrap">
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-400 font-medium w-14">Heading:</span>
                                {ALIGN_OPTS.map((o) => (
                                    <button key={`ha-${o.v}`} onClick={() => setProp(section.id, { headingAlignment: o.v })}
                                        className={`p-1 rounded cursor-pointer ${section.headingAlignment === o.v ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`} title={`Heading ${o.label}`}>{o.icon}</button>
                                ))}
                            </div>
                            <div className="w-px h-4 bg-gray-200" />
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-400 font-medium w-14">Content:</span>
                                {ALIGN_OPTS.map((o) => (
                                    <button key={`ca-${o.v}`} onClick={() => setProp(section.id, { contentAlignment: o.v })}
                                        className={`p-1 rounded cursor-pointer ${section.contentAlignment === o.v ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`} title={`Content ${o.label}`}>{o.icon}</button>
                                ))}
                            </div>
                        </div>

                        {/* Font size row */}
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50/30 border-b border-gray-100 flex-wrap text-[10px]">
                            <div className="flex items-center gap-1">
                                <span className="text-gray-400 font-medium w-16">H font:</span>
                                {([{ v: 0, l: 'Auto' }, { v: 10, l: '10' }, { v: 12, l: '12' }, { v: 14, l: '14' }, { v: 16, l: '16' }, { v: 18, l: '18' }, { v: 20, l: '20' }] as const).map(({ v, l }) => (
                                    <button key={v} onClick={() => setProp(section.id, { headingFontSize: v === 0 ? undefined : (section.headingFontSize === v ? undefined : v) })}
                                        className={`px-1.5 py-0.5 rounded cursor-pointer border ${(v === 0 && !section.headingFontSize) || section.headingFontSize === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'}`}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                            <div className="w-px h-4 bg-gray-200" />
                            <div className="flex items-center gap-1">
                                <span className="text-gray-400 font-medium w-16">P font:</span>
                                {([{ v: 0, l: 'Auto' }, { v: 8, l: '8' }, { v: 9, l: '9' }, { v: 10, l: '10' }, { v: 11, l: '11' }, { v: 12, l: '12' }, { v: 14, l: '14' }] as const).map(({ v, l }) => (
                                    <button key={v} onClick={() => setProp(section.id, { contentFontSize: v === 0 ? undefined : (section.contentFontSize === v ? undefined : v) })}
                                        className={`px-1.5 py-0.5 rounded cursor-pointer border ${(v === 0 && !section.contentFontSize) || section.contentFontSize === v ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-500 border-gray-200 hover:border-purple-400'}`}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Spacing row */}
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50/30 border-b border-gray-100 flex-wrap text-[10px]">
                            <div className="flex items-center gap-1">
                                <span className="text-gray-400 font-medium w-16">Line space:</span>
                                {([{ v: 1.1, label: 'Tight' }, { v: 1.45, label: 'Normal' }, { v: 1.8, label: 'Relaxed' }] as const).map(({ v, label }) => (
                                    <button key={v} onClick={() => setProp(section.id, { lineSpacing: section.lineSpacing === v ? undefined : v })}
                                        className={`px-2 py-0.5 rounded cursor-pointer border ${(section.lineSpacing === v || (!section.lineSpacing && v === 1.45)) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-400'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <div className="w-px h-4 bg-gray-200" />
                            <div className="flex items-center gap-1">
                                <span className="text-gray-400 font-medium w-14">Gap above:</span>
                                {([{ v: 0, l: 'None' }, { v: 8, l: 'S' }, { v: 16, l: 'M' }, { v: 32, l: 'L' }] as const).map(({ v, l }) => (
                                    <button key={v} onClick={() => setProp(section.id, { sectionGap: section.sectionGap === v ? undefined : v })}
                                        className={`px-2 py-0.5 rounded cursor-pointer border ${section.sectionGap === v ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-500 border-gray-200 hover:border-amber-400'}`}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Panel */}
                        {activePanel?.id === section.id && activePanel.panel === "colors" && (
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 space-y-3">
                                {[
                                    { label: "Heading Color", prop: "headingColor", presets: COLOR_PRESETS, isBg: false },
                                    { label: "Content Color", prop: "contentColor", presets: COLOR_PRESETS, isBg: false },
                                    { label: "Heading Background", prop: "headingBgColor", presets: BG_PRESETS, isBg: true },
                                    { label: "Bullet Background", prop: "bulletBgColor", presets: BG_PRESETS, isBg: true },
                                ].map(({ label, prop, presets, isBg }) => (
                                    <div key={prop}>
                                        <p className="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {presets.map((c, ci) => {
                                                const val = typeof c === 'string' ? c : (c as any).value;
                                                const isNone = val === "";
                                                const curVal = (section as any)[prop];
                                                return (
                                                    <button key={ci} onClick={() => setProp(section.id, { [prop]: val || undefined })}
                                                        className={`w-5 h-5 rounded-full border hover:scale-110 transition-transform cursor-pointer ${curVal === val || (!curVal && isNone) ? 'ring-2 ring-blue-400 border-blue-400' : 'border-gray-200'}`}
                                                        style={{ backgroundColor: val || '#fff' }} title={isNone ? "None" : (typeof c === 'string' ? c : (c as any).label)}>
                                                        {isNone && <X className="w-2.5 h-2.5 text-gray-400 mx-auto my-auto" />}
                                                    </button>
                                                );
                                            })}
                                            <input type="color" value={(section as any)[prop] || (isBg ? '#dbeafe' : '#2563eb')}
                                                onChange={(e) => setProp(section.id, { [prop]: e.target.value })}
                                                className="w-5 h-5 rounded cursor-pointer border border-gray-200" title="Custom" />
                                            <button onClick={() => setProp(section.id, { [prop]: undefined })}
                                                className="px-1.5 text-[9px] rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer">Reset</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Section body */}
                        <div className="p-4">
                            {editingSection === section.id ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-1 p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                        <button onClick={() => wrapSelected("**", "**")} className="p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-white cursor-pointer" title="Bold"><Bold className="w-4 h-4" /></button>
                                        <button onClick={() => wrapSelected("*", "*")} className="p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-white cursor-pointer" title="Italic"><Italic className="w-4 h-4" /></button>
                                        <button onClick={() => wrapSelected("<u>", "</u>")} className="p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-white cursor-pointer" title="Underline"><Underline className="w-4 h-4" /></button>
                                        <div className="w-px h-5 bg-gray-200 mx-1" />
                                        <span className="text-[10px] text-gray-400">Select text → click format</span>
                                    </div>
                                    <textarea ref={textareaRef} value={editText} onChange={(e) => setEditText(e.target.value)}
                                        className="w-full min-h-[180px] p-3 rounded-lg border border-gray-200 font-mono text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y bg-gray-50" />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer">Cancel</button>
                                        <button onClick={saveEdit} className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div className={`prose prose-sm max-w-none ${cls.wrapper}`} style={customStyles}>
                                    {section.twoColumn ? (
                                        <>
                                            <div className={ac(section.headingAlignment)}>{renderMd(getSectionHeading(section.content), section)}</div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {(() => { const [c1, c2] = splitForColumns(section.content); return (<><div className={ac(section.contentAlignment)}>{renderMd(c1, section)}</div><div className={ac(section.contentAlignment)}>{renderMd(c2, section)}</div></>); })()}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={ac(section.headingAlignment)}>
                                                {(() => { const m = section.content.match(/^(#{1,3}\s+.+)/m); return m ? renderMd(m[1], section) : null; })()}
                                            </div>
                                            <div className={ac(section.contentAlignment)}>
                                                {renderMd(section.content.replace(/^#{1,3}\s+.+\n?/, ""), section)}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Link Modal */}
            {linkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Link2 className="w-5 h-5 text-blue-600" />Add Link</h3>
                            <button onClick={() => setLinkModal(null)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                                <input type="text" value={linkText} onChange={(e) => setLinkText(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="e.g. My Portfolio" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="https://..." /></div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setLinkModal(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 cursor-pointer">Cancel</button>
                                <button onClick={addLink} disabled={!linkText || !linkUrl} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer">Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Editor Modal */}
            {showContactEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><User className="w-5 h-5 text-blue-600" />Contact Links</h3>
                            <button onClick={() => setShowContactEditor(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="mb-5 flex justify-between items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                            <div className="text-xs text-blue-700 font-medium">Use your saved info from settings</div>
                            <button
                                onClick={() => {
                                    try {
                                        const saved = localStorage.getItem("vibrant-user-profile");
                                        if (saved) {
                                            const p = JSON.parse(saved);
                                            setContactInfo({
                                                ...contactInfo,
                                                phone: p.phone || contactInfo.phone,
                                                email: p.email || contactInfo.email,
                                                location: p.location || contactInfo.location,
                                                linkedin: p.linkedin || contactInfo.linkedin,
                                                github: p.github || contactInfo.github,
                                                portfolio: p.portfolio || contactInfo.portfolio,
                                            });
                                        } else {
                                            alert("No profile found in Settings.");
                                        }
                                    } catch { /**/ }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer shadow-sm active:scale-95"
                            >
                                <User className="w-3.5 h-3.5" />
                                Sync Profile
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mb-3">Links appear below your name in the resume with icons.</p>
                        {/* Alignment */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Alignment</p>
                            <div className="flex gap-1">
                                {([
                                    { v: "left" as const, icon: <AlignLeft className="w-3.5 h-3.5" />, label: "Left" },
                                    { v: "center" as const, icon: <AlignCenter className="w-3.5 h-3.5" />, label: "Center" },
                                    { v: "right" as const, icon: <AlignRight className="w-3.5 h-3.5" />, label: "Right" },
                                    { v: "justify" as const, icon: <AlignJustify className="w-3.5 h-3.5" />, label: "Justify" },
                                ]).map(({ v, icon, label }) => (
                                    <button key={v} onClick={() => setContactAlignment(v)}
                                        className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${contactAlignment === v
                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                                            }`}>
                                        {icon}
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { key: "phone", label: "Phone Number", icon: <Phone className="w-4 h-4" />, ph: "+1 234 567 8900" },
                                { key: "email", label: "Email Address", icon: <Mail className="w-4 h-4" />, ph: "your@email.com" },
                                { key: "location", label: "Location", icon: <MapPin className="w-4 h-4" />, ph: "City, State / Country" },
                                { key: "linkedin", label: "LinkedIn URL", icon: <LinkedInIcon />, ph: "https://linkedin.com/in/..." },
                                { key: "github", label: "GitHub URL", icon: <GitHubIcon />, ph: "https://github.com/..." },
                                { key: "portfolio", label: "Portfolio URL", icon: <Globe className="w-4 h-4" />, ph: "https://yourportfolio.com" },
                                { key: "website", label: "Website URL", icon: <Globe className="w-4 h-4" />, ph: "https://yourwebsite.com" },
                                { key: "leetcode", label: "LeetCode URL", icon: <LeetCodeIcon />, ph: "https://leetcode.com/..." },
                            ].map(({ key, label, icon, ph }) => (
                                <div key={key} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">{icon}</div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-600 mb-0.5">{label}</label>
                                        <input type="text" value={(contactInfo as Record<string, string>)[key] || ""}
                                            onChange={(e) => setContactInfo({ ...contactInfo, [key]: e.target.value })}
                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            placeholder={ph} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
                            <button onClick={() => setShowContactEditor(false)} className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 cursor-pointer">Cancel</button>
                            <button onClick={() => applyContact(contactInfo)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer inline-flex items-center gap-1.5">
                                <Save className="w-3.5 h-3.5" />Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
