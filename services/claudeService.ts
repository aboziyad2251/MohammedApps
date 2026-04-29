import Anthropic from "@anthropic-ai/sdk";
import { Question, ExamMetadata, AnalysisFeedback, ExamResult, QuestionType, Difficulty, Language, EducationLevel, ExplanationData } from "../types";

const MODEL = "claude-sonnet-4-6";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const parseJSON = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON returned from Claude");
  return JSON.parse(match[0]);
};

export const generateExamFromPDF = async (
  file: File,
  lang: Language,
  level: EducationLevel,
  difficulty: Difficulty
): Promise<{ questions: Question[]; metadata: ExamMetadata }> => {
  const base64 = await fileToBase64(file);
  const langInstruction = lang === "ar" ? "OUTPUT MUST BE IN ARABIC." : "Output must be in English.";
  const seed = Math.floor(Math.random() * 1000000);

  const prompt = `Analyze the PDF and generate exactly 20 unique exam questions (mix of MCQ and TrueFalse).
Target Audience: ${level}. Difficulty: ${difficulty}. Seed: ${seed}.
${langInstruction}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "courseName": "string",
  "topics": ["string"],
  "concepts": ["string"],
  "questions": [
    {
      "id": 1,
      "type": "MCQ",
      "text": "question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "difficulty": "${difficulty}",
      "topic": "topic name"
    }
  ]
}

Rules:
- MCQ: exactly 4 options, correctAnswer must match one option exactly
- TrueFalse: options must be ["True","False"], correctAnswer is "True" or "False"
- Generate at least 15 MCQ and 5 TrueFalse questions`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 },
          } as any,
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const data = parseJSON(text);
  return {
    metadata: { courseName: data.courseName, topics: data.topics, concepts: data.concepts },
    questions: data.questions,
  };
};

export const explainPDFContent = async (
  file: File,
  lang: Language,
  level: EducationLevel
): Promise<ExplanationData> => {
  const base64 = await fileToBase64(file);
  const langInstruction = lang === "ar" ? "OUTPUT MUST BE IN ARABIC." : "Output must be in English.";

  const prompt = `Analyze this PDF and create a comprehensive study guide for a ${level} student.
${langInstruction}

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

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 },
          } as any,
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
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

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return parseJSON(text) as AnalysisFeedback;
};
