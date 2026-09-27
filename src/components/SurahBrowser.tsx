import React, { useState } from 'react';
import { BookOpen, Search, Play, Pause, Copy, Check } from 'lucide-react';
import { SurahItem } from '../utils/quranSearch';

interface SurahBrowserProps {
  surahs: SurahItem[];
  selectedSurahIndex: number;
  onSelectSurah: (index: number) => void;
  onWordClick: (word: string) => void;
  targetVerseIndex?: number;
  activePlayingAudio: string | null;
  onPlayAudio: (audioUrl: string) => void;
  onStopAudio: () => void;
}

export const SurahBrowser: React.FC<SurahBrowserProps> = ({
  surahs,
  selectedSurahIndex,
  onSelectSurah,
  onWordClick,
  targetVerseIndex,
  activePlayingAudio,
  onPlayAudio,
  onStopAudio,
}) => {
  const [filterText, setFilterText] = useState('');
  const [copiedVerseIndex, setCopiedVerseIndex] = useState<number | null>(null);

  const selectedSurah = surahs.find((s) => parseInt(s.index, 10) === selectedSurahIndex) || surahs[0];

  const filteredSurahs = surahs.filter(
    (s) =>
      s.name.includes(filterText) ||
      s.index.includes(filterText) ||
      (s.transliteration && s.transliteration.toLowerCase().includes(filterText.toLowerCase()))
  );

  const pad3 = (num: number) => num.toString().padStart(3, '0');

  const handleCopyVerse = (vIdx: number, text: string) => {
    const textToCopy = `﴿ ${text} ﴾ [سورة ${selectedSurah?.name}: ${vIdx}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedVerseIndex(vIdx);
    setTimeout(() => setCopiedVerseIndex(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Surah List Sidebar */}
      <div className="lg:col-span-1 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 p-4 shadow-xl flex flex-col max-h-[800px]">
        <div className="flex items-center gap-2 mb-3 px-1">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">فهرس سور القرآن (١١٤ سورة)</h3>
        </div>

        {/* Filter input */}
        <div className="relative mb-3">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="ابحث برقم أو اسم السورة..."
            className="w-full h-10 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 pl-8 text-xs text-slate-100 placeholder-slate-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Scrollable Surah list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          {filteredSurahs.map((surah) => {
            const sIdx = parseInt(surah.index, 10);
            const isSelected = sIdx === selectedSurahIndex;

            return (
              <button
                key={surah.index}
                onClick={() => onSelectSurah(sIdx)}
                className={`w-full text-right p-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/60'
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700/70 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-lg text-[11px] font-mono flex items-center justify-center font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-emerald-400'
                    }`}
                  >
                    {surah.index}
                  </span>
                  <span className="font-medium">سورة {surah.name}</span>
                </div>
                <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                  {surah.total_verses || surah.verses.length} آية
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Surah Verses Display */}
      <div className="lg:col-span-3 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 p-6 shadow-xl flex flex-col">
        {selectedSurah && (
          <div>
            {/* Surah Header Card */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950/50 to-slate-900 border border-emerald-900/40 rounded-2xl p-5 mb-6 text-center shadow-lg">
              <span className="text-xs text-emerald-400/90 font-medium block mb-1">
                سورة رقم {selectedSurah.index}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-100 font-quran mb-2">
                سورة {selectedSurah.name}
              </h2>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                  {selectedSurah.type === 'meccan' ? 'مكية' : 'مدنية'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                  عدد الآيات: {selectedSurah.total_verses || selectedSurah.verses.length}
                </span>
              </div>

              {/* Bismillah (except for Surah At-Tawbah 9) */}
              {selectedSurah.index !== '9' && selectedSurah.index !== '1' && (
                <div className="mt-4 pt-3 border-t border-slate-800 text-lg font-quran text-amber-200/90">
                  بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
                </div>
              )}
            </div>

            {/* Verses List */}
            <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1 scrollbar-thin">
              {selectedSurah.verses.map((verse) => {
                const vIdx = parseInt(verse.index, 10);
                const isTarget = targetVerseIndex === vIdx;
                const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${pad3(parseInt(selectedSurah.index, 10))}${pad3(vIdx)}.mp3`;
                const isPlaying = activePlayingAudio === audioUrl;

                return (
                  <div
                    key={verse.index}
                    id={`verse-${selectedSurah.index}-${vIdx}`}
                    className={`p-4 rounded-xl border transition-all ${
                      isTarget
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-900/30'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80 text-xs">
                      <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded">
                        آية {verse.index}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => (isPlaying ? onStopAudio() : onPlayAudio(audioUrl))}
                          className={`p-1.5 rounded-lg transition-all ${
                            isPlaying
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-emerald-300'
                          }`}
                          title={isPlaying ? 'إيقاف' : 'استماع'}
                        >
                          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => handleCopyVerse(vIdx, verse.text)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-emerald-300 transition-all"
                          title="نسخ الآية"
                        >
                          {copiedVerseIndex === vIdx ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Text with clickable words */}
                    <div className="font-quran text-xl text-slate-100 text-right leading-loose">
                      {verse.text.split(' ').map((word, wIdx) => (
                        <span
                          key={wIdx}
                          onClick={() => onWordClick(word)}
                          title={`انقر لتحليل كلمة: ${word}`}
                          className="inline-block mx-0.5 px-1 py-0.5 rounded hover:bg-slate-800 hover:text-emerald-300 cursor-pointer transition-colors"
                        >
                          {word}
                        </span>
                      ))}
                      <span className="inline-block mx-1.5 text-emerald-400 font-sans font-bold text-sm">
                        ﴿{verse.index}﴾
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
