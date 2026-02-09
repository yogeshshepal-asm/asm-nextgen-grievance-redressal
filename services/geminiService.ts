
import { GoogleGenAI, Type } from "@google/genai";
import { GrievanceCategory } from "../types.ts";

// Check if API key is available
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
const isGeminiEnabled = apiKey && apiKey !== 'PLACEHOLDER_API_KEY';

let ai: any = null;
if (isGeminiEnabled) {
  ai = new GoogleGenAI({ apiKey });
  console.log("✅ Gemini AI: Enabled");
} else {
  console.warn("⚠️ Gemini AI: Disabled (using mock analysis)");
}

// Mock analysis for local development without API key
const mockAnalysis = (description: string, subject: string) => {
  const keywords = (description || '').toLowerCase() + ' ' + (subject || '').toLowerCase();
  
  let category = 'General';
  if (keywords.includes('exam') || keywords.includes('marks') || keywords.includes('faculty') || keywords.includes('course')) category = 'Academic';
  else if (keywords.includes('wifi') || keywords.includes('lab') || keywords.includes('classroom') || keywords.includes('canteen')) category = 'Infrastructure';
  else if (keywords.includes('fee') || keywords.includes('scholarship') || keywords.includes('refund')) category = 'Financial';
  else if (keywords.includes('certificate') || keywords.includes('document') || keywords.includes('id card')) category = 'Administrative';
  else if (keywords.includes('hostel') || keywords.includes('mess') || keywords.includes('room')) category = 'Hostel';
  
  const priority = keywords.includes('urgent') || keywords.includes('critical') ? 'High' : 'Medium';
  const sentiment = keywords.includes('poor') || keywords.includes('bad') || keywords.includes('worst') ? 'Negative' : 'Neutral';
  
  return {
    category,
    priority,
    summary: (subject || 'No subject').substring(0, 60),
    sentiment,
    suggestedAction: `Review and address the ${category.toLowerCase()} concern promptly.`
  };
};

export const analyzeGrievance = async (description: string, subject: string) => {
  if (!isGeminiEnabled) {
    return mockAnalysis(description, subject);
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following student/faculty grievance for ASM Nextgen Technical Campus.
      Subject: ${subject}
      Description: ${description}
      
      You MUST classify this grievance into EXACTLY ONE of the following categories:
      - Academic (for course content, exams, faculty issues, ERP access)
      - Infrastructure (for labs, wifi, classrooms, canteen, physical facilities)
      - Financial (for fees, scholarships, refunds)
      - Administrative (for documents, ID cards, certificates, policy)
      - Hostel (for room issues, mess food, hostel discipline)
      - General (anything else)

      Provide a structured JSON analysis including:
      1. category: The exact category name from the list above.
      2. priority: Low, Medium, or High based on urgency.
      3. summary: A short summary (max 20 words).
      4. sentiment: Positive, Neutral, or Negative.
      5. suggestedAction: Immediate step for the assigned cell lead.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "Must match one of the categories provided" },
            priority: { type: Type.STRING, description: "Low, Medium, or High" },
            summary: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            suggestedAction: { type: Type.STRING }
          },
          required: ["category", "priority", "summary", "sentiment", "suggestedAction"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error analyzing grievance:", error);
    return mockAnalysis(description, subject);
  }
};

export const generateResponseDraft = async (grievance: any) => {
  if (!isGeminiEnabled) {
    return `Dear ${grievance.userName},\n\nThank you for bringing this matter to our attention. Our ${grievance.category} team is reviewing your concern regarding "${grievance.subject}".\n\nWe will update you shortly.\n\nBest regards,\nASM Nextgen Technical Campus`;
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Draft a professional, empathetic, and formal response to the following grievance from a ${grievance.userRole} named ${grievance.userName} at ASM Nextgen Technical Campus.
      Subject: ${grievance.subject}
      Description: ${grievance.description}
      Status update to: ${grievance.status}
      Assigned Cell: ${grievance.category}
      
      Ensure the tone reflects the institution's commitment to student welfare.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating draft:", error);
    return "Thank you for bringing this to our attention. Our specialized cell is looking into the matter.";
  }
};
