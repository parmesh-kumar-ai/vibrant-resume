import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: NextRequest) {
    try {
        const { text, apiKey: bodyKey } = await req.json();
        const apiKey = bodyKey || process.env.GROQ_API_KEY || 'XXXXXXXXXXXXXXXXXXXXxxxxxxxxxxxxxXXXXXXXXXXXX';

        if (!text) {
            return NextResponse.json({ success: false, error: 'No text provided.' }, { status: 400 });
        }
        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'API Key is required.' }, { status: 400 });
        }

        const groq = new Groq({ apiKey });

        const prompt = `You are a professional grammar and writing quality checker for resumes. Analyze the following resume text and return a JSON array of issues found.

For each issue, provide:
- "original": the exact text with the error (a short phrase, not the whole sentence)
- "suggestion": the corrected text
- "type": one of "grammar", "spelling", "punctuation", "style", "clarity"
- "explanation": a brief explanation of the issue (1 sentence max)

Rules:
- Only flag REAL errors or meaningful improvements. Do NOT flag proper nouns, company names, technical terms, or abbreviations.
- Do NOT suggest changes to factual content or numbers.
- Focus on grammar mistakes, typos, awkward phrasing, passive voice, weak verbs, and unclear sentences.
- If the text is perfect, return an empty array [].
- Return ONLY raw JSON array, no markdown, no code blocks.

Resume text to check:
"""
${text}
"""`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_completion_tokens: 2048,
        });

        const raw = completion.choices[0]?.message?.content || '[]';
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();

        let issues;
        try {
            issues = JSON.parse(cleaned);
        } catch {
            issues = [];
        }

        return NextResponse.json({ success: true, issues });
    } catch (error: any) {
        console.error('Grammar check error:', error);
        return NextResponse.json({
            success: false,
            error: 'Grammar check failed: ' + (error.message || 'Unknown error'),
        }, { status: 500 });
    }
}
