import React from 'react';
import { Search, Sparkles, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { SurahItem } from '../utils/quranSearch';

export type SearchMode = 'root' | 'exact' | 'pattern' | 'regex';

interface SearchFiltersProps {
  query: string;
  setQuery: (q: string) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  matchDiacritics: boolean;
  setMatchDiacritics: (v: boolean) => void;
  surahFilter: number | undefined;
  setSurahFilter: (s: number | undefined) => void;
  surahs: SurahItem[];
  prefixQuery: string;
  setPrefixQuery: (p: string) => void;
  suffixQuery: string;
  setSuffixQuery: (s: string) => void;
  substringQuery: string;
  setSubstringQuery: (s: string) => void;
  onSearch: () => void;
  onReset: () => void;
  isSearching: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  query,
  setQuery,
  searchMode,
  setSearchMode,
  matchDiacritics,
  setMatchDiacritics,
  surahFilter,
  setSurahFilter,
  surahs,
  prefixQuery,
  setPrefixQuery,
  suffixQuery,
  setSuffixQuery,
  substringQuery,
  setSubstringQuery,
  onSearch,
  onReset,
  isSearching,
}) => {
  const exampleSearches = [
    { label: 'المجرمين (جذر: جرم)', mode: 'root' as SearchMode, q: 'المجرمين' },
    { label: 'العالمين (جذر: علم)', mode: 'root' as SearchMode, q: 'العالمين' },
    { label: 'الرحمن الرحيم (جذر: رحم)', mode: 'root' as SearchMode, q: 'الرحمن' },
    { label: 'الحمد لله (تام)', mode: 'exact' as SearchMode, q: 'الحمد لله' },
    { label: 'زلزلت (جذر رباعي: زلزل)', mode: 'root' as SearchMode, q: 'زلزلت' },
    { label: 'الوسواس (جذر رباعي: وسوس)', mode: 'root' as SearchMode, q: 'وسوس' },
    { label: 'تبدأ بـ "فسي" (سابقة)', mode: 'pattern' as SearchMode, pref: 'فسي' },
    { label: 'تنتهي بـ "ون" (لاحقة)', mode: 'pattern' as SearchMode, suf: 'ون' },
  ];

  const handleApplyExample = (ex: typeof exampleSearches[0]) => {
    setSearchMode(ex.mode);
    if (ex.q) {
      setQuery(ex.q);
    }
    if (ex.pref) {
      setPrefixQuery(ex.pref);
      setSuffixQuery('');
      setSubstringQuery('');
    }
    if (ex.suf) {
      setSuffixQuery(ex.suf);
      setPrefixQuery('');
      setSubstringQuery('');
    }
    setTimeout(() => {
      onSearch();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 p-5 sm:p-6 shadow-xl mb-8">
      {/* Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-200">نوع البحث المتقدم:</span>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSearchMode('root')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              searchMode === 'root'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🌱 بحث جذري صرفي (مشتقات الجذر)
          </button>

          <button
            type="button"
            onClick={() => setSearchMode('exact')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              searchMode === 'exact'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎯 بحث تام (Exact Match)
          </button>

          <button
            type="button"
            onClick={() => setSearchMode('pattern')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              searchMode === 'pattern'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🧩 بحث بالسوابق واللواحق
          </button>

          <button
            type="button"
            onClick={() => setSearchMode('regex')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              searchMode === 'regex'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ⚡ نمط Regex
          </button>
        </div>
      </div>

      {/* Input area according to mode */}
      {searchMode !== 'pattern' ? (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                searchMode === 'root'
                  ? 'اكتب الجذر أو أي مشتق (مثال: المجرمين، أو جرم، أو ج ر م، أو كفر، أو كتب...)'
                  : searchMode === 'exact'
                  ? 'اكتب كلمة أو جملة مطابقة تماماً (مثال: الحمد لله، قل هو الله احد...)'
                  : 'أدخل التعبير النمطي (مثال: ^ي[\\u0621-\\u064A]{3}ون$)'
              }
              className="w-full h-12 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 pl-10 text-slate-100 placeholder-slate-500 text-sm transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                مسح
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSearch}
              disabled={isSearching}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer flex-1 sm:flex-none"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? 'جاري البحث...' : 'ابحث الآن'}</span>
            </button>
            <button
              onClick={onReset}
              title="إعادة تعيين"
              className="h-12 w-12 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Pattern Mode: Prefix, Suffix, Substring */
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                تبدأ بسابقة معينة (Prefix):
              </label>
              <input
                type="text"
                value={prefixQuery}
                onChange={(e) => setPrefixQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="مثال: فسيـ ، والـ ، كالـ ، للـ"
                className="w-full h-11 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 text-slate-100 placeholder-slate-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                تنتهي بلاحقة معينة (Suffix):
              </label>
              <input
                type="text"
                value={suffixQuery}
                onChange={(e) => setSuffixQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="مثال: ـون ، ـين ، ـات ، ـهما"
                className="w-full h-11 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 text-slate-100 placeholder-slate-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                تحتوي على مقطع (Substring):
              </label>
              <input
                type="text"
                value={substringQuery}
                onChange={(e) => setSubstringQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="مثال: جهاد ، استغفار"
                className="w-full h-11 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 text-slate-100 placeholder-slate-500 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onSearch}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>بحث بالأنماط</span>
            </button>
            <button
              onClick={onReset}
              className="h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-400 text-sm"
            >
              تفريغ
            </button>
          </div>
        </div>
      )}

      {/* Additional Options & Surah Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-700/50 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          {/* Tashkeel checkbox for exact match */}
          {searchMode === 'exact' && (
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={matchDiacritics}
                onChange={(e) => setMatchDiacritics(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
              />
              <span>مطابقة التشكيل وحركات الإعراب حرفياً</span>
            </label>
          )}

          {/* Surah Filter dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">تصفية بالسورة:</span>
            <select
              value={surahFilter !== undefined ? surahFilter : ''}
              onChange={(e) =>
                setSurahFilter(e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
            >
              <option value="">كامل القرآن (١١٤ سورة)</option>
              {surahs.map((s) => (
                <option key={s.index} value={s.index}>
                  {s.index}. سورة {s.name} ({s.total_verses || s.verses.length} آية)
                </option>
              ))}
            </select>
          </div>
        </div>

        {searchMode === 'root' && (
          <div className="text-slate-400 text-xs">
            💡 <span className="text-emerald-400">ملاحظة:</span> يمكنك إدخال الكلمة بالزوائد (مثل: "المجرمين") وسيقوم المحرك تلقائياً باشتقاق جذرها (جرم) والبحث في جميع تصاريفها.
          </div>
        )}
      </div>

      {/* Quick Example Suggestions */}
      <div className="mt-4 pt-3 border-t border-slate-700/40">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-slate-400 font-medium">أمثلة سريعة للتجربة:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {exampleSearches.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyExample(ex)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 transition-all cursor-pointer"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
