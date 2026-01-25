
import React, { useState, useEffect } from 'react';
import { AppStep, ExamMetadata, Question, StudentInfo, ExamResult, AnalysisFeedback, Language, EducationLevel, ExplanationData, Difficulty } from './types';
import FileUpload from './components/FileUpload';
import StudentForm from './components/StudentForm';
import ExamRunner from './components/ExamRunner';
import ResultsView from './components/ResultsView';
import ExplanationView from './components/ExplanationView';
import { generateExamFromPDF, analyzePerformance, explainPDFContent } from './services/geminiService';
import { BrainCircuit, GraduationCap, X, Moon, Sun, Languages } from 'lucide-react';
import { translations } from './locales';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.Upload);
  const [loadingText, setLoadingText] = useState('');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('en');
  
  // Data State
  const [currentPdf, setCurrentPdf] = useState<File | null>(null);
  const [currentLevel, setCurrentLevel] = useState<EducationLevel>(EducationLevel.University);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(Difficulty.Medium);
  
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [metadata, setMetadata] = useState<ExamMetadata | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisFeedback | null>(null);
  
  // Timer State
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(30);

  const t = translations[language];

  // Theme Init
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Language & Dir Init
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const generateExam = async (pdf: File, level: EducationLevel, difficulty: Difficulty) => {
    setLoadingText(t.loading.generating);
    setStep(AppStep.Generating);
    try {
      const data = await generateExamFromPDF(pdf, language, level, difficulty);
      setMetadata(data.metadata);
      setQuestions(data.questions);
      setStep(AppStep.StudentInfo);
    } catch (error) {
      console.error(error);
      alert("Failed to generate exam. Please check your PDF and try again.");
      setStep(AppStep.Upload);
    }
  };

  const handleFileSelect = async (file: File, level: EducationLevel, difficulty: Difficulty, mode: 'explain' | 'exam') => {
    setCurrentPdf(file);
    setCurrentLevel(level);
    setCurrentDifficulty(difficulty);

    if (mode === 'explain') {
      setLoadingText(t.loading.explaining);
      setStep(AppStep.Generating); 
      try {
        const explData = await explainPDFContent(file, language, level);
        setExplanation(explData);
        setStep(AppStep.Explanation);
      } catch (error) {
        console.error(error);
        alert("Failed to analyze PDF. Please try again.");
        setStep(AppStep.Upload);
      }
    } else {
      await generateExam(file, level, difficulty);
    }
  };

  const handleProceedToExam = async () => {
    if (currentPdf) {
      await generateExam(currentPdf, currentLevel, currentDifficulty);
    }
  };

  const handleStudentSubmit = (info: StudentInfo, timerOn: boolean, duration: number) => {
    setStudentInfo(info);
    setTimerEnabled(timerOn);
    setTimerDuration(duration);
    setStep(AppStep.Exam);
  };

  const handleExamComplete = async (answers: Record<number, string>) => {
    if (!questions || !metadata) return;

    setStep(AppStep.ProcessingResults);
    setLoadingText(t.loading.processing);

    let correctCount = 0;
    const topicPerf: Record<string, { total: number; correct: number }> = {};

    questions.forEach(q => {
      if (!topicPerf[q.topic]) topicPerf[q.topic] = { total: 0, correct: 0 };
      topicPerf[q.topic].total++;

      const isCorrect = answers[q.id] === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
        topicPerf[q.topic].correct++;
      }
    });

    const calculatedResult: ExamResult = {
      totalQuestions: questions.length,
      correctCount,
      incorrectCount: questions.length - correctCount,
      scorePercentage: (correctCount / questions.length) * 100,
      answers,
      topicPerformance: topicPerf,
      questions
    };

    setResult(calculatedResult);

    try {
      const aiAnalysis = await analyzePerformance(calculatedResult, metadata, language);
      setAnalysis(aiAnalysis);
      setStep(AppStep.Results);
    } catch (error) {
      setStep(AppStep.Results);
    }
  };

  const handleRestart = () => {
    setStep(AppStep.Upload);
    setCurrentPdf(null);
    setExplanation(null);
    setMetadata(null);
    setQuestions([]);
    setStudentInfo(null);
    setResult(null);
    setAnalysis(null);
    setTimerEnabled(false);
  };

  const handleQuit = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (step === AppStep.Exam) {
      setTimeout(() => {
        if (window.confirm(t.common.quitConfirm)) {
          handleRestart();
        }
      }, 10);
    } else {
      handleRestart();
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300 ${language === 'ar' ? 'font-sans' : 'font-sans'}`}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-1.5 rounded-lg shadow-lg shadow-violet-500/20">
               <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
              {t.appTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {studentInfo && step !== AppStep.Results && step !== AppStep.ProcessingResults && (
              <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full">
                <GraduationCap className="w-4 h-4 text-violet-500" />
                <span>{studentInfo.name}</span>
              </div>
            )}
            
            <button
              onClick={toggleLanguage}
              className="p-2 flex items-center space-x-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Switch Language"
              title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <Languages className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {step !== AppStep.Upload && (
              <button
                onClick={handleQuit}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                aria-label="Quit Exam"
                title="Quit Exam"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 relative">
        
        {/* Loading State Overlay */}
        {(step === AppStep.Generating || step === AppStep.ProcessingResults) && (
          <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 dark:border-violet-900 border-t-violet-600 dark:border-t-violet-400 mb-6 shadow-xl shadow-violet-500/20"></div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white animate-pulse">{loadingText}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">This may take a moment...</p>
          </div>
        )}

        {step === AppStep.Upload && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                {t.uploadStep.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {t.uploadStep.subtitle}
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} isProcessing={step === AppStep.Generating} lang={language} />
          </div>
        )}

        {step === AppStep.Explanation && explanation && (
           <ExplanationView 
             data={explanation}
             onProceed={handleProceedToExam}
             onRestart={handleRestart}
             lang={language}
           />
        )}

        {step === AppStep.StudentInfo && metadata && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StudentForm onSubmit={handleStudentSubmit} courseName={metadata.courseName} lang={language} />
          </div>
        )}

        {step === AppStep.Exam && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
             <ExamRunner 
               questions={questions} 
               onComplete={handleExamComplete} 
               lang={language} 
               timerEnabled={timerEnabled} 
               durationMinutes={timerDuration} 
               onQuit={() => handleQuit()}
              />
          </div>
        )}

        {step === AppStep.Results && result && metadata && analysis && studentInfo && (
           <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
             <ResultsView 
               result={result} 
               metadata={metadata} 
               analysis={analysis} 
               student={studentInfo} 
               onRestart={handleRestart}
               isDark={isDark}
               lang={language}
             />
           </div>
        )}

      </main>

      {/* Simple Footer */}
      <footer className="py-8 text-center border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} {t.footerText}
        </p>
      </footer>
    </div>
  );
};

export default App;
