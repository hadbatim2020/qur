import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SearchFilters, SearchMode } from './components/SearchFilters';
import { VerseCard } from './components/VerseCard';
import { MorphologyAnalyzer } from './components/MorphologyAnalyzer';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { SurahBrowser } from './components/SurahBrowser';
import { LexiconStats } from './components/LexiconStats';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  QuranSearchEngine,
  SearchMatchResult,
  SurahItem
} from './utils/quranSearch';
import { Loader2, Sparkles, AlertCircle, FileText, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export default function App() {
  const [engine] = useState(() => new QuranSearchEngine());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'search' | 'morphology' | 'browse' | 'python' | 'stats'>('search');

  // Search parameters
  const [query, setQuery] = useState('المجرمين');
  const [searchMode, setSearchMode] = useState<SearchMode>('root');
  const [matchDiacritics, setMatchDiacritics] = useState(false);
  const [surahFilter, setSurahFilter] = useState<number | undefined>(undefined);
  const [prefixQuery, setPrefixQuery] = useState('');
  const [suffixQuery, setSuffixQuery] = useState('');
  const [substringQuery, setSubstringQuery] = useState('');

  // Results & stats
  const [results, setResults] = useState<SearchMatchResult[]>([]);
  const [currentRoot, setCurrentRoot] = useState<string | null>('جرم');
  const [currentDerivatives, setCurrentDerivatives] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination for search results
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected word for morphology analysis tab
  const [selectedWordForMorphology, setSelectedWordForMorphology] = useState<string>('المُجْرِمِينَ');

  // Selected surah for browser tab
  const [browserSurahIndex, setBrowserSurahIndex] = useState<number>(1);
  const [targetVerseIndex, setTargetVerseIndex] = useState<number | undefined>(undefined);

  // Global Audio recitation player
  const [activePlayingAudio, setActivePlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load Quran on mount
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const ok = await engine.loadDatabase();
        if (ok) {
          // Perform initial search
          const rootData = engine.searchByRoot('المجرمين');
          setCurrentRoot(rootData.root);
          setCurrentDerivatives(rootData.derivatives);
          setResults(rootData.results);
        } else {
          setError('تعذر تحميل بيانات القرآن الكريم. يرجى التحقق من الملف.');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل قاعدة البيانات القرآنيّة.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [engine]);

  // Audio player management
  const handlePlayAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setActivePlayingAudio(url);
    audio.play().catch((e) => {
      console.warn('Audio play error', e);
      setActivePlayingAudio(null);
    });
    audio.onended = () => {
      setActivePlayingAudio(null);
    };
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setActivePlayingAudio(null);
  };

  // Perform search
  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);

    setTimeout(() => {
      if (searchMode === 'root') {
        const rootData = engine.searchByRoot(query, surahFilter);
        setCurrentRoot(rootData.root);
        setCurrentDerivatives(rootData.derivatives);
        setResults(rootData.results);
      } else if (searchMode === 'exact') {
        setCurrentRoot(null);
        setCurrentDerivatives([]);
        const exactData = engine.searchExact(query, matchDiacritics, surahFilter);
        setResults(exactData);
      } else if (searchMode === 'pattern') {
        setCurrentRoot(null);
        setCurrentDerivatives([]);
        const patData = engine.searchPattern(prefixQuery, suffixQuery, substringQuery, '', surahFilter);
        setResults(patData);
      } else if (searchMode === 'regex') {
        setCurrentRoot(null);
        setCurrentDerivatives([]);
        const regData = engine.searchPattern('', '', '', query, surahFilter);
        setResults(regData);
      }
      setIsSearching(false);
    }, 20);
  };

  const handleReset = () => {
    setQuery('');
    setPrefixQuery('');
    setSuffixQuery('');
    setSubstringQuery('');
    setSurahFilter(undefined);
    setResults([]);
    setCurrentRoot(null);
    setCurrentDerivatives([]);
  };

  const handleWordClick = (word: string) => {
    setSelectedWordForMorphology(word);
    setActiveTab('morphology');
  };

  const handleViewInSurah = (sIdx: number, vIdx: number) => {
    setBrowserSurahIndex(sIdx);
    setTargetVerseIndex(vIdx);
    setActiveTab('browse');
    setTimeout(() => {
      const el = document.getElementById(`verse-${sIdx}-${vIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  const handleSearchRootDirectly = (rootStr: string) => {
    setSearchMode('root');
    setQuery(rootStr);
    setActiveTab('search');
    setTimeout(() => {
      const rootData = engine.searchByRoot(rootStr);
      setCurrentRoot(rootData.root);
      setCurrentDerivatives(rootData.derivatives);
      setResults(rootData.results);
      setCurrentPage(1);
    }, 50);
  };

  // Pagination calculation
  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const paginatedResults = results.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-200">جاري تحميل وفهرسة القرآن الكريم كاملاً...</h2>
        <p className="text-sm text-slate-500 mt-2">
          يتم استخراج الجذور اللغوية وبناء الفهارس المقلوبة لـ ٦,٢٣٦ آية
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-rose-300">{error}</h2>
      </div>
    );
  }

  const surahs = engine.getSurahs();
  const allVerses = engine.getAllVerses();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalSurahs={surahs.length}
        totalVerses={allVerses.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Tab 1: Search Engine */}
        {activeTab === 'search' && (
          <div>
            <SearchFilters
              query={query}
              setQuery={setQuery}
              searchMode={searchMode}
              setSearchMode={setSearchMode}
              matchDiacritics={matchDiacritics}
              setMatchDiacritics={setMatchDiacritics}
              surahFilter={surahFilter}
              setSurahFilter={setSurahFilter}
              surahs={surahs}
              prefixQuery={prefixQuery}
              setPrefixQuery={setPrefixQuery}
              suffixQuery={suffixQuery}
              setSuffixQuery={setSuffixQuery}
              substringQuery={substringQuery}
              setSubstringQuery={setSubstringQuery}
              onSearch={handleSearch}
              onReset={handleReset}
              isSearching={isSearching}
            />

            {/* Results Information Banner */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  {totalResults}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">
                    {totalResults > 0
                      ? `تم العثور على ${totalResults} آية قرآنية مطابقة`
                      : 'لا توجد نتائج مطابقة لبحثك الحالي'}
                  </div>
                  {currentRoot && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      الجذر اللغوي المعتمد: <strong className="text-amber-300 font-quran text-sm">[{currentRoot}]</strong>
                      {currentDerivatives.length > 0 && ` • له ${currentDerivatives.length} تصريفاً مسجلاً`}
                    </div>
                  )}
                </div>
              </div>

              {/* Derivatives Pills if in Root Mode */}
              {currentRoot && currentDerivatives.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap max-w-md justify-start sm:justify-end">
                  <span className="text-[11px] text-slate-400">المشتقات:</span>
                  {currentDerivatives.slice(0, 8).map((d, i) => (
                    <span
                      key={i}
                      onClick={() => handleWordClick(d)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-quran hover:text-emerald-300 cursor-pointer border border-slate-700"
                    >
                      {d}
                    </span>
                  ))}
                  {currentDerivatives.length > 8 && (
                    <span className="text-[11px] text-slate-500">
                      +{currentDerivatives.length - 8} أخرى
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Verses List */}
            {paginatedResults.length > 0 ? (
              <div className="space-y-4">
                {paginatedResults.map((res, idx) => (
                  <VerseCard
                    key={`${res.verse.surahIndex}-${res.verse.verseIndex}-${idx}`}
                    result={res}
                    onWordClick={handleWordClick}
                    onViewInSurah={handleViewInSurah}
                    activePlayingAudio={activePlayingAudio}
                    onPlayAudio={handlePlayAudio}
                    onStopAudio={handleStopAudio}
                  />
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-800">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>الصفحة السابقة</span>
                    </button>

                    <span className="text-xs text-slate-400">
                      الصفحة <strong className="text-emerald-400">{currentPage}</strong> من <strong className="text-slate-200">{totalPages}</strong> (إجمالي {totalResults} آية)
                    </span>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <span>الصفحة التالية</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300">لم يتم العثور على نتائج</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  جرّب البحث بالجذر اللغوي بدلاً من الكلمة التامة، أو تأكد من خلو النص من الأخطاء الإملائية.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Morphology Analyzer */}
        {activeTab === 'morphology' && (
          <MorphologyAnalyzer
            initialWord={selectedWordForMorphology}
            searchEngine={engine}
            onSearchRoot={handleSearchRootDirectly}
          />
        )}

        {/* Tab 3: Surah Browser */}
        {activeTab === 'browse' && (
          <SurahBrowser
            surahs={surahs}
            selectedSurahIndex={browserSurahIndex}
            onSelectSurah={setBrowserSurahIndex}
            onWordClick={handleWordClick}
            targetVerseIndex={targetVerseIndex}
            activePlayingAudio={activePlayingAudio}
            onPlayAudio={handlePlayAudio}
            onStopAudio={handleStopAudio}
          />
        )}

        {/* Tab 4: Python Code & CLI Guide */}
        {activeTab === 'python' && <PythonCodeViewer />}

        {/* Tab 5: Lexicon & Statistics */}
        {activeTab === 'stats' && (
          <LexiconStats
            searchEngine={engine}
            onSelectRoot={handleSearchRootDirectly}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            برنامج البحث القرآني المتقدم وفق الخصائص الصرفية والنحوية للغة العربية • مبني بلغة Python مع واجهة تفاعلية
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>ملف البيانات: <code>quraan.json</code></span>
            <span>•</span>
            <span>البرنامج: <code>quran_search.py</code></span>
          </div>
        </div>
      </footer>

      {/* Offline Connectivity Notification Banner */}
      <OfflineIndicator />
    </div>
  );
}
