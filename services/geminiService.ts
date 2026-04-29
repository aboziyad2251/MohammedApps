
import { GoogleGenAI, Type, Schema, GenerateContentResponse } from "@google/genai";
import { Question, ExamMetadata, AnalysisFeedback, ExamResult, QuestionType, Difficulty, Language, EducationLevel, ExplanationData } from "../types";

const MODEL_NAME = "gemini-1.5-flash";
const VEO_MODEL = "veo-3.1-fast-generate-preview";

// Helper to convert File to Base64
const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Retry helper for API calls to handle transient 500 errors and timeouts
const generateWithRetry = async (
    ai: GoogleGenAI, 
    params: any, 
    retries = 3
): Promise<GenerateContentResponse> => {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent(params);
        } catch (error: any) {
            lastError = error;
            const statusCode = error.status || error.code || error.response?.status;
            
            // Retry on 5xx errors (Internal, Unavailable, Gateway Timeout) or 429 (Quota)
            const isServerSideError = statusCode && statusCode >= 500 && statusCode < 600;
            const isQuotaError = statusCode === 429;
            const isInternalMessage = error.message && (
                error.message.includes("Internal error") || 
                error.message.includes("An internal error") ||
                error.message.includes("Capacity") ||
                error.message.includes("Overloaded") ||
                error.message.includes("Timeout")
            );

            if ((isServerSideError || isQuotaError || isInternalMessage) && i < retries - 1) {
                // Exponential backoff: 2s, 5s, 10s
                const delay = 2000 * Math.pow(2.5, i); 
                console.warn(`Gemini API attempt ${i + 1} failed (${statusCode || 'Unknown'}). Retrying in ${Math.round(delay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
};

// Helper to determine best content method (Inline vs File API)
const getContentPart = async (ai: GoogleGenAI, file: File) => {
    const INLINE_SIZE_LIMIT = 48 * 1024 * 1024; 

    if (file.size < INLINE_SIZE_LIMIT) {
        const base64 = await fileToBase64(file);
        return { inlineData: { mimeType: "application/pdf", data: base64 } };
    } else {
        console.log(`File size ${file.size} exceeds inline limit. Uploading to Gemini...`);
        
        try {
            const uploadResult = await ai.files.upload({
                file: file,
                config: { mimeType: 'application/pdf' }
            });

            const responseAny = uploadResult as any;
            let fileResource = uploadResult.file || (responseAny.uri ? responseAny : null);

            if (!fileResource || !fileResource.uri) {
                 throw new Error("Gemini File API returned an unexpected response structure.");
            }

            let attempts = 0;
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            while (fileResource.state === 'PROCESSING' && attempts < 300) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const getResponse = await ai.files.get({ name: fileResource.name });
                fileResource = getResponse.file;
                attempts++;
            }

            if (fileResource.state === 'FAILED') {
                throw new Error("Gemini File API failed to process the document.");
            }
            
            return { fileData: { fileUri: fileResource.uri, mimeType: 'application/pdf' } };
        } catch (error: any) {
            console.error("Upload failed", error);
            throw new Error(`Failed to upload large file to Gemini: ${error.message || "Unknown error"}`);
        }
    }
};

export const explainPDFContent = async (file: File, lang: Language, level: EducationLevel): Promise<ExplanationData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const languageInstruction = lang === 'ar' 
    ? "OUTPUT MUST BE IN ARABIC." 
    : "Output must be in English.";

  const prompt = `
    Analyze the attached PDF content carefully. Level: ${level}.
    Create a comprehensive study guide.
    Output strictly in JSON format.
    ${languageInstruction}
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      generalSummary: { type: Type.STRING },
      chapters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "summary", "keyPoints"]
        }
      },
      examTips: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["title", "generalSummary", "chapters", "examTips"]
  };

  const contentPart = await getContentPart(ai, file);
  const response = await generateWithRetry(ai, {
    model: MODEL_NAME,
    contents: { parts: [contentPart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.5,
    }
  });

  if (response.text) return JSON.parse(response.text) as ExplanationData;
  throw new Error("No data returned from Gemini");
};

export const generateExamFromPDF = async (file: File, lang: Language, level: EducationLevel, difficulty: Difficulty): Promise<{ questions: Question[], metadata: ExamMetadata }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const languageInstruction = lang === 'ar' ? "OUTPUT MUST BE IN ARABIC." : "Output must be in English.";
  const randomSeed = Math.floor(Math.random() * 1000000);

  const prompt = `
    Analyze the PDF and generate 20 unique exam questions (MCQ/TrueFalse).
    Target Audience: ${level}.
    Target Difficulty Level: ${difficulty}. (Most or all questions should match this difficulty).
    Generation Seed: ${randomSeed}.
    ${languageInstruction}
  `;

  const questionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      type: { type: Type.STRING, enum: [QuestionType.MCQ, QuestionType.TrueFalse] },
      text: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
      difficulty: { type: Type.STRING, enum: [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard, Difficulty.Tricky] },
      topic: { type: Type.STRING }
    },
    required: ["id", "type", "text", "options", "correctAnswer", "difficulty", "topic"]
  };

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      courseName: { type: Type.STRING },
      topics: { type: Type.ARRAY, items: { type: Type.STRING } },
      concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
      questions: { type: Type.ARRAY, items: questionSchema }
    },
    required: ["courseName", "topics", "concepts", "questions"]
  };

  const contentPart = await getContentPart(ai, file);
  const response = await generateWithRetry(ai, {
    model: MODEL_NAME,
    contents: { parts: [contentPart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.5,
    }
  });

  if (response.text) {
    const data = JSON.parse(response.text);
    return {
      metadata: { courseName: data.courseName, topics: data.topics, concepts: data.concepts },
      questions: data.questions
    };
  }
  throw new Error("No data returned");
};

export const analyzePerformance = async (result: ExamResult, metadata: ExamMetadata, lang: Language): Promise<AnalysisFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const languageInstruction = lang === 'ar' ? "Provide all feedback in ARABIC." : "Provide feedback in English.";
  const prompt = `Analyze exam performance. Course: ${metadata.courseName}, Score: ${result.scorePercentage}%. Topic Perf: ${JSON.stringify(result.topicPerformance)}. ${languageInstruction}`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      generalFeedback: { type: Type.STRING }
    },
    required: ["strengths", "weaknesses", "recommendations", "generalFeedback"]
  };

  const response = await generateWithRetry(ai, {
    model: MODEL_NAME,
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    }
  });

  if (response.text) return JSON.parse(response.text) as AnalysisFeedback;
  throw new Error("Failed analysis");
};

/**
 * Generates a video using Veo model
 */
export const generateConceptVideo = async (promptText: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let operation = await ai.models.generateVideos({
        model: VEO_MODEL,
        prompt: promptText,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed to return a link.");

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};
