
import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, School, BookOpen, PlayCircle, BarChart } from 'lucide-react';
import { translations } from '../locales';
import { Language, EducationLevel, Difficulty } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File, level: EducationLevel, difficulty: Difficulty, mode: 'explain' | 'exam') => void;
  isProcessing: boolean;
  lang: Language;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing, lang }) => {
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>(EducationLevel.University);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.Medium);
  const [actionType, setActionType] = useState<'explain' | 'exam' | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang].uploadStep;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const mode = actionType || 'exam';

    const file = files[0];
    if (file.type !== 'application/pdf') {
      setError(t.errorType);
      return;
    }
    if (file.size > 500 * 1024 * 1024) { 
        setError("File size too large (max 500MB).");
        return;
    }

    setError(null);
    try {
      onFileSelect(file, selectedLevel, selectedDifficulty, mode);
      setActionType(null); 
    } catch (e) {
      setError(t.errorProcess);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setActionType('exam');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleButtonClick = (type: 'explain' | 'exam') => {
    setActionType(type);
    inputRef.current?.click();
  };

  return (
    <div className="max-w-xl mx-auto text-center">
      {/* Config Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Education Level */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <School className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <label htmlFor="level-select" className="text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {t.levelLabel}
            </label>
          </div>
          <div className="relative flex-1 max-w-[140px]">
            <select
              id="level-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as EducationLevel)}
              className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl focus:ring-violet-500 focus:border-violet-500 block p-2 pr-8 cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              disabled={isProcessing}
            >
              <option value={EducationLevel.Primary}>{t.levels.primary}</option>
              <option value={EducationLevel.Intermediate}>{t.levels.intermediate}</option>
              <option value={EducationLevel.Secondary}>{t.levels.secondary}</option>
              <option value={EducationLevel.University}>{t.levels.university}</option>
            </select>
            <div className={`pointer-events-none absolute inset-y-0 flex items-center px-2 text-slate-500 ${lang === 'ar' ? 'left-0' : 'right-0'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Exam Difficulty */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-lg">
              <BarChart className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <label htmlFor="diff-select" className="text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {t.difficultyLabel}
            </label>
          </div>
          <div className="relative flex-1 max-w-[140px]">
            <select
              id="diff-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
              className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl focus:ring-fuchsia-500 focus:border-fuchsia-500 block p-2 pr-8 cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              disabled={isProcessing}
            >
              <option value={Difficulty.Easy}>{t.difficulties.easy}</option>
              <option value={Difficulty.Medium}>{t.difficulties.medium}</option>
              <option value={Difficulty.Hard}>{t.difficulties.hard}</option>
              <option value={Difficulty.Tricky}>{t.difficulties.tricky}</option>
            </select>
            <div className={`pointer-events-none absolute inset-y-0 flex items-center px-2 text-slate-500 ${lang === 'ar' ? 'left-0' : 'right-0'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div 
        className={`relative p-12 border-2 border-dashed rounded-2xl transition-all duration-300 group
          ${dragActive 
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10 dark:border-violet-400' 
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-violet-400 dark:hover:border-violet-500 shadow-sm hover:shadow-md'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-5 bg-violet-100 dark:bg-violet-900/30 rounded-full group-hover:scale-110 transition-transform duration-300">
            {isProcessing ? (
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 dark:border-violet-400"></div>
            ) : (
                <Upload className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {isProcessing ? t.processing : t.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {t.dragDrop}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto pt-4">
            <button
              onClick={() => handleButtonClick('explain')}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center px-6 py-3 text-sm font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <BookOpen className="w-4 h-4 mr-2 rtl:ml-2" />
              {t.explainBtn}
            </button>
            <button
              onClick={() => handleButtonClick('exam')}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-500 dark:to-fuchsia-500 rounded-xl hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
            >
              <PlayCircle className="w-4 h-4 mr-2 rtl:ml-2" />
              {t.createExamBtn}
            </button>
          </div>
        </div>

        {error && (
          <div className="absolute -bottom-16 left-0 right-0 p-4 flex items-center justify-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
