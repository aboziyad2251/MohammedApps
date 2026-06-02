import * as pdfjsLib from 'pdfjs-dist';
import { Question, ExamMetadata, AnalysisFeedback, ExamResult, QuestionType, Difficulty, Language, EducationLevel, ExplanationData } from "../types";

// Setup PDF.js worker using CDN to avoid server MIME-type configuration issues
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.js';

// Helper to read file as ArrayBuffer using FileReader (highly compatible)
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };
    reader.onerror = () => reject(reader.error || new Error("Unknown FileReader error"));
    reader.readAsArrayBuffer(file);
  });
};

// Helper: Extract text from PDF
export const extractTextFromPDF = async (file: File): Promise<string> => {
  let arrayBuffer: ArrayBuffer;
  if (typeof file.arrayBuffer === 'function') {
    try {
      arrayBuffer = await file.arrayBuffer();
    } catch (e) {
      arrayBuffer = await readFileAsArrayBuffer(file);
    }
  } else {
    arrayBuffer = await readFileAsArrayBuffer(file);
  }

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
};

// Helper: Parse JSON safely (removing markdown code blocks if present)
const parseJSON = (text: string) => {
  let cleanText = text.trim();
  if (cleanText.startsWith("```")) {
    const lines = cleanText.split("\n");
    if (lines[0].startsWith("```")) {
      lines.shift();
    }
    if (lines[lines.length - 1].startsWith("```")) {
      lines.pop();
    }
    cleanText = lines.join("\n").trim();
  }
  
  const startIdx = cleanText.indexOf("{");
  const endIdx = cleanText.lastIndexOf("}");
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("No JSON returned from DeepSeek. Raw response: " + text);
  }
  cleanText = cleanText.substring(startIdx, endIdx + 1);
  return JSON.parse(cleanText);
};

// Generic DeepSeek Request function
const callDeepSeek = async (prompt: string, maxTokens: number = 4096): Promise<string> => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
  
  if (!apiKey) {
    throw new Error("DeepSeek API Key is missing. Please configure DEEPSEEK_API_KEY in your environment.");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are an expert academic assistant that outputs ONLY raw JSON conforming to the requested schema. Never output markdown code blocks or wrapping text unless requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
};

export const generateExamFromPDF = async (
  file: File,
  lang: Language,
  level: EducationLevel,
  difficulty: Difficulty
): Promise<{ questions: Question[]; metadata: ExamMetadata }> => {
  const pdfText = await extractTextFromPDF(file);
  const langInstruction = lang === "ar" ? "OUTPUT MUST BE IN ARABIC." : "Output must be in English.";
  const seed = Math.floor(Math.random() * 1000000);

  const prompt = `Analyze the PDF text below and generate exactly 20 unique exam questions (mix of MCQ and TrueFalse).
Target Audience: ${level}. Difficulty: ${difficulty}. Seed: ${seed}.
${langInstruction}

Here is the PDF content:
---
${pdfText}
---

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "courseName": "string",
  "topics": ["string"],
  "concepts": ["string"],
  "questions": [
    {
      "id": 1,
      "type": "Multiple Choice",
      "text": "question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "difficulty": "${difficulty}",
      "topic": "topic name"
    }
  ]
}

Rules:
- MCQ: type must be exactly "Multiple Choice", exactly 4 options, correctAnswer must match one option exactly.
- TrueFalse: type must be exactly "True/False", options must be ["True","False"], correctAnswer is "True" or "False".
- Generate at least 15 MCQ and 5 TrueFalse questions.`;

  const text = await callDeepSeek(prompt, 8192);
  const data = parseJSON(text);
  
  // Format matching types.ts QuestionType mapping
  const formattedQuestions = data.questions.map((q: any) => {
    return {
      ...q,
      type: q.type === "MCQ" || q.type === "Multiple Choice" ? QuestionType.MCQ : QuestionType.TrueFalse
    };
  });

  return {
    metadata: { courseName: data.courseName, topics: data.topics, concepts: data.concepts },
    questions: formattedQuestions,
  };
};

export const explainPDFContent = async (
  file: File,
  lang: Language,
  level: EducationLevel
): Promise<ExplanationData> => {
  const pdfText = await extractTextFromPDF(file);
  const langInstruction = lang === "ar" ? "OUTPUT MUST BE IN ARABIC." : "Output must be in English.";

  const prompt = `Analyze this PDF text below and create a comprehensive study guide for a ${level} student.
${langInstruction}

Here is the PDF content:
---
${pdfText}
---

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "title": "string",
  "generalSummary": "string",
  "chapters": [
    {
      "title": "string",
      "summary": "string",
      "keyPoints": ["string"]
    }
  ],
  "examTips": ["string"]
}`;

  const text = await callDeepSeek(prompt, 4096);
  return parseJSON(text) as ExplanationData;
};

export const analyzePerformance = async (
  result: ExamResult,
  metadata: ExamMetadata,
  lang: Language
): Promise<AnalysisFeedback> => {
  const langInstruction = lang === "ar" ? "Provide all feedback in ARABIC." : "Provide feedback in English.";

  const prompt = `Analyze this exam performance and provide feedback.
Course: ${metadata.courseName}
Score: ${result.scorePercentage.toFixed(1)}%
Correct: ${result.correctCount}/${result.totalQuestions}
Topic Performance: ${JSON.stringify(result.topicPerformance)}
${langInstruction}

Return ONLY a valid JSON object (no markdown):
{
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "generalFeedback": "string"
}`;

  const text = await callDeepSeek(prompt, 2048);
  return parseJSON(text) as AnalysisFeedback;
};
