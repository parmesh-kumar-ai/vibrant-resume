export interface ResumeOptimizerRequest {
    candidateProfile: string;
    jobDescription: string;
    apiKey?: string;
    provider?: 'gemini' | 'openai';
}

export interface ResumeOptimizerResponse {
    success: boolean;
    data?: {
        matchScore: number;
        originalScore: number;
        missingKeywords: string[];
        optimizedResume: string;
        commitedChanges: string[];
    };
    error?: string;
}

export type ResumeTheme = 'modern' | 'classic' | 'minimal' | 'executive' | 'creative' | 'tech' | 'elegant' | 'corporate' | 'bold' | 'custom' | string;

export interface CustomTemplate {
    id: string;
    name: string;
    headingColor: string;
    accentColor: string;
    bgColor: string;
    textColor: string;
    fontFamily: string;
    profilePic?: {
        url: string;
        shape: 'circle' | 'rectangle';
        source: 'link' | 'local';
        position?: 'top-center' | 'top-left' | 'top-right' | 'inline-left' | 'inline-right';
        size?: number; // Size in px (width/height)
        offsetY?: number; // Vertical offset in px
    };
}

export interface ResumeSection {
    id: string;
    content: string;
    twoColumn?: boolean;
    sectionGap?: number;
    lineSpacing?: number;
    hideMarkers?: boolean;
    headingAlignment?: 'left' | 'center' | 'right' | 'justify';
    contentAlignment?: 'left' | 'center' | 'right' | 'justify';
    headingColor?: string;
    headingBgColor?: string;
    contentColor?: string;
    bulletBgColor?: string;
}

export interface ContactInfo {
    phone?: string;
    location?: string;
    email?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
    leetcode?: string;
}

export interface HistoryItem {
    id: string;
    timestamp: string;
    name: string;
    sections: ResumeSection[];
    contactInfo: ContactInfo;
    contactAlignment: "left" | "center" | "right" | "justify";
    pageTarget: 'auto' | '1' | '2' | '3';
    globalFont: string;
    theme: ResumeTheme;
    // Optimization metrics for full restoration
    matchScore: number;
    originalScore: number;
    missingKeywords: string[];
    commitedChanges: string[];
}
