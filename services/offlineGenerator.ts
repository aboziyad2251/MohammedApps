import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import nlp from 'compromise';
import { Question, ExamMetadata, AnalysisFeedback, ExamResult, QuestionType, Difficulty, Language, EducationLevel, ExplanationData } from "../types";

// Setup PDF.js worker using Vite asset loader
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Helper: Extract text from PDF
export const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
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

// Heuristic: Summarize Text
export const explainPDFContent = async (file: File, lang: Language, level: EducationLevel): Promise<ExplanationData> => {
    const text = await extractTextFromPDF(file);
    const doc = nlp(text);
    
    // Extract important sentences (heuristic: sentences with 'is', 'are', 'means', 'defined')
    const sentences = doc.sentences().out('array');
    const importantSentences = sentences.filter(s => 
        s.includes(' is ') || s.includes(' are ') || s.includes(' means ') || s.includes(' defined ')
    ).slice(0, 10);
    
    const generalSummary = importantSentences.slice(0, 3).join('. ') || "No clear summary found. The document contains general information.";
    
    return {
        title: "Study Guide (Offline Generated)",
        generalSummary: generalSummary,
        chapters: [
            {
                title: "Chapter 1: Key Concepts",
                summary: importantSentences.slice(3, 5).join('. ') || "Key concepts discussed in the document.",
                keyPoints: importantSentences.slice(5, 10)
            }
        ],
        examTips: [
            "Review the key definitions.",
            "Understand the main subjects mentioned repeatedly.",
            "Practice recalling facts without looking at the text."
        ]
    };
};

// Heuristic: Generate Exam
export const generateExamFromPDF = async (file: File, lang: Language, level: EducationLevel, difficulty: Difficulty): Promise<{ questions: Question[], metadata: ExamMetadata }> => {
    const text = await extractTextFromPDF(file);
    const doc = nlp(text);
    
    // Find nouns to use as distractors
    const allNouns = doc.nouns().out('array').filter(n => n.length > 3);
    const uniqueNouns = Array.from(new Set(allNouns));
    
    // Find sentences with 'is a' or 'are' to make questions
    const sentences = doc.sentences().out('array').filter(s => s.length > 20 && s.length < 150);
    
    const questions: Question[] = [];
    let idCounter = 1;
    
    for (const sentence of sentences) {
        if (questions.length >= 20) break;
        
        const sDoc = nlp(sentence);
        const nouns = sDoc.nouns().out('array');
        
        if (nouns.length > 0 && Math.random() > 0.3) { // 70% chance of MCQ
            const targetNoun = nouns[0];
            const questionText = sentence.replace(targetNoun, "______");
            
            // Get 3 random other nouns
            const distractors = [];
            while(distractors.length < 3) {
                const randomNoun = uniqueNouns[Math.floor(Math.random() * uniqueNouns.length)];
                if (randomNoun && randomNoun !== targetNoun && !distractors.includes(randomNoun)) {
                    distractors.push(randomNoun);
                }
            }
            
            const options = [targetNoun, ...distractors].sort(() => Math.random() - 0.5);
            
            questions.push({
                id: idCounter++,
                type: QuestionType.MCQ,
                text: questionText,
                options: options,
                correctAnswer: targetNoun,
                difficulty: difficulty,
                topic: "General"
            });
        } else if (sentences.length > 0) { // 30% chance of T/F
            // Create a T/F question
            const isTrue = Math.random() > 0.5;
            let text = sentence;
            
            if (!isTrue) {
                // Try to negate it (simple heuristic)
                if (text.includes(" is ")) text = text.replace(" is ", " is not ");
                else if (text.includes(" are ")) text = text.replace(" are ", " are not ");
                else if (text.includes(" can ")) text = text.replace(" can ", " cannot ");
                else isTrue = true; // Couldn't negate easily, keep it true
            }
            
            questions.push({
                id: idCounter++,
                type: QuestionType.TrueFalse,
                text: text,
                options: ["True", "False"],
                correctAnswer: isTrue ? "True" : "False",
                difficulty: difficulty,
                topic: "General"
            });
        }
    }
    
    return {
        questions: questions,
        metadata: {
            courseName: "Offline Extracted Course",
            topics: ["General Concepts"],
            concepts: uniqueNouns.slice(0, 5)
        }
    };
};

// Heuristic: Analyze Performance
export const analyzePerformance = async (result: ExamResult, metadata: ExamMetadata, lang: Language): Promise<AnalysisFeedback> => {
    const strengths = [];
    const weaknesses = [];
    
    if (result.scorePercentage >= 80) {
        strengths.push("Excellent overall understanding of the material.");
    } else if (result.scorePercentage >= 50) {
        strengths.push("Good grasp of basic concepts, but room for improvement.");
    } else {
        weaknesses.push("Significant gaps in overall understanding.");
    }
    
    // Analyze topic performance
    for (const [topic, score] of Object.entries(result.topicPerformance)) {
        if (score >= 70) strengths.push(`Strong performance in ${topic}.`);
        else weaknesses.push(`Needs more review in ${topic}.`);
    }
    
    if (strengths.length === 0) strengths.push("Completed the exam, showing dedication to learning.");
    if (weaknesses.length === 0) weaknesses.push("No major weaknesses identified.");
    
    return {
        strengths,
        weaknesses,
        recommendations: [
            "Review the generated study guide.",
            "Focus on the weaknesses identified above.",
            "Try taking the exam again to improve your score."
        ],
        generalFeedback: `You scored ${result.scorePercentage}%. Keep practicing!`
    };
};

// Video Generation (Not possible offline, returning dummy)
export const generateConceptVideo = async (promptText: string): Promise<string> => {
    console.warn("Video generation is not available in offline mode.");
    // Return a generic placeholder or throw an error based on app handling
    throw new Error("Video generation requires an active internet connection and Gemini API.");
};
