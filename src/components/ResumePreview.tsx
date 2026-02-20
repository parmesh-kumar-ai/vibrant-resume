"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ResumeTheme, CustomTemplate } from "@/lib/types";

interface ResumePreviewProps {
    content: string;
    theme?: ResumeTheme;
}

export default function ResumePreview({ content, theme = 'modern' }: ResumePreviewProps) {
    const [customTemplate, setCustomTemplate] = useState<CustomTemplate | null>(null);

    useEffect(() => {
        if (!theme) return;
        try {
            const saved = localStorage.getItem('vibrant-custom-templates');
            if (saved) {
                const templates: CustomTemplate[] = JSON.parse(saved);
                const found = templates.find(t => t.id === theme);
                setCustomTemplate(found || null);
            }
        } catch { /**/ }
    }, [theme]);

    const getThemeClasses = () => {
        const builtIn = theme as string;

        switch (builtIn) {
            case 'classic':
                return {
                    wrapper: "font-serif bg-white text-slate-900",
                    h1: "text-3xl font-bold border-b-2 border-slate-900 pb-2 mb-4 text-center uppercase tracking-widest",
                    h2: "text-lg font-bold uppercase border-b border-slate-300 pb-1 mt-6 mb-3",
                    h3: "text-base font-bold mt-4 mb-2 text-slate-800",
                    p: "mb-3 leading-relaxed text-justify",
                    ul: "list-disc pl-5 space-y-1 mb-4 marker:text-slate-400",
                    li: "text-sm leading-relaxed",
                    strong: "font-semibold text-slate-900",
                };
            case 'minimal':
                return {
                    wrapper: "font-sans bg-white text-slate-800",
                    h1: "text-4xl font-light mb-6 text-center tracking-tight",
                    h2: "text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-8 mb-4",
                    h3: "text-sm font-semibold mt-4 mb-2 text-slate-600",
                    p: "mb-4 leading-7 text-sm",
                    ul: "list-disc pl-5 space-y-1 mb-4 marker:text-slate-300",
                    li: "text-sm leading-relaxed",
                    strong: "font-medium text-slate-800",
                };
            case 'executive':
                return {
                    wrapper: "font-sans bg-white text-gray-900",
                    h1: "text-3xl font-extrabold uppercase tracking-wider text-center mb-2 text-gray-900 border-b-4 border-blue-800 pb-3",
                    h2: "text-base font-bold uppercase tracking-widest text-blue-800 mt-8 mb-3 bg-blue-50 px-3 py-1.5 rounded",
                    h3: "text-base font-bold mt-4 mb-2 text-gray-800",
                    p: "mb-3 leading-relaxed text-gray-700 text-sm",
                    ul: "list-none pl-4 space-y-1.5 mb-4",
                    li: "text-sm leading-relaxed relative pl-4 before:content-['▸'] before:absolute before:left-0 before:text-blue-800 before:font-bold",
                    strong: "font-bold text-gray-900",
                };
            case 'creative':
                return {
                    wrapper: "font-sans bg-white text-gray-800",
                    h1: "text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500",
                    h2: "text-lg font-bold mt-8 mb-3 text-violet-700 border-l-4 border-violet-400 pl-3",
                    h3: "text-base font-bold mt-4 mb-2 text-pink-600",
                    p: "mb-3 leading-relaxed text-gray-600",
                    ul: "list-none pl-4 space-y-1.5 mb-4",
                    li: "text-sm leading-relaxed relative pl-4 before:content-['●'] before:absolute before:left-0 before:text-violet-400",
                    strong: "font-bold text-violet-800",
                };
            case 'tech':
                return {
                    wrapper: "font-mono bg-slate-950 text-green-100",
                    h1: "text-2xl font-bold mb-4 text-green-400 border-b border-green-800 pb-2 before:content-['$_'] before:text-green-600 before:mr-2",
                    h2: "text-base font-bold mt-8 mb-3 text-cyan-400 before:content-['##_'] before:text-cyan-700",
                    h3: "text-sm font-bold mt-4 mb-2 text-yellow-400",
                    p: "mb-3 leading-relaxed text-slate-300 text-sm",
                    ul: "list-none pl-4 space-y-1 mb-4",
                    li: "text-sm leading-relaxed relative pl-5 before:content-['→'] before:absolute before:left-0 before:text-green-500",
                    strong: "font-bold text-green-300",
                };
            case 'elegant':
                return {
                    wrapper: "font-serif bg-stone-50 text-stone-900",
                    h1: "text-3xl font-light text-center mb-2 tracking-[0.15em] uppercase text-stone-800 after:content-[''] after:block after:w-16 after:h-0.5 after:bg-amber-600 after:mx-auto after:mt-3",
                    h2: "text-sm font-semibold uppercase tracking-[0.2em] text-amber-700 mt-8 mb-3 text-center",
                    h3: "text-base font-semibold mt-4 mb-2 text-stone-700 italic",
                    p: "mb-3 leading-7 text-stone-600 text-sm",
                    ul: "list-none pl-4 space-y-1.5 mb-4",
                    li: "text-sm leading-relaxed relative pl-4 before:content-['◆'] before:absolute before:left-0 before:text-amber-600 before:text-xs",
                    strong: "font-bold text-stone-800",
                };
            case 'corporate':
                return {
                    wrapper: "font-sans bg-white text-gray-900",
                    h1: "text-3xl font-bold mb-2 text-white bg-indigo-800 px-4 py-3 rounded-lg -mx-4",
                    h2: "text-base font-bold uppercase tracking-wider text-indigo-800 mt-6 mb-3 border-b-2 border-indigo-200 pb-1",
                    h3: "text-base font-semibold mt-4 mb-2 text-gray-800",
                    p: "mb-3 leading-relaxed text-gray-700 text-sm",
                    ul: "list-none pl-4 space-y-1.5 mb-4",
                    li: "text-sm leading-relaxed relative pl-4 before:content-['■'] before:absolute before:left-0 before:text-indigo-600 before:text-xs",
                    strong: "font-bold text-gray-900",
                };
            case 'bold':
                return {
                    wrapper: "font-sans bg-gray-50 text-gray-900",
                    h1: "text-4xl font-black uppercase mb-3 text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 text-white px-5 py-4 -mx-4 rounded-lg",
                    h2: "text-lg font-extrabold uppercase tracking-wide text-orange-600 mt-6 mb-3 border-l-4 border-orange-500 pl-3",
                    h3: "text-base font-bold mt-4 mb-2 text-gray-800",
                    p: "mb-3 leading-relaxed text-gray-600 text-sm",
                    ul: "list-none pl-4 space-y-1.5 mb-4",
                    li: "text-sm leading-relaxed relative pl-4 before:content-['▶'] before:absolute before:left-0 before:text-orange-500 before:text-xs",
                    strong: "font-black text-gray-900",
                };
            case 'modern':
                return {
                    wrapper: "font-sans bg-white text-slate-900",
                    h1: "text-3xl font-bold uppercase text-blue-600 border-b-2 border-blue-100 pb-2 mb-4",
                    h2: "text-xl font-bold text-slate-700 mt-6 mb-3 flex items-center after:content-[''] after:flex-1 after:h-px after:bg-slate-200 after:ml-4",
                    h3: "text-lg font-bold mt-4 mb-2 text-slate-800",
                    p: "mb-3 leading-relaxed text-slate-600",
                    ul: "list-disc pl-5 space-y-1 mb-4 marker:text-slate-400",
                    li: "text-sm leading-relaxed",
                    strong: "font-semibold text-slate-900",
                };
            default:
                if (customTemplate) {
                    return {
                        wrapper: `text-gray-900`,
                        h1: `text-3xl font-bold mb-4 border-b-2`,
                        h2: `text-xl font-bold mt-6 mb-3`,
                        h3: `text-lg font-bold mt-4 mb-2`,
                        p: "mb-3 leading-relaxed text-sm",
                        ul: "list-disc pl-5 space-y-1 mb-4",
                        li: "text-sm leading-relaxed",
                        strong: "font-semibold",
                    };
                }
                return {
                    wrapper: "font-sans bg-white text-slate-900",
                    h1: "text-3xl font-bold uppercase text-blue-600 border-b-2 border-blue-100 pb-2 mb-4",
                    h2: "text-xl font-bold text-slate-700 mt-6 mb-3 flex items-center after:content-[''] after:flex-1 after:h-px after:bg-slate-200 after:ml-4",
                    h3: "text-lg font-bold mt-4 mb-2 text-slate-800",
                    p: "mb-3 leading-relaxed text-slate-600",
                    ul: "list-disc pl-5 space-y-1 mb-4 marker:text-slate-400",
                    li: "text-sm leading-relaxed",
                    strong: "font-semibold text-slate-900",
                };
        }
    };

    const classes = getThemeClasses();

    const customStyles = customTemplate ? {
        backgroundColor: customTemplate.bgColor,
        color: customTemplate.textColor,
        fontFamily: customTemplate.fontFamily,
    } : {};

    return (
        <div className={`p-8 rounded-sm shadow-2xl min-h-[800px] prose prose-slate max-w-none transition-all duration-300 ${classes.wrapper}`} style={customStyles}>
            {customTemplate?.profilePic?.url && (
                <div className="flex justify-center mb-6">
                    <img
                        src={customTemplate.profilePic.url}
                        alt="Profile"
                        className={`w-24 h-24 object-cover border-4 border-white shadow-lg ${customTemplate.profilePic.shape === 'circle' ? 'rounded-full' : 'rounded-xl'}`}
                    />
                </div>
            )}

            <ReactMarkdown
                components={{
                    h1: ({ ...props }) => <h1 className={classes.h1} style={{ color: customTemplate?.headingColor, borderColor: customTemplate?.headingColor ? `${customTemplate.headingColor}30` : undefined }} {...props} />,
                    h2: ({ ...props }) => <h2 className={classes.h2} style={{ color: customTemplate?.accentColor, borderLeftColor: customTemplate?.accentColor }} {...props} />,
                    h3: ({ ...props }) => <h3 className={classes.h3} style={{ color: customTemplate?.accentColor }} {...props} />,
                    ul: ({ ...props }) => <ul className={classes.ul} {...props} />,
                    li: ({ ...props }) => <li className={classes.li} {...props} />,
                    p: ({ ...props }) => <p className={classes.p} {...props} />,
                    strong: ({ ...props }) => <strong className={classes.strong} {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
