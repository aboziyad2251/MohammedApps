import React, { useState } from 'react';
import { User, CreditCard, ChevronRight, ChevronLeft, Timer, Clock } from 'lucide-react';
import { StudentInfo, Language } from '../types';
import { translations } from '../locales';

interface StudentFormProps {
  onSubmit: (info: StudentInfo, timerEnabled: boolean, duration: number) => void;
  courseName: string;
  lang: Language;
}

const StudentForm: React.FC<StudentFormProps> = ({ onSubmit, courseName, lang }) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [duration, setDuration] = useState(30);

  const t = translations[lang].studentForm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && id.trim()) {
      // Ensure duration is within bounds if enabled
      let finalDuration = duration;
      if (timerEnabled) {
        if (finalDuration < 1) finalDuration = 1;
        if (finalDuration > 300) finalDuration = 300;
      }
      onSubmit({ name, id }, timerEnabled, finalDuration);
    }
  };

  const ChevronIcon = lang === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t.title}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          {t.courseLabel}: <span className="font-semibold text-violet-600 dark:text-violet-400 block mt-1 text-base">{courseName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.nameLabel}</label>
          <div className="relative group">
            <User className={`absolute top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 ${lang === 'ar' ? 'pr-10' : 'pl-10'}`}
              placeholder={t.namePlaceholder}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.idLabel}</label>
          <div className="relative group">
            <CreditCard className={`absolute top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className={`w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 ${lang === 'ar' ? 'pr-10' : 'pl-10'}`}
              placeholder={t.idPlaceholder}
              required
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.timerLabel}</label>
          <div className="flex gap-4">
            <div className="w-1/3">
               <div className="relative">
                  <Timer className={`absolute top-3.5 h-5 w-5 text-slate-400 pointer-events-none ${lang === 'ar' ? 'left-3' : 'right-3'}`} />
                  <select
                    value={timerEnabled ? 'ON' : 'OFF'}
                    onChange={(e) => setTimerEnabled(e.target.value === 'ON')}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 text-slate-900 dark:text-white outline-none appearance-none cursor-pointer"
                  >
                    <option value="OFF">{t.timerOff}</option>
                    <option value="ON">{t.timerOn}</option>
                  </select>
               </div>
            </div>
            
            <div className="w-2/3">
              <div className={`relative transition-opacity duration-300 ${!timerEnabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <Clock className={`absolute top-3.5 h-5 w-5 text-slate-400 pointer-events-none ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  disabled={!timerEnabled}
                  className={`w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 text-slate-900 dark:text-white outline-none placeholder:text-slate-400 ${lang === 'ar' ? 'pr-10' : 'pl-10'}`}
                  placeholder={t.durationPlaceholder}
                />
                <span className={`absolute top-3.5 text-xs text-slate-400 font-medium pointer-events-none ${lang === 'ar' ? 'left-3' : 'right-3'}`}>
                    min
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim() || !id.trim() || (timerEnabled && (duration < 1 || duration > 300))}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-500 dark:to-fuchsia-500 text-white p-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all transform hover:-translate-y-0.5 rtl:flex-row-reverse rtl:space-x-reverse"
        >
          <span>{t.submitBtn}</span>
          <ChevronIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default StudentForm;