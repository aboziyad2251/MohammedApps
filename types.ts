
export enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
  Tricky = "Tricky"
}

export enum QuestionType {
  MCQ = "Multiple Choice",
  TrueFalse = "True/False"
}

export enum EducationLevel {
  Primary = "Primary School",
  Intermediate = "Intermediate School",
  Secondary = "Secondary School",
  University = "University"
}

export type Language = 'en' | 'ar';

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options: string[];
  correctAnswer: string; 
  difficulty: Difficulty;
  topic: string;
}

export interface ExamMetadata {
  courseName: string;
  topics: string[];
  concepts: string[];
}

export interface StudentInfo {
  name: string;
  id: string;
}

export interface ExamResult {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  scorePercentage: number;
  answers: Record<number, string>; 
  topicPerformance: Record<string, { total: number; correct: number }>;
  questions: Question[];
}

export interface AnalysisFeedback {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  generalFeedback: string;
}

export interface Chapter {
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface ExplanationData {
  title: string;
  generalSummary: string; 
  chapters: Chapter[];
  examTips: string[];
}

export enum AppStep {
  Upload = 'UPLOAD',
  Explanation = 'EXPLANATION',
  StudentInfo = 'STUDENT_INFO',
  Generating = 'GENERATING',
  Exam = 'EXAM',
  ProcessingResults = 'PROCESSING_RESULTS',
  Results = 'RESULTS'
}

export interface VideoGenerationState {
  isGenerating: boolean;
  progressMessage: string;
  videoUrl?: string;
  error?: string;
}
