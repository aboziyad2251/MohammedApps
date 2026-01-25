
import React, { useState, useEffect } from 'react';
import { Video, Loader2, Play, AlertCircle, Key, ExternalLink } from 'lucide-react';
import { generateConceptVideo } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../locales';

interface VideoGeneratorProps {
  prompt: string;
  lang: Language;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ prompt, lang }) => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'ready' | 'generating' | 'success' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = translations[lang].videoGen;

  const steps = [t.step1, t.step2, t.step3, t.step4];

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setStatus(hasKey ? 'ready' : 'idle');
    }
  };

  const handleActivate = async () => {
    if (window.aistudio?.openSelectKey) {
        await window.aistudio.openSelectKey();
        setStatus('ready');
    }
  };

  const handleGenerate = async () => {
    setStatus('generating');
    setProgressStep(0);
    setErrorMsg(null);

    const stepInterval = setInterval(() => {
        setProgressStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 15000); // 1 minute roughly for 4 steps

    try {
        const url = await generateConceptVideo(prompt);
        setVideoUrl(url);
        setStatus('success');
    } catch (err: any) {
        console.error(err);
        if (err.message?.includes("entity was not found")) {
            setStatus('idle');
            setErrorMsg("API Key invalid or expired. Please re-select.");
        } else {
            setStatus('error');
            setErrorMsg(err.message || t.error);
        }
    } finally {
        clearInterval(stepInterval);
    }
  };

  if (status === 'idle') {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm">
            <Key className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
            <h4 className="font-bold text-slate-800 dark:text-white">{t.activate}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.activateDesc}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
            <button
                onClick={handleActivate}
                className="px-6 py-2 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all text-sm"
            >
                {t.activate}
            </button>
            <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600"
            >
                {t.billingLink}
                <ExternalLink className="w-3 h-3 ml-1" />
            </a>
        </div>
        {errorMsg && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <button
        onClick={handleGenerate}
        className="group relative w-full overflow-hidden p-6 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl text-white shadow-lg hover:shadow-violet-500/30 transition-all transform hover:-translate-y-1"
      >
        <div className="relative z-10 flex flex-col items-center text-center space-y-2">
            <Video className="w-8 h-8 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg">{translations[lang].explanation.generateVideo}</span>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
            <Video className="w-24 h-24" />
        </div>
      </button>
    );
  }

  if (status === 'generating') {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center space-y-6">
        <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-violet-600 dark:border-violet-400"></div>
            <Video className="absolute inset-0 m-auto w-8 h-8 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="text-center space-y-2">
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">{t.generating}</h4>
            <p className="text-slate-500 dark:text-slate-400 animate-pulse">{steps[progressStep]}</p>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
                className="h-full bg-violet-600 transition-all duration-1000 ease-out"
                style={{ width: `${(progressStep + 1) * 25}%` }}
            />
        </div>
      </div>
    );
  }

  if (status === 'success' && videoUrl) {
    return (
      <div className="space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 dark:text-white flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 rtl:ml-2 animate-pulse" />
                {t.success}
            </h4>
            <button 
                onClick={() => setStatus('ready')}
                className="text-xs text-violet-600 font-bold hover:underline"
            >
                Regenerate
            </button>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video group">
            <video 
                src={videoUrl} 
                className="w-full h-full object-contain" 
                controls 
                autoPlay
            />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h4 className="font-bold text-red-800 dark:text-red-400">{t.error}</h4>
            <p className="text-xs text-red-600 dark:text-red-500">{errorMsg}</p>
            <button
                onClick={() => setStatus('ready')}
                className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
            >
                Try Again
            </button>
        </div>
    );
  }

  return null;
};

export default VideoGenerator;
