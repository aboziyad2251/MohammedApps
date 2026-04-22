import React, { useState } from 'react';
import { BrainCircuit, Wrench, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

interface Props {
  lang?: 'en' | 'ar';
  onAdminBypass: () => void;
}

const ADMIN_PASSWORD = 'admin123';

const content = {
  en: {
    title: "We'll be back soon!",
    subtitle: "Techarja Exam Builder is currently undergoing scheduled maintenance.",
    description: "We're working hard to improve your experience. Please check back later.",
    appTitle: "Techarja Exam Builder",
    adminLogin: "Admin Access",
    passwordPlaceholder: "Enter admin password",
    loginBtn: "Enter",
    wrongPassword: "Incorrect password. Please try again.",
    maintenanceLabel: "Maintenance in progress",
  },
  ar: {
    title: "سنعود قريباً!",
    subtitle: "منشئ الاختبارات تيك-أرجا يخضع حالياً لصيانة مجدولة.",
    description: "نعمل بجد لتحسين تجربتك. يرجى المحاولة مرة أخرى لاحقاً.",
    appTitle: "منشئ الاختبارات تيك-أرجا",
    adminLogin: "دخول المشرف",
    passwordPlaceholder: "أدخل كلمة مرور المشرف",
    loginBtn: "دخول",
    wrongPassword: "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
    maintenanceLabel: "الصيانة جارية",
  },
};

const MaintenanceScreen: React.FC<Props> = ({ lang = 'en', onAdminBypass }) => {
  const t = content[lang] ?? content.en;
  const isRtl = lang === 'ar';

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Secret trigger: click the logo 5 times to reveal admin panel
  const handleLogoClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 5) {
      setShowAdminPanel(true);
      setClickCount(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError(false);
      onAdminBypass();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 transition-colors duration-300"
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-400/10 dark:bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Logo — click 5× to reveal admin panel */}
        <button
          onClick={handleLogoClick}
          className="flex items-center justify-center gap-3 mb-10 mx-auto focus:outline-none select-none"
          aria-label="App logo"
        >
          <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/30">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            {t.appTitle}
          </span>
        </button>

        {/* Maintenance icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shadow-inner">
              <Wrench className="w-12 h-12 text-violet-500 dark:text-violet-400 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-fuchsia-500 rounded-full border-2 border-white dark:border-slate-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-fuchsia-500 rounded-full border-2 border-white dark:border-slate-950" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          {t.title}
        </h1>
        <p className="text-lg font-semibold text-violet-600 dark:text-violet-400 mb-3">
          {t.subtitle}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
          {t.description}
        </p>

        {/* Divider */}
        <div className="mt-10 flex items-center gap-3 justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
          <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t.maintenanceLabel}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
        </div>

        {/* Admin login panel */}
        {showAdminPanel && (
          <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 justify-center mb-5">
              <Lock className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t.adminLogin}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(false); }}
                  placeholder={t.passwordPlaceholder}
                  autoFocus
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors
                    ${error
                      ? 'border-red-400 dark:border-red-500 focus:ring-red-300 dark:focus:ring-red-700'
                      : 'border-slate-300 dark:border-slate-600 focus:ring-violet-300 dark:focus:ring-violet-700'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ${isRtl ? 'left-3' : 'right-3'}`}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-500 dark:text-red-400 text-center">
                  {t.wrongPassword}
                </p>
              )}

              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-all shadow-md shadow-violet-500/20"
              >
                <LogIn className="w-4 h-4" />
                {t.loginBtn}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceScreen;
