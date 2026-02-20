"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import InputForm from "@/components/InputForm";
import { ResumeOptimizerResponse, ResumeTheme } from "@/lib/types";
import ResultsDashboard from "@/components/ResultsDashboard";
import { useAuth } from "@/context/AuthContext";
import { LogIn, Sparkles, ShieldCheck, Zap, Globe, FileCheck } from "lucide-react";

export default function Home() {
  const { user, login, openAuthModal } = useAuth();
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [results, setResults] = useState<ResumeOptimizerResponse | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ResumeTheme>('modern');

  // Load restored / current session on mount
  useEffect(() => {
    try {
      // 1. First check for an active current session (unsaved work)
      const current = localStorage.getItem("vibrant-current-session");
      if (current) {
        const session = JSON.parse(current);
        if (session.results) {
          setResults({
            success: true,
            data: {
              ...session.results,
              optimizedResume: session.resumeContent || session.results.optimizedResume
            }
          });
          setSelectedTheme(session.theme || 'modern');
          return; // Session restored
        }
      }

      // 2. Fallback to explicitly saved resume if no current session
      const saved = localStorage.getItem("vibrant-resume-saved");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.sections && data.matchScore !== undefined) {
          setResults({
            success: true,
            data: {
              matchScore: data.matchScore,
              originalScore: data.originalScore,
              missingKeywords: data.missingKeywords || [],
              optimizedResume: "",
              commitedChanges: data.commitedChanges || []
            }
          });
          setSelectedTheme(data.theme || 'modern');
        }
      }
    } catch { /**/ }
  }, []);

  const handleOptimize = async (data: { profile: string; jd: string; apiKey: string; theme: ResumeTheme }) => {
    setOptimizerLoading(true);
    setResults(null);
    setSelectedTheme(data.theme);
    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateProfile: data.profile,
          jobDescription: data.jd,
          apiKey: data.apiKey,
        }),
      });

      const resultData: ResumeOptimizerResponse = await response.json();
      setResults(resultData);
    } catch (error) {
      console.error("Error optimizing resume:", error);
    } finally {
      setOptimizerLoading(false);
    }
  };

  const handleCreateScratch = () => {
    setOptimizerLoading(true);
    // Simulate a brief "preparing" state for better UX
    setTimeout(() => {
      const defaultContent = `# Full Name
Senior Software Engineer | City, State | 123-456-7890 | email@example.com

### Professional Summary
Dedicated and highly skilled Software Engineer with over 8 years of experience in designing, developing, and deploying robust web applications. Proven track record of leading technical teams and delivering scalable solutions in fast-paced environments.

### Technical Skills
- **Languages:** JavaScript (ES6+), TypeScript, Python, Java, SQL
- **Frameworks/Libraries:** React, Next.js, Node.js, Express, Tailwind CSS
- **Tools/Platforms:** Docker, AWS, Git, Jenkins, Terraform
- **Databases:** PostgreSQL, MongoDB, Redis

### Experience
**Senior Software Engineer | Tech Innovators Inc.**
*January 2020 – Present*
- Led the migration of a monolithic architecture to microservices using Node.js and Docker, improving system scalability by 40%.
- Developed a high-performance analytics dashboard with React and D3.js, used by over 500 enterprise clients.

**Software Engineer | Creative Solutions Ltd.**
*June 2016 – December 2019*
- Designed and implemented a real-time collaboration tool using WebSockets and React.
- Collaborated with cross-functional teams to define requirements and deliver high-quality software features.

### Education
**Bachelor of Science in Computer Science**
*University of Technology | 2012 – 2016*`;

      setResults({
        success: true,
        data: {
          matchScore: 0,
          originalScore: 0,
          missingKeywords: [],
          optimizedResume: defaultContent,
          commitedChanges: ["Starting from scratch with Modern template"]
        }
      });
      setSelectedTheme('modern');
      setOptimizerLoading(false);
    }, 800);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center -mt-10 overflow-hidden px-4">
        <div className="max-w-4xl w-full text-center space-y-12 animate-fade-in">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold tracking-wide animate-bounce-subtle">
              <Sparkles className="w-4 h-4" />
              AI-POWERED RESUME BUILDER & OPTIMIZER
            </div>

            <div className="relative inline-block py-4">
              <h1 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tight leading-none mb-6 flex justify-center">
                {/* Floating Wave Effect for "Vibrant" */}
                <div className="flex mr-4">
                  {["V", "i", "b", "r", "a", "n", "t"].map((char, i) => (
                    <span
                      key={i}
                      className="inline-block animate-float"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                {/* Floating Wave Effect for "Resume" */}
                <div className="flex text-blue-600">
                  {["R", "e", "s", "u", "m", "e"].map((char, i) => (
                    <span
                      key={i}
                      className="inline-block animate-float"
                      style={{ animationDelay: `${0.7 + i * 0.1}s` }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </h1>

              <h2 className="text-2xl md:text-4xl font-bold text-gray-600 tracking-tight mt-2 opacity-90">
                Boost your career potential
              </h2>
            </div>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Transform your professional profile into an ATS-friendly masterpiece.
              Sign in to access premium templates, AI optimization, and cloud backups.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => openAuthModal('register')}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center gap-3 cursor-pointer"
            >
              Get Started Free <LogIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-blue-200 transition-all active:scale-95 cursor-pointer"
            >
              Sign In with Email
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-gray-100">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="font-bold text-gray-900 text-sm">ATS Verified</p>
              <p className="text-[10px] text-gray-400">99% success rate</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <p className="font-bold text-gray-900 text-sm">AI Powered</p>
              <p className="text-[10px] text-gray-400">Generative insights</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <p className="font-bold text-gray-900 text-sm">Cloud Storage</p>
              <p className="text-[10px] text-gray-400">Google Drive sync</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileCheck className="w-5 h-5" />
              </div>
              <p className="font-bold text-gray-900 text-sm">PDF & DOCX</p>
              <p className="text-[10px] text-gray-400">Multi-format export</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-20">
      <Hero />

      {!results || !results.success || !results.data ? (
        <>
          <InputForm
            onSubmit={handleOptimize}
            onScratchSubmit={handleCreateScratch}
            isLoading={optimizerLoading}
          />
          {results?.error && (
            <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative z-50 shadow-lg animate-fade-in">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{results.error}</span>
              <button onClick={() => setResults(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <span className="text-xl">&times;</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="container mx-auto max-w-7xl animate-fade-in relative z-10">
          <ResultsDashboard results={results.data} onReset={() => setResults(null)} initialTheme={selectedTheme} />
        </div>
      )}
    </div>
  );
}
