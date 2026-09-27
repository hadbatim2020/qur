import React, { useState } from 'react';
import { Sparkles, ArrowRight, Layers, BookOpen, Search, Check, Copy } from 'lucide-react';
import { ArabicNormalizer, QuranMorphology, QuranSearchEngine } from '../utils/quranSearch';

interface MorphologyAnalyzerProps {
  initialWord?: string;
  searchEngine: QuranSearchEngine;
  onSearchRoot: (root: string) => void;
}

export const MorphologyAnalyzer: React.FC<MorphologyAnalyzerProps> = ({
  initialWord = '',
  searchEngine,
  onSearchRoot,
}) => {
  const [inputWord, setInputWord] = useState(initialWord || 'المُجْرِمِينَ');
  const [analyzedWord, setAnalyzedWord] = useState(initialWord || 'المُجْرِمِينَ');
  const [copied, setCopied] = useState(false);

  const clean = ArabicNormalizer.cleanText(analyzedWord);
  const root = QuranMorphology.extractRoot(clean);
  const rootType = root.length === 4 ? 'جذر رباعي' : (root.length === 3 ? 'جذر ثلاثي' : 'أخرى');

  // Breakdown prefixes, stem, suffixes
  const getDeconstruction = (wordClean: string, rootStr: string) => {
    let w = wordClean;
    let prefix = '';
    let suffix = '';

    // Check prefix
    const prefixes = ['كال', 'بال', 'فال', 'وال', 'ولل', 'فلل', 'ال', 'لل', 'ف', 'و', 'ب', 'ك', 'ل', 'س', 'ي', 'ت', 'ن', 'ا'];
    for (const p of prefixes) {
      if (w.startsWith(p) && w.length - p.length >= 3) {
        prefix = p;
        w = w.slice(p.length);
        break;
      }
    }

    // Check suffix
    const suffixes = ['تموها', 'هما', 'كما', 'ون', 'ين', 'ات', 'ان', 'هم', 'هن', 'كم', 'كن', 'نا', 'وا', 'ها', 'ه', 'ك', 'ي', 'ت'];
    for (const s of suffixes) {
      if (w.endsWith(s) && w.length - s.length >= 3) {
        suffix = s;
        w = w.slice(0, -s.length);
        break;
      }
    }

    return {
      prefix: prefix || 'لا يوجد',
      stem: w || wordClean,
      suffix: suffix || 'لا يوجد',
    };
  };

  const deconstruction = getDeconstruction(clean, root);
  const analysisData = searchEngine.analyzeWord(clean);

  // Common popular test words
  const quickWords = [
    'المُجْرِمِينَ', 'الْعَالَمِينَ', 'يَسْتَغْفِرُونَ', 'فَسَيَكْفِيكَهُمُ',
    'الرَّحْمَٰنِ', 'زَلْزَلَتِ', 'الْوَسْوَاسِ', 'مُصْلِحُونَ',
    'الْمُفْسِدُونَ', 'يُنْفِقُونَ', 'الْمُتَّقِينَ', 'الصَّابِرِينَ'
  ];

  const handleAnalyze = (w: string) => {
    setInputWord(w);
    setAnalyzedWord(w);
  };

  const handleCopyRoot = () => {
    navigator.clipboard.writeText(root);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search/Analyze Input */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-slate-100">
            محلل الجذور والأوزان الصرفية للكلمات القرآنية
          </h2>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          أدخل أي كلمة أو لفظ قرآني لتفكيكه صرفياً واستخراج جذوره الأصلية (ثلاثية أو رباعية) وحصر كل تصاريفه في القرآن:
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setAnalyzedWord(inputWord)}
            placeholder="اكتب كلمة قرآنية (مثال: المجرمين، يستغفرون، فسيكفيكهم...)"
            className="flex-1 h-12 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 text-slate-100 text-sm"
          />
          <button
            onClick={() => setAnalyzedWord(inputWord)}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>حلل الكلمة</span>
          </button>
        </div>

        {/* Quick words pill bar */}
        <div className="flex items-center gap-2 flex-wrap mt-4 pt-3 border-t border-slate-700/60 text-xs">
          <span className="text-slate-400">نماذج سريعة:</span>
          {quickWords.map((w, idx) => (
            <button
              key={idx}
              onClick={() => handleAnalyze(w)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 transition-all cursor-pointer"
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Result Card */}
      <div className="bg-slate-800/90 rounded-2xl border border-emerald-900/40 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-700/70">
          <div>
            <span className="text-xs text-slate-400 block mb-1">الكلمة المحللة:</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold font-quran text-slate-100">
                {analyzedWord}
              </span>
              <span className="text-sm px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-400 border border-slate-700">
                النص المجرّد: {clean}
              </span>
            </div>
          </div>

          {/* Root Card Highlight */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-5 shadow-lg">
            <div>
              <div className="text-xs text-emerald-400/90 font-medium">الجذر اللغوي المستخرج</div>
              <div className="text-3xl font-extrabold text-amber-300 tracking-wider font-quran mt-0.5">
                {root}
              </div>
              <span className="text-xs text-slate-400 mt-1 inline-block">
                ({rootType})
              </span>
            </div>

            <div className="flex flex-col gap-1.5 border-r border-slate-700 pr-4">
              <button
                onClick={handleCopyRoot}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>نسخ الجذر</span>
              </button>
              <button
                onClick={() => onSearchRoot(root)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>بحث في القرآن</span>
              </button>
            </div>
          </div>
        </div>

        {/* Morphological Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/60 text-center">
            <span className="text-xs text-slate-400 font-medium block mb-1">السوابق (Prefixes)</span>
            <span className="text-lg font-bold text-teal-300 font-quran">
              {deconstruction.prefix}
            </span>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/60 text-center">
            <span className="text-xs text-slate-400 font-medium block mb-1">الجذع / الأصل الصرفي (Stem)</span>
            <span className="text-lg font-bold text-amber-300 font-quran">
              {deconstruction.stem}
            </span>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/60 text-center">
            <span className="text-xs text-slate-400 font-medium block mb-1">اللواحق (Suffixes)</span>
            <span className="text-lg font-bold text-teal-300 font-quran">
              {deconstruction.suffix}
            </span>
          </div>
        </div>

        {/* Derivative words for this root in the Quran */}
        <div className="mt-6 pt-5 border-t border-slate-700/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">
                مشتقات وتصاريف جذر [{root}] المسجلة في القرآن الكريم ({analysisData.derivativesCount} مشتق)
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              واردة في <strong className="text-emerald-400">{analysisData.versesCount}</strong> آية
            </span>
          </div>

          {analysisData.sampleDerivatives.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analysisData.sampleDerivatives.map((dw, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-quran text-slate-200 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
                >
                  {dw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              لم يتم العثور على مشتقات متعددة مفهرسة مباشرة لهذا اللفظ.
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => onSearchRoot(root)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>استعراض كل الآيات التي ورد فيها جذر [{root}] ({analysisData.versesCount} آية)</span>
              <ArrowRight className="w-4 h-4 mr-1 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
