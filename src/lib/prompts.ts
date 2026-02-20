export function generateOptimizationPrompt(candidateProfile: string, jobDescription: string): string {
    return "You are an elite executive resume strategist and ATS optimization expert. Use the following candidate profile and job description to generate a highly optimized resume.\n\n" +
        "### Candidate Profile:\n" +
        candidateProfile + "\n\n" +
        "### Job Description:\n" +
        jobDescription + "\n\n" +
        "### OBJECTIVE:\n" +
        "Create a resume that maximizes ATS keyword match, aligns achievements with job requirements, and uses quantified, results-driven bullet points.\n\n" +
        "### INSTRUCTIONS:\n\n" +
        "STEP 1: JD Analysis\n" +
        "- Extract required skills, keywords, core competencies, and priority responsibilities.\n\n" +
        "STEP 2: Gap & Match Analysis\n" +
        "- Map candidate experience to JD requirements.\n" +
        "- Identify transferable skills.\n\n" +
        "STEP 3: Resume Creation\n" +
        "Generate the final resume in Markdown format.\n\n" +
        "Structure:\n" +
        "1. Professional Summary (3-4 lines, tailored)\n" +
        "2. Core Competencies (ATS keyword-rich)\n" +
        "3. Professional Experience (Rewrite experience to align with JD, use STAR method, quantify impact)\n" +
        "4. Skills\n" +
        "5. Education\n\n" +
        "### STRICT RULES:\n" +
        "- No generic phrases (\"Responsible for...\"). Use measurement (\"Increased X by Y%\").\n" +
        "- No tables or columns (ATS-safe).\n" +
        "- Optimized keyword density naturally.\n\n" +
        "### OUTPUT FORMAT:\n" +
        "Return a JSON object with the following structure:\n" +
        "{\n" +
        "  \"matchScore\": number (0-100),\n" +
        "  \"missingKeywords\": [\"keyword1\", \"keyword2\"],\n" +
        "  \"optimizedResume\": \"Markdown string of the resume\",\n" +
        "  \"commitedChanges\": [\"Explanation of change 1\", \"Explanation of change 2\"]\n" +
        "}\n" +
        "Ensure the JSON is valid and parsable. Do not wrap in markdown code blocks.";
}
