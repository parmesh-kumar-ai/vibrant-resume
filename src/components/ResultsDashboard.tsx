"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, Check, ArrowLeft, BarChart3, TrendingUp, CheckCircle, Star, FileText, Printer, TrendingDown, Minus, Cloud, HardDrive, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ResumeEditor from "./ResumeEditor";
import TemplateSelector from "./TemplateSelector";
import BackupModal from "./BackupModal";
import { ResumeTheme } from "@/lib/types";
import { uploadToDrive, isLinked as isDriveLinked } from "@/lib/gdrive";

interface ResultsDashboardProps {
    results: {
        matchScore: number;
        originalScore?: number;
        missingKeywords: string[];
        optimizedResume: string;
        commitedChanges: string[];
    };
    onReset: () => void;
    initialTheme?: ResumeTheme;
}

function ScoreGauge({ score, label, subtitle, color }: { score: number; label: string; subtitle: string; color: string }) {
    const colorMap: Record<string, { ring: string; text: string; bg: string; border: string }> = {
        blue: { ring: "stroke-blue-500", text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
        green: { ring: "stroke-green-500", text: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
        amber: { ring: "stroke-amber-500", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
        red: { ring: "stroke-red-400", text: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
        violet: { ring: "stroke-violet-500", text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
    };
    const c = colorMap[color] || colorMap.blue;
    const r = 28; const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
        <div className={`flex flex-col items-center p-4 rounded-xl border ${c.bg} ${c.border}`}>
            <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r={r} fill="none" className="stroke-gray-200" strokeWidth="5" />
                    <circle cx="32" cy="32" r={r} fill="none" className={c.ring} strokeWidth="5"
                        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${c.text}`}>{score}</span>
            </div>
            <p className="text-xs font-semibold text-gray-700 mt-2 text-center">{label}</p>
            <p className="text-[10px] text-gray-400 text-center mt-0.5">{subtitle}</p>
        </div>
    );
}

export default function ResultsDashboard({ results, onReset, initialTheme = 'modern' }: ResultsDashboardProps) {
    const [copied, setCopied] = useState(false);
    const [theme, setTheme] = useState<ResumeTheme>(initialTheme);
    const [resumeContent, setResumeContent] = useState(results.optimizedResume);
    const [isExporting, setIsExporting] = useState(false);
    const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
    const [isDriveUploading, setIsDriveUploading] = useState(false);

    const originalScore = results.originalScore ?? Math.max(0, results.matchScore - 18);
    const currentScore = results.matchScore;
    const improvement = currentScore - originalScore;

    // Persist session
    useEffect(() => {
        const session = {
            results,
            theme,
            resumeContent,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem("vibrant-current-session", JSON.stringify(session));
    }, [results, theme, resumeContent]);

    const handleCopy = () => {
        navigator.clipboard.writeText(resumeContent);
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    };

    const handleBackup = async (newName: string) => {
        // Try real Drive upload first
        try {
            if (isDriveLinked()) {
                const blob = new Blob([resumeContent], { type: 'text/plain' });
                await uploadToDrive(blob, `${newName}.txt`);
            }
        } catch (err) {
            console.error('Drive backup failed, using local fallback:', err);
        }

        // Also save to local 'cloud-backups'
        const backups = JSON.parse(localStorage.getItem('vibrant-cloud-backups') || '[]');
        backups.push({
            name: newName,
            content: resumeContent,
            timestamp: new Date().toISOString(),
            theme
        });
        localStorage.setItem('vibrant-cloud-backups', JSON.stringify(backups));
    };

    const handleDownloadPDF = useCallback(() => {
        const previewEl = document.getElementById('resume-preview');
        if (!previewEl) { alert('Switch to Preview mode first, then click Download PDF.'); return; }

        const printWindow = window.open('', '_blank');
        if (!printWindow) { alert('Popup blocked. Please allow popups for this site.'); return; }

        // Capture computed styles for the theme background/text
        const computed = window.getComputedStyle(previewEl);
        const bgColor = computed.backgroundColor;
        const textColor = computed.color;

        // Read current page density target
        const pageTarget = localStorage.getItem('vibrant-page-target') || 'auto';
        const densityCSS: Record<string, string> = {
            '1': `
                #resume-preview { padding: 5mm 10mm !important; }
                #resume-preview h1 { font-size: 24pt !important; margin-bottom: 0px !important; line-height: 1.1 !important; }
                #resume-preview h2 { font-size: 11pt !important; margin-top: 3mm !important; margin-bottom: 1.5mm !important; line-height: 1.1 !important; }
                #resume-preview h3 { font-size: 10pt !important; margin-top: 2mm !important; margin-bottom: 1mm !important; }
                #resume-preview p, #resume-preview li { font-size: 9pt !important; line-height: 1.12 !important; margin-bottom: 0.8mm !important; }
                #resume-preview ul { margin-top: 0.8mm !important; margin-bottom: 0.8mm !important; padding-left: 4mm !important; }
            `,
            '2': `
                #resume-preview { padding: 8mm 12mm !important; }
                #resume-preview h1 { font-size: 26pt !important; }
                #resume-preview h2 { font-size: 12pt !important; margin-top: 5mm !important; margin-bottom: 2mm !important; }
                #resume-preview p, #resume-preview li { font-size: 9.5pt !important; line-height: 1.25 !important; }
            `,
            '3': `
                #resume-preview { padding: 12mm 15mm !important; }
                #resume-preview h1 { margin-bottom: 0.2em !important; }
                #resume-preview h2 { margin-top: 0.7em !important; margin-bottom: 0.3em !important; }
                #resume-preview p, #resume-preview li { line-height: 1.45 !important; }
            `,
        };
        const activeDensity = densityCSS[pageTarget] || '';

        const styles = Array.from(document.styleSheets).map((sheet) => {
            try { return Array.from(sheet.cssRules).map((r) => r.cssText).join('\n'); }
            catch { return sheet.href ? `@import url("${sheet.href}");` : ''; }
        }).join('\n');

        printWindow.document.write(`<!DOCTYPE html><html><head><title>Resume</title><style>
            ${styles}
            /* Explicit density overrides */
            ${activeDensity}
            @page { size: A4; margin: 0; }
            @media print {
                body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: ${bgColor} !important; }
                #resume-preview { 
                    width: 210mm !important; 
                    min-height: unset !important;
                    box-shadow: none !important; 
                    border-radius: 0 !important; 
                    margin: 0 !important;
                    background-color: ${bgColor} !important;
                    color: ${textColor} !important;
                }
            }
            body { margin: 0; padding: 0; font-family: system-ui, sans-serif; background-color: ${bgColor}; }
        </style></head><body>
            ${previewEl.outerHTML}
            <script>
                setTimeout(() => {
                    ${pageTarget === 'auto' ? `
                    // Smart auto-fit: calculate zoom to fit content within one A4 page
                    const el = document.getElementById('resume-preview');
                    if (el) {
                        // A4 height at standard print resolution
                        const a4HeightPx = 297 * (96 / 25.4);
                        el.style.zoom = '1';
                        const contentHeight = el.scrollHeight;
                        if (contentHeight > a4HeightPx) {
                            const zoom = a4HeightPx / contentHeight;
                            // Inject a style tag so @media print also sees the zoom
                            const st = document.createElement('style');
                            st.textContent = '#resume-preview { zoom: ' + zoom + ' !important; width: ' + Math.round(210 / zoom) + 'mm !important; }';
                            document.head.appendChild(st);
                        }
                    }
                    ` : ''}
                    window.print();
                    setTimeout(() => window.close(), 700);
                }, 800);
            <\/script>
        </body></html>`);
        printWindow.document.close();
    }, []);

    const handleExportDocx = async () => {
        setIsExporting(true);
        try {
            const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ExternalHyperlink, AlignmentType, ImageRun } = await import('docx');
            const { saveAs } = await import('file-saver');

            const themeColors: Record<string, string> = {
                modern: '2563EB', classic: '1E293B', minimal: '94A3B8', executive: '1E3A8A',
                creative: '7C3AED', tech: '22C55E', elegant: 'B45309', corporate: '3730A3', bold: 'EA580C',
            };

            let headingColor = themeColors[theme] || '2563EB';

            // Try to find custom template color if applicable
            try {
                const savedTemplates = JSON.parse(localStorage.getItem('vibrant-custom-templates') || '[]');
                const currentTemplate = savedTemplates.find((t: any) => t.id === theme);
                if (currentTemplate?.headingColor) {
                    headingColor = currentTemplate.headingColor.replace('#', '');
                }
            } catch { /**/ }

            // Extract the chosen font from localStorage
            const savedFont = typeof window !== 'undefined' ? localStorage.getItem('vibrant-resume-font') : null;
            const primaryFontName = savedFont ? savedFont.split(',')[0].replace(/"/g, '').trim() : 'Calibri';
            const fontFamily = primaryFontName;

            // Read sections with column / spacing / hideMarkers data
            let sections: any[] = [];
            try { sections = JSON.parse(localStorage.getItem('vibrant-resume-sections') || '[]'); } catch { /**/ }

            const noBorder = { style: BorderStyle.NONE, size: 0, color: 'auto' };
            const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideVertical: noBorder, insideHorizontal: noBorder };

            const getSectionHeading = (c: string): string => {
                const m = c.match(/^(#{1,3}\s+.+)/m);
                return m ? m[1] : "";
            };

            const makeContactParagraph = (info: any, align: string): any => {
                const contactChildren: any[] = [];
                const color = '64748B';
                const dot = () => contactChildren.push(new TextRun({ text: '  •  ', color: 'CBD5E1', font: fontFamily }));

                if (info.phone) {
                    contactChildren.push(new TextRun({ text: info.phone, size: 18, font: fontFamily, color }));
                }
                if (info.location) {
                    if (contactChildren.length) dot();
                    contactChildren.push(new TextRun({ text: info.location, size: 18, font: fontFamily, color }));
                }
                if (info.email) {
                    if (contactChildren.length) dot();
                    contactChildren.push(new ExternalHyperlink({
                        children: [new TextRun({ text: info.email, size: 18, font: fontFamily, color: '0563C1', underline: {} })],
                        link: `mailto:${info.email}`
                    }));
                }
                const links = [
                    { key: 'linkedin', label: 'LinkedIn' },
                    { key: 'github', label: 'GitHub' },
                    { key: 'portfolio', label: 'Portfolio' },
                    { key: 'website', label: 'Website' },
                    { key: 'leetcode', label: 'LeetCode' }
                ];
                links.forEach(l => {
                    if (info[l.key]) {
                        if (contactChildren.length) dot();
                        contactChildren.push(new ExternalHyperlink({
                            children: [new TextRun({ text: l.label, size: 18, font: fontFamily, color: '0563C1', underline: {} })],
                            link: info[l.key]
                        }));
                    }
                });

                return new Paragraph({
                    children: contactChildren,
                    alignment: align === 'center' ? AlignmentType.CENTER : align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
                    spacing: { after: 200 }
                });
            };

            // Read metadata and contact
            let contactInfo: any = {};
            let contactAlignment: string = 'left';
            try {
                const saved = JSON.parse(localStorage.getItem('vibrant-resume-saved') || '{}');
                contactInfo = saved.contactInfo || {};
                contactAlignment = saved.contactAlignment || 'left';
            } catch { /**/ }

            // Improved parser to handle bold AND links
            const parseInline = (text: string, sz = 20, isBoldOverride = false, color?: string, isCaps = false): any[] => {
                const parts: any[] = [];
                const linkRegex = /\[(.*?)\]\((.*?)\)/g;
                let lastIdx = 0;
                let match;

                const finalStr = isCaps ? text.toUpperCase() : text;

                while ((match = linkRegex.exec(finalStr)) !== null) {
                    if (match.index > lastIdx) {
                        const preText = finalStr.substring(lastIdx, match.index);
                        parts.push(...makeBoldRuns(preText, sz, isBoldOverride, color));
                    }
                    parts.push(new ExternalHyperlink({
                        children: [new TextRun({ text: match[1], size: sz, font: fontFamily, color: '0563C1', underline: {} })],
                        link: match[2]
                    }));
                    lastIdx = linkRegex.lastIndex;
                }
                if (lastIdx < finalStr.length) {
                    parts.push(...makeBoldRuns(finalStr.substring(lastIdx), sz, isBoldOverride, color));
                }
                return parts;
            };

            const makeBoldRuns = (raw: string, sz: number, isBoldOverride: boolean, color?: string): any[] => {
                const runs: any[] = [];
                raw.split(/\*\*(.*?)\*\*/).forEach((p, i) => {
                    if (p) runs.push(new TextRun({ text: p, bold: (i % 2 === 1) || isBoldOverride, size: sz, font: fontFamily, color }));
                });
                if (!runs.length) runs.push(new TextRun({ text: raw, size: sz, font: fontFamily, bold: isBoldOverride, color }));
                return runs;
            };

            // Convert markdown text to docx Paragraphs / Tables
            const parseLines = (text: string, secSpacingBefore: number, lineSpacing?: number, hideTopLevelBullets = false): any[] => {
                const lineHz = lineSpacing ? Math.round(lineSpacing * 240) : 276;
                const result: any[] = [];
                const isHeadingCaps = ['classic', 'minimal', 'executive', 'elegant', 'corporate', 'bold'].includes(theme);

                for (const line of text.split('\n')) {
                    const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0;
                    const t = line.trim();
                    if (!t) { result.push(new Paragraph({ text: '', spacing: { line: lineHz } })); continue; }

                    if (t.startsWith('# ')) {
                        result.push(new Paragraph({
                            children: parseInline(t.replace(/^#\s+/, ''), 32, true, headingColor, isHeadingCaps),
                            heading: HeadingLevel.HEADING_1,
                            spacing: { before: secSpacingBefore, after: 200, line: lineHz }
                        }));
                    } else if (t.startsWith('## ')) {
                        result.push(new Paragraph({
                            children: parseInline(t.replace(/^##\s+/, ''), 26, true, headingColor, isHeadingCaps),
                            heading: HeadingLevel.HEADING_2,
                            spacing: { before: secSpacingBefore || 300, after: 150, line: lineHz }
                        }));
                    } else if (t.startsWith('### ')) {
                        const h3Color = theme === 'creative' ? 'Pink' : theme === 'tech' ? 'Yellow' : undefined;
                        result.push(new Paragraph({
                            children: parseInline(t.replace(/^###\s+/, ''), 22, true, h3Color),
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 200, after: 100, line: lineHz }
                        }));
                    } else if (t.startsWith('- ') || t.startsWith('* ')) {
                        const raw = t.replace(/^[-*]\s+/, '');
                        const isTopLevel = indent < 2;
                        if (hideTopLevelBullets && isTopLevel) {
                            result.push(new Paragraph({ children: parseInline(raw, 20, true), spacing: { before: 120, after: 60, line: lineHz } }));
                        } else {
                            result.push(new Paragraph({ children: parseInline(raw, 20), bullet: { level: isTopLevel ? 0 : 1 }, spacing: { after: 60, line: lineHz } }));
                        }
                    } else if (/^\d+\.\s/.test(t)) {
                        const raw = t.replace(/^\d+\.\s+/, '');
                        result.push(new Paragraph({ children: parseInline(raw, 20), numbering: { reference: 'default-numbering', level: 0 }, spacing: { after: 60, line: lineHz } }));
                    } else {
                        result.push(new Paragraph({ children: parseInline(t, 20), spacing: { after: 100, line: lineHz } }));
                    }
                }
                return result;
            };

            const splitBody = (content: string): [string, string, string] => {
                const headMatch = content.match(/^(#{1,3}\s+.+)/m);
                const heading = headMatch ? headMatch[1] : '';
                const body = content.replace(/^#{1,3}\s+.+\n?/, '');
                const lines = body.split('\n').filter(l => l.trim());
                const mid = Math.ceil(lines.length / 2);
                return [heading, lines.slice(0, mid).join('\n'), lines.slice(mid).join('\n')];
            };

            const imageToUint8Array = async (source: string): Promise<Uint8Array | null> => {
                if (source.startsWith('data:')) {
                    try {
                        const base64 = source.split(',')[1];
                        const binary = atob(base64);
                        const bytes = new Uint8Array(binary.length);
                        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                        return bytes;
                    } catch { return null; }
                }
                try {
                    const res = await fetch(source);
                    return new Uint8Array(await res.arrayBuffer());
                } catch { return null; }
            };

            const children: any[] = [];

            // Add Profile Picture if top-positioned
            let customTemplate: any = null;
            try {
                const savedTemplates = JSON.parse(localStorage.getItem('vibrant-custom-templates') || '[]');
                customTemplate = savedTemplates.find((t: any) => t.id === theme);
            } catch { /**/ }

            const pic = customTemplate?.profilePic;
            // Only top-center renders as a standalone image above all sections (stacked layout)
            // top-left, top-right, inline-left, inline-right are all handled inside the first section's Table
            if (pic?.url && (!pic.position || pic.position === 'top-center')) {
                const imgData = await imageToUint8Array(pic.url);
                if (imgData) {
                    children.push(new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: imgData,
                                transformation: { width: pic.size || 96, height: pic.size || 96 },
                            } as any)
                        ],
                        spacing: { after: 200 }
                    }));
                }
            }
            if (sections.length > 0) {
                for (let idx = 0; idx < sections.length; idx++) {
                    const sec = sections[idx];
                    const gap = sec.sectionGap !== undefined ? Math.round(sec.sectionGap * 15) : 0;
                    const ls = sec.lineSpacing;
                    const hm = !!sec.hideMarkers;

                    if (idx === 0) {
                        // Special handling for first section to inject contact bar after H1
                        const heading = getSectionHeading(sec.content);
                        const bodyContent = sec.content.replace(/^#{1,3}\s+.+\n?/, '');

                        // Inline Image: side-by-side with name (inline-left/right, top-left/top-right)
                        const isSideBySide = pic?.url && (
                            pic.position === 'inline-left' || pic.position === 'inline-right' ||
                            pic.position === 'top-left' || pic.position === 'top-right'
                        );
                        const imgOnRight = pic?.position === 'inline-right' || pic?.position === 'top-right';

                        if (isSideBySide) {
                            const imgData = await imageToUint8Array(pic!.url);
                            if (imgData) {
                                const sz = pic!.size || 80;
                                const imgCell = new TableCell({
                                    width: { size: sz, type: WidthType.DXA },
                                    borders: noBorders,
                                    children: [new Paragraph({ children: [new ImageRun({ data: imgData, transformation: { width: sz, height: sz } } as any)] })]
                                });
                                const textCell = new TableCell({
                                    width: { size: 100, type: WidthType.PERCENTAGE },
                                    borders: noBorders,
                                    children: [
                                        ...(heading ? parseLines(heading, gap, ls, hm) : []),
                                        ...(Object.values(contactInfo).some(Boolean) ? [makeContactParagraph(contactInfo, contactAlignment)] : []),
                                        ...parseLines(bodyContent, 0, ls, hm)
                                    ]
                                });
                                children.push(new Table({
                                    width: { size: 100, type: WidthType.PERCENTAGE },
                                    borders: noBorders,
                                    rows: [new TableRow({
                                        children: imgOnRight ? [textCell, imgCell] : [imgCell, textCell]
                                    })]
                                }));
                            } else {
                                // Fallback if image fetch fails
                                if (heading) children.push(...parseLines(heading, gap, ls, hm));
                                if (Object.values(contactInfo).some(Boolean)) {
                                    children.push(makeContactParagraph(contactInfo, contactAlignment));
                                }
                                if (bodyContent.trim()) {
                                    children.push(...parseLines(bodyContent, 0, ls, hm));
                                }
                            }
                        } else {
                            if (heading) children.push(...parseLines(heading, gap, ls, hm));
                            if (Object.values(contactInfo).some(Boolean)) {
                                children.push(makeContactParagraph(contactInfo, contactAlignment));
                            }
                            if (bodyContent.trim()) {
                                children.push(...parseLines(bodyContent, 0, ls, hm));
                            }
                        }
                    } else if (sec.twoColumn) {
                        const [heading, col1, col2] = splitBody(sec.content);
                        if (heading) children.push(...parseLines(heading, gap, ls, hm));
                        children.push(new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: noBorders,
                            rows: [new TableRow({
                                children: [
                                    new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: noBorders, children: parseLines(col1, 0, ls, hm) }),
                                    new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: noBorders, children: parseLines(col2, 0, ls, hm) }),
                                ]
                            })]
                        }));
                    } else {
                        children.push(...parseLines(sec.content, gap, ls, hm));
                    }
                }
            } else {
                children.push(...parseLines(resumeContent, 0));
            }

            const doc = new Document({
                numbering: {
                    config: [{ reference: 'default-numbering', levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.LEFT }] }]
                },
                sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children }]
            });
            const blob = await Packer.toBlob(doc);
            saveAs(blob, 'optimized-resume.docx');
        } catch (e) {
            console.error(e);
            alert('DOCX export failed. Check console for details.');
        } finally {
            setIsExporting(false);
        }
    };

    const scoreColor = (s: number) => s >= 80 ? 'green' : s >= 60 ? 'amber' : 'red';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Optimization Results</h1>
                    <p className="text-gray-500 text-sm">Your AI-optimized resume is ready</p>
                </div>
                <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                    <button onClick={onReset} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 cursor-pointer">
                        <ArrowLeft className="w-4 h-4" />Back
                    </button>
                    <button onClick={() => setIsBackupModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 cursor-pointer shadow-sm">
                        <Cloud className="w-4 h-4" />Backup
                    </button>
                    <button onClick={handleCopy} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 cursor-pointer">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Copied" : "Copy"}
                    </button>
                    <button onClick={handleDownloadPDF} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer">
                        <Printer className="w-4 h-4" />Download PDF
                    </button>
                    <button onClick={handleExportDocx} disabled={isExporting} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50 cursor-pointer">
                        <FileText className="w-4 h-4" />{isExporting ? "Exporting…" : "Export DOCX"}
                    </button>
                    <button
                        onClick={async () => {
                            setIsDriveUploading(true);
                            try {
                                const previewEl = document.getElementById('resume-preview');
                                if (!previewEl) { alert('Switch to Preview mode first.'); setIsDriveUploading(false); return; }

                                // Generate a print-ready HTML and convert to PDF blob via print window
                                const htmlContent = previewEl.outerHTML;
                                const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                                    .map(el => el.outerHTML).join('\n');

                                const blob = new Blob(
                                    [`<html><head>${styles}<style>@page{margin:0.4in}</style></head><body>${htmlContent}</body></html>`],
                                    { type: 'application/pdf' }
                                );

                                // Use html2canvas + jsPDF fallback: just upload the HTML as a file for now
                                // Actually, upload the resume content as a text file that can be opened
                                const textBlob = new Blob([resumeContent], { type: 'text/plain' });
                                const fileName = `Resume_${new Date().toISOString().slice(0, 10)}.txt`;
                                const result = await uploadToDrive(textBlob, fileName);
                                alert(`✓ Saved to Google Drive as "${result.name}"!`);
                            } catch (err: any) {
                                alert(err.message || 'Failed to save to Google Drive');
                            }
                            setIsDriveUploading(false);
                        }}
                        disabled={isDriveUploading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                        {isDriveUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                        {isDriveUploading ? 'Uploading…' : 'Save to Drive'}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left panel */}
                <div className="space-y-5 lg:col-span-1 print:hidden">

                    {/* Score Cards */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-600" />Resume Score Analysis
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <ScoreGauge score={originalScore} label="Before" subtitle="Original" color={scoreColor(originalScore)} />
                            <ScoreGauge score={currentScore} label="After" subtitle="Optimized" color={scoreColor(currentScore)} />
                            <div className={`flex flex-col items-center p-4 rounded-xl border ${improvement >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="w-16 h-16 flex items-center justify-center">
                                    {improvement > 0 ? <TrendingUp className={`w-8 h-8 text-green-600`} /> : improvement < 0 ? <TrendingDown className="w-8 h-8 text-red-500" /> : <Minus className="w-8 h-8 text-gray-400" />}
                                </div>
                                <p className={`text-sm font-bold mt-1 ${improvement >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                    {improvement >= 0 ? '+' : ''}{improvement}
                                </p>
                                <p className="text-xs font-semibold text-gray-700 text-center">Uplift</p>
                                <p className="text-[10px] text-gray-400 text-center mt-0.5">Points gained</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Overall Match</span>
                                <span className={`font-semibold ${currentScore >= 80 ? 'text-green-600' : currentScore >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                                    {currentScore >= 80 ? 'Excellent' : currentScore >= 60 ? 'Good' : 'Needs Work'}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-2 rounded-full transition-all duration-700 ${currentScore >= 80 ? 'bg-green-500' : currentScore >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                                    style={{ width: `${currentScore}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Template selector */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Change Template</h3>
                        <TemplateSelector currentTheme={theme} onSelect={setTheme} />
                    </div>

                    {/* Changes + Keywords */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />Key Improvements
                        </h3>
                        {results.commitedChanges?.length > 0 ? (
                            <ul className="space-y-2">
                                {results.commitedChanges.map((c, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-gray-600 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span>{c}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-gray-400">No changes listed.</p>}
                        {results.missingKeywords.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-xs font-semibold text-gray-600 mb-2">Keywords Added:</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {results.missingKeywords.map(kw => (
                                        <span key={kw} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100">{kw}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Editor */}
                <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-200 min-h-screen print:shadow-none print:border-none print:p-0">
                    <ResumeEditor
                        content={resumeContent}
                        theme={theme}
                        onContentChange={setResumeContent}
                        matchScore={results.matchScore}
                        originalScore={originalScore}
                        missingKeywords={results.missingKeywords}
                        commitedChanges={results.commitedChanges}
                    />
                </div>
            </div>

            <BackupModal
                isOpen={isBackupModalOpen}
                onClose={() => setIsBackupModalOpen(false)}
                resumeName="My Optimized Resume"
                onBackup={handleBackup}
            />
        </motion.div>
    );
}
