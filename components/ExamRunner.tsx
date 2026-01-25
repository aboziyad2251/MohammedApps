import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, AlertTriangle, Timer, LogOut, BarChart2 } from 'lucide-react';
import { translations } from '../locales';
import { Language } from '../types';

interface ExamRunnerProps {
  questions: Question[];
  onComplete: (answers: Record<number, string>) => void;
  lang: Language;
  timerEnabled: boolean;
  durationMinutes: number;
  onQuit: () => void;
}

const ExamRunner: React.FC<ExamRunnerProps> = ({ questions, onComplete, lang, timerEnabled, durationMinutes, onQuit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const t = translations[lang].examRunner;
  const timerRef = useRef<number | null>(null);

  // Timer Logic
  useEffect(() => {
    if (timerEnabled && !isTimeUp) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerEnabled, isTimeUp]);

  // Auto-submit when time is up
  useEffect(() => {
    if (isTimeUp) {
      onComplete(answers);
    }
  }, [isTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length;
  
  // Stats Calculation
  const calculateStats = () => {
    let correct = 0;
    let wrong = 0;
    Object.entries(answers).forEach(([qId, ans]) => {
      const q = questions.find(q => q.id === Number(qId));
      if (q) {
        if (ans === q.correctAnswer) correct++;
        else wrong++;
      }
    });
    return { correct, wrong };
  };

  const { correct: correctCount, wrong: wrongCount } = calculateStats();
  
  // Check status of current question
  const currentAnswer = answers[currentQ.id];
  const isAnswered = !!currentAnswer;
  const isCurrentCorrect = currentAnswer === currentQ.correctAnswer;

  const handleSelect = (option: string) => {
    if (isTimeUp) return;
    // Prevent changing answer if already answered to ensure immediate feedback validity
    if (answers[currentQ.id]) return;
    
    setAnswers(prev => ({ ...prev, [currentQ.id]: option }));
  };

  const handleNext = () => {
    if (isLast) {
      setShowConfirm(true);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(prev => prev - 1);
  };

  const handleSubmit = () => {
    onComplete(answers);
  };

  const PrevIcon = lang === 'ar' ? ChevronRight : ChevronLeft;
  const NextIcon = lang === 'ar' ? ChevronLeft : ChevronRight;

  // Show "Time's Up" overlay momentarily before submitting
  if (isTimeUp) {
    return (
        <div className="fixed inset-0 bg-white/90 dark:bg-slate-950/90 z-50 flex flex-col items-center justify-center">
            <Timer className="w-16 h-16 text-red-600 dark:text-red-500 mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{t.timesUp}</h2>
        </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-center animate-in zoom-in-95">
        <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{t.confirmTitle}</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          {t.confirmText} <span className="font-bold text-slate-900 dark:text-white">{answeredCount}</span> {t.ofLabel} {questions.length}.
          {!isComplete && <span className="block text-red-500 dark:text-red-400 font-medium mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">{t.warningText}</span>}
        </p>
        
        {/* Stats Summary in Confirm Dialog */}
        <div className="flex justify-center gap-6 mb-8">
            <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl min-w-[80px]">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{correctCount}</span>
                <span className="text-xs text-green-800 dark:text-green-300 font-medium">{t.feedbackCorrect}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl min-w-[80px]">
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{wrongCount}</span>
                <span className="text-xs text-red-800 dark:text-red-300 font-medium">{t.feedbackIncorrect}</span>
            </div>
        </div>

        <div className="flex space-x-4 rtl:space-x-reverse">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors"
          >
            {t.reviewBtn}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-violet-600 dark:bg-violet-500 text-white rounded-xl hover:bg-violet-700 dark:hover:bg-violet-600 font-semibold shadow-lg shadow-violet-500/20 transition-all transform hover:-translate-y-0.5"
          >
            {t.submitBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Row: Progress, Stats, Timer, Quit */}
      <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Progress Info */}
            <div className="flex-1">
                <div className="flex justify-between text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    <span>{t.questionLabel} {currentIdx + 1} {t.ofLabel} {questions.length}</span>
                    <span>{Math.round((answeredCount / questions.length) * 100)}% {t.completedLabel}</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden" dir="ltr">
                    <div 
                        className={`h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out`}
                        style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3">
                
                {/* Real-time Stats */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
                    <div className="flex items-center text-green-600 dark:text-green-500 font-bold" title="Correct Answers">
                        <CheckCircle2 className="w-5 h-5 mr-1.5 rtl:ml-1.5" />
                        <span>{correctCount}</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex items-center text-red-600 dark:text-red-500 font-bold" title="Incorrect Answers">
                        <XCircle className="w-5 h-5 mr-1.5 rtl:ml-1.5" />
                        <span>{wrongCount}</span>
                    </div>
                </div>

                {/* Timer Display */}
                {timerEnabled && (
                    <div className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-xl font-mono font-bold text-lg shadow-sm border
                        ${timeLeft < 60 
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800' 
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`
                    }>
                        <Timer className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                )}

                {/* Quit Button */}
                <button 
                    type="button"
                    onClick={onQuit}
                    className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:space-x-1.5 md:rtl:space-x-reverse md:px-3 md:py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                    title={t.quitBtn}
                >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden md:inline font-semibold text-sm">{t.quitBtn}</span>
                </button>
            </div>
          </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${currentQ.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                currentQ.difficulty === 'Medium' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                currentQ.difficulty === 'Hard' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
              }`}>
              {currentQ.difficulty}
            </span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{currentQ.topic}</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-relaxed">
            {currentQ.text}
          </h2>

          <div className="space-y-4">
            {currentQ.options.map((opt, idx) => {
               const isSelected = answers[currentQ.id] === opt;
               const isOptionCorrect = opt === currentQ.correctAnswer;
               
               let buttonClass = "w-full text-start p-4 md:p-5 rounded-xl border-2 transition-all flex items-center justify-between group relative overflow-hidden ";
               let icon = null;

               if (isAnswered) {
                 if (isSelected) {
                    if (isOptionCorrect) {
                        // User selected CORRECT option
                        // Added ring for extra highlight
                        buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 ring-2 ring-green-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900";
                        icon = <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 relative z-10" />;
                    } else {
                        // User selected INCORRECT option
                        // Added ring for extra highlight
                        buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 ring-2 ring-red-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900";
                        icon = <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 relative z-10" />;
                    }
                 } else if (isOptionCorrect) {
                    // This is the correct option, but user didn't select it (show it in green)
                    buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 opacity-75";
                    icon = <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 relative z-10" />;
                 } else {
                    // Other incorrect unselected options
                    buttonClass += "border-slate-100 dark:border-slate-800 opacity-50 text-slate-400 dark:text-slate-600";
                 }
               } else {
                 // Standard state (not answered yet)
                 buttonClass += "border-slate-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300";
               }

               return (
                 <button
                   type="button"
                   key={idx}
                   onClick={() => handleSelect(opt)}
                   disabled={isAnswered}
                   className={buttonClass}
                 >
                   <span className="font-medium relative z-10">
                     {opt}
                   </span>
                   {icon}
                 </button>
               )
            })}
          </div>

          {/* Immediate Feedback Message */}
          {isAnswered && (
             <div className={`mt-6 p-4 rounded-xl border flex items-center space-x-3 rtl:space-x-reverse animate-in fade-in slide-in-from-top-2
                 ${isCurrentCorrect 
                   ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                   : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                 }`}>
                 {isCurrentCorrect 
                    ? <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    : <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                 }
                 <div>
                    <p className={`font-bold ${isCurrentCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                        {isCurrentCorrect ? t.feedbackCorrect : t.feedbackIncorrect}
                    </p>
                    {!isCurrentCorrect && (
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            {t.correctAnswerIs} <span className="font-bold">{currentQ.correctAnswer}</span>
                        </p>
                    )}
                 </div>
             </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex items-center px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50 disabled:hover:text-slate-600 font-semibold transition-colors rtl:flex-row-reverse rtl:space-x-reverse space-x-1"
          >
            <PrevIcon className="w-5 h-5" />
            <span>{t.prevBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className={`flex items-center px-8 py-3 rounded-xl font-bold shadow-md transition-all transform hover:-translate-y-0.5 rtl:flex-row-reverse rtl:space-x-reverse space-x-1
              ${isLast 
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-500 dark:to-fuchsia-500 text-white hover:shadow-violet-500/25' 
                : 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-slate-700'
              }`}
          >
            <span>{isLast ? t.finishBtn : t.nextBtn}</span>
            {!isLast && <NextIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamRunner;