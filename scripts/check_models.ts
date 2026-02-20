
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found in .env.local");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // There isn't a direct listModels method on the main class in some versions, 
        // but usually it's there or we can try a raw fetch if needed.
        // Actually, currently typical usage doesn't expose listModels easily via the high-level helpers 
        // without using the ModelManager, but let's try a simple generation on a known 'safe' model 
        // or try to find the right method.
        // 
        // Wait, the error message suggested calling ListModels.
        // In node SDK, checking documentation patterns...
        // It seems checking specific models via generation is easier if ListModels isn't exposed on the main client entry.

        // Let's try to hit the API directly for list models if the SDK is obscure.
        // https://generativelanguage.googleapis.com/v1beta/models?key=API_KEY

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods?.join(', ')})`);
            });
        } else {
            console.error("Failed to list models:", data);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
