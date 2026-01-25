
import React from 'react';
import { ExamResult, ExamMetadata, AnalysisFeedback, StudentInfo, Language } from '../types';
import { generatePDFReport } from '../utils/pdfUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, RefreshCcw, BookOpen, CheckCircle, XCircle, Video } from 'lucide-react';
import { translations } from '../locales';
import VideoGenerator from './VideoGenerator';

interface ResultsViewProps {
  result: ExamResult;
  metadata: ExamMetadata;
  analysis: AnalysisFeedback;
  student: StudentInfo;
  onRestart: () => void;
  isDark: boolean;
  lang: Language;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, metadata, analysis, student, onRestart, isDark, lang }) => {
  const t = translations[lang].results;
  const vt = translations[lang].videoGen;
  
  const chartData = Object.entries(result.topicPerformance).map(([topic, data]: [string, { total: number; correct: number }]) => ({
    name: topic.length > 15 ? topic.substring(0, 15) + '...' : topic,
    score: Math.round((data.correct / data.total) * 100),
    fullTopic: topic
  }));

  const handleDownload = () => {
    generatePDFReport(student, result, metadata, analysis, lang);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t.studentLabel}: <span className="font-semibold text-slate-800 dark:text-slate-200">{student.name}</span> ({student.id})</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{t.courseLabel}: {metadata.courseName}</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-center px-8 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
             <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">{t.scoreLabel}</div>
             <div className={`text-5xl font-extrabold ${result.scorePercentage >= 70 ? 'text-green-500' : result.scorePercentage >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
               {result.scorePercentage.toFixed(0)}%
             </div>
           </div>
        </div>
      </div>

      {/* Video Summary Section */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <VideoGenerator 
            prompt={`${vt.resultsPrompt} ${metadata.courseName}. The student ${student.name} achieved a score of ${result.scorePercentage.toFixed(0)}%. ${analysis.generalFeedback}`} 
            lang={lang} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Performance Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">{t.topicPerf}</h3>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{fontSize: 12, fill: isDark ? '#94a3b8' : '#475569'}} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    borderRadius: '12px', 
                    border: isDark ? '1px solid #334155' : 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    color: isDark ? '#fff' : '#000'
                  }} 
                  cursor={{fill: 'transparent'}}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 70 ? '#22c55e' : entry.score >= 40 ? '#eab308' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t.quickStats}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
                <span className="font-semibold text-green-900 dark:text-green-400">{t.correctLabel}</span>
              </div>
              <span className="text-3xl font-bold text-green-700 dark:text-green-400">{result.correctCount}</span>
            </div>
            <div className="flex items-center justify-between p-5 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
                <span className="font-semibold text-red-900 dark:text-red-400">{t.incorrectLabel}</span>
              </div>
              <span className="text-3xl font-bold text-red-700 dark:text-red-400">{result.incorrectCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 md:col-span-3">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
               <BookOpen className="w-6 h-6 mr-3 rtl:ml-3 text-violet-600 dark:text-violet-400" />
               {t.analysisTitle}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700/50">
                {analysis.generalFeedback}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-green-600 dark:text-green-500 mb-4 border-b border-green-100 dark:border-green-900 pb-2">{t.strengths}</h4>
                    <ul className="space-y-3">
                        {analysis.strengths.map((s, i) => (
                            <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                <span className="mr-2 rtl:ml-2 text-green-500 mt-1">•</span>{s}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-red-600 dark:text-red-500 mb-4 border-b border-red-100 dark:border-red-900 pb-2">{t.weaknesses}</h4>
                     <ul className="space-y-3">
                        {analysis.weaknesses.map((w, i) => (
                            <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                <span className="mr-2 rtl:ml-2 text-red-500 mt-1">•</span>{w}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-500 mb-4 border-b border-blue-100 dark:border-blue-900 pb-2">{t.recommendations}</h4>
                     <ul className="space-y-3">
                        {analysis.recommendations.map((r, i) => (
                            <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                <span className="mr-2 rtl:ml-2 text-blue-500 mt-1">•</span>{r}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={handleDownload}
          className="flex items-center px-8 py-4 bg-violet-600 dark:bg-violet-500 text-white rounded-xl hover:bg-violet-700 dark:hover:bg-violet-600 font-semibold shadow-lg shadow-violet-500/20 transition-all transform hover:-translate-y-1 rtl:flex-row-reverse rtl:space-x-reverse space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>{t.downloadBtn}</span>
        </button>
        <button
          onClick={onRestart}
          className="flex items-center px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-all transform hover:-translate-y-1 rtl:flex-row-reverse rtl:space-x-reverse space-x-2"
        >
          <RefreshCcw className="w-5 h-5" />
          <span>{t.restartBtn}</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsView;
