
import React from 'react';
import { ExplanationData, Language } from '../types';
import { translations } from '../locales';
import { BookOpen, List, Lightbulb, PlayCircle, Upload, Layers, CheckSquare } from 'lucide-react';
import VideoGenerator from './VideoGenerator';

interface ExplanationViewProps {
  data: ExplanationData;
  onProceed: () => void;
  onRestart: () => void;
  lang: Language;
}

const ExplanationView: React.FC<ExplanationViewProps> = ({ data, onProceed, onRestart, lang }) => {
  const t = translations[lang].explanation;
  const vt = translations[lang].videoGen;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
          {data.title}
        </h2>
        <div className="inline-flex items-center px-4 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-full font-medium text-sm">
           <BookOpen className="w-4 h-4 mr-2 rtl:ml-2" />
           {t.title}
        </div>
      </div>

      <div className="space-y-8">
        {/* Video Generation Section */}
        <div className="mb-10">
            <VideoGenerator 
                prompt={`${vt.promptPrefix} ${data.title}. ${data.generalSummary}`} 
                lang={lang} 
            />
        </div>

        {/* General Summary Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 rtl:ml-3">
              <BookOpen className="w-5 h-5" />
            </span>
            {t.summary}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            {data.generalSummary}
          </p>
        </div>

        {/* Critical Exam Focus */}
        <div className="bg-amber-50 dark:bg-amber-950/20 p-8 rounded-2xl border border-amber-100 dark:border-amber-900/30">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
               <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mr-3 rtl:ml-3">
                <Lightbulb className="w-5 h-5" />
              </span>
              {t.examTips}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.examTips.map((tip, i) => (
                <div key={i} className="flex items-start bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-100 dark:border-slate-800 shadow-sm">
                   <div className="mr-3 rtl:ml-3 mt-1 text-amber-500">
                     <Lightbulb className="w-4 h-4" />
                   </div>
                   <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{tip}</span>
                </div>
              ))}
            </div>
        </div>

        {/* Chapter Breakdown */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <Layers className="w-6 h-6 mr-2 rtl:ml-2 text-violet-600 dark:text-violet-400" />
            {t.chaptersTitle}
          </h3>
          
          <div className="space-y-6">
            {data.chapters.map((chapter, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                   <h4 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                     <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs px-2 py-1 rounded mr-3 rtl:ml-3">
                       {idx + 1}
                     </span>
                     {chapter.title}
                   </h4>
                </div>
                <div className="p-6">
                   <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                     {chapter.summary}
                   </p>
                   
                   <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-5 border border-emerald-100 dark:border-emerald-900/30">
                      <h5 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-3 flex items-center uppercase tracking-wide">
                        <List className="w-4 h-4 mr-2 rtl:ml-2" />
                        {t.chapterKeyPoints}
                      </h5>
                      <ul className="grid sm:grid-cols-2 gap-3">
                        {chapter.keyPoints.map((point, k) => (
                          <li key={k} className="flex items-start text-sm text-slate-700 dark:text-slate-300">
                            <CheckSquare className="w-4 h-4 mr-2 rtl:ml-2 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12 sticky bottom-4 z-20">
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold shadow-lg transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse"
        >
          <Upload className="w-5 h-5" />
          <span>{t.uploadAnotherBtn}</span>
        </button>
        <button
          onClick={onProceed}
          className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-500 dark:to-fuchsia-500 text-white rounded-xl hover:shadow-xl hover:shadow-violet-500/25 font-bold transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-2 rtl:space-x-reverse"
        >
          <PlayCircle className="w-5 h-5" />
          <span>{t.proceedBtn}</span>
        </button>
      </div>
    </div>
  );
};

export default ExplanationView;
