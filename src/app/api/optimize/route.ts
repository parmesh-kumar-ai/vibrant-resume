import { NextRequest, NextResponse } from 'next/server';
import { ResumeOptimizerRequest } from '@/lib/types';
import Groq from 'groq-sdk';

export async function POST(req: NextRequest) {
    try {
        const body: ResumeOptimizerRequest = await req.json();
        const { candidateProfile, jobDescription } = body;
        const apiKey = body.apiKey || process.env.GROQ_API_KEY || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

        console.log("Analyzing request...", { hasProfile: !!candidateProfile, hasJD: !!jobDescription, hasKey: !!apiKey });

        if (!candidateProfile || !jobDescription) {
            return NextResponse.json(
                { success: false, error: 'Candidate Profile and Job Description are required.' },
                { status: 400 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'API Key is required. Please provide a Groq API key.' },
                { status: 400 }
            );
        }

        try {
            const groq = new Groq({ apiKey });

            const prompt = `You are an expert Resume Optimizer and Career Coach. Your task is to rewrite a candidate's resume to perfectly align with a specific Job Description (JD).

**Input:**
1. **Candidate Profile/Resume:**
${candidateProfile}

2. **Job Description:**
${jobDescription}

**Instructions:**
1. **Analyze**: Compare the candidate's profile against the JD. Identify missing keywords, skills, and qualifications.
2. **Rewrite**:
   - Rewrite the "Professional Summary" to be high-impact and relevant to the JD.
   - Rewrite distinct bullet points in "Professional Experience" using the STAR method (Situation, Task, Action, Result) and strong action verbs. Quantify achievements where possible.
   - Ensure keywords from the JD are naturally integrated.
3. **Format**: The "optimizedResume" field MUST be in clean Markdown format. Do NOT use generic placeholders like "[Your Name]". Use the name and contact info from the provided Candidate Profile.

**IMPORTANT: JSON Requirements:**
- You MUST return a valid JSON object.
- Escape all special characters, especially newlines (\\n) and double quotes (\\") within string values.
- Do NOT include any text before or after the JSON object.

**Output Structure:**
{
    "originalScore": number (0-100),
    "matchScore": number (0-100),
    "missingKeywords": string[] (3-5 items),
    "optimizedResume": "Complete Markdown string",
    "commitedChanges": string[] (3-4 items)
}`;

            console.log("Calling Groq API with llama-3.3-70b-versatile (JSON Mode enabled)...");
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.6,
                max_completion_tokens: 4096,
                response_format: { type: "json_object" }
            });

            const responseText = chatCompletion.choices[0]?.message?.content || "";
            console.log("Groq Response received.");

            const optimizedData = JSON.parse(responseText);

            return NextResponse.json({
                success: true,
                data: optimizedData
            });

        } catch (error: any) {
            console.error("Groq API Error:", error);
            return NextResponse.json({
                success: false,
                error: "AI Optimization failed: " + (error.message || "Unknown error"),
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
