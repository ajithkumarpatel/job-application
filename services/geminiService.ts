import { GoogleGenAI, Type } from "@google/genai";
import type { ResumeAnalysis } from '../types';

const model = 'gemini-2.5-flash';

// FIX: Moved AI client initialization into a function to be called on demand.
// This prevents the app from crashing on load if the API key is not yet available.
const getAiClient = () => {
    // FIX: Simplified to use process.env.API_KEY, which is provided by the development sandbox environment.
    // Removed dependency on REACT_APP_* variables which require a build step that isn't present.
    const GEMINI_API_KEY = process.env.API_KEY;
    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is not set. Please ensure it's configured in your environment.");
    }
    return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
};

export const analyzeResume = async (resumeText: string): Promise<ResumeAnalysis> => {
    const prompt = `Analyze the following resume text and extract the top 5 skills, 3 potential job titles, and 10 relevant keywords. Focus on technical skills and professional roles.`;
    
    try {
        const ai = getAiClient(); // Get client at time of use
        const response = await ai.models.generateContent({
            model: model,
            contents: `${prompt}\n\nResume: ${resumeText}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        skills: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of the top 5 most prominent skills."
                        },
                        jobTitles: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of 3 potential job titles suitable for the candidate."
                        },
                        keywords: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of 10 relevant keywords and technologies found in the resume."
                        }
                    },
                    required: ["skills", "jobTitles", "keywords"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as ResumeAnalysis;

    } catch (error) {
        console.error("Error analyzing resume with Gemini API:", error);
        // The error is re-thrown so the UI component can catch it and display a message.
        throw new Error("Failed to analyze resume. The Gemini API might be unavailable or the response was invalid.");
    }
};

export const generateCoverLetter = async (jobTitle: string, companyName: string, resumeAnalysis: ResumeAnalysis): Promise<string> => {
    const skillsString = resumeAnalysis.skills.join(', ');
    const prompt = `Write a professional and compelling cover letter for a candidate applying for the '${jobTitle}' position at '${companyName}'. The candidate's key skills are: ${skillsString}. The letter should be enthusiastic, concise, and tailored to the role. Do not include placeholders like "[Your Name]" or "[Date]".`;
    
    try {
        const ai = getAiClient(); // Get client at time of use
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 0.95,
            }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error generating cover letter with Gemini API:", error);
        throw new Error("Failed to generate cover letter. Please try again.");
    }
};
