import React from 'react';
import { BookOpen, Search, Sparkles, Terminal, BookMarked, BarChart3, FileCode } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'search' | 'morphology' | 'browse' | 'python' | 'stats';
  setActiveTab: (tab: 'search' | 'morphology' | 'browse' | 'python' | 'stats') => void;
  totalVerses: number;
  totalSurahs: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalVerses,
  totalSurahs,
}) => {
  return (
    <header className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900/90 border-b border-emerald-900/40 pb-6 pt-8 px-4 sm:px-8">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-4 text-center md:text-right">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-400/30 flex-shrink-0">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                  الباحث القرآني المتقدم
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  صرفي ونحوي
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                محرك بحث لغوي دقيق في القرآن الكريم يراعي الجذور الثلاثية والرباعية، السوابق، اللواحق، والأوزان الصرفية
              </p>
            </div>
          </div>

          {/* Quick stats pills & Android PWA Install */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5">
            <PWAInstallButton />
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>السور: <strong className="text-emerald-400 font-bold">{totalSurahs || 114}</strong></span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              <span>الآيات: <strong className="text-teal-400 font-bold">{totalVerses || 6236}</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center md:justify-start gap-2 mt-8 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>البحث القرآني</span>
          </button>

          <button
            onClick={() => setActiveTab('morphology')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'morphology'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>المحلل الصرفي والجذور</span>
          </button>

          <button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'browse'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>تصفح السور</span>
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'python'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>كود بايثون المستقل (CLI)</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>معجم الجذور وإحصائيات</span>
          </button>
        </div>
      </div>
    </header>
  );
};
