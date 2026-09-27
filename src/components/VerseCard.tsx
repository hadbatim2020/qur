import React, { useState } from 'react';
import { Copy, Check, Play, Pause, Volume2, Sparkles, BookOpen } from 'lucide-react';
import { FlatVerse, SearchMatchResult } from '../utils/quranSearch';

interface VerseCardProps {
  result: SearchMatchResult;
  onWordClick: (word: string) => void;
  onViewInSurah: (surahIndex: number, verseIndex: number) => void;
  activePlayingAudio: string | null;
  onPlayAudio: (audioUrl: string) => void;
  onStopAudio: () => void;
}

export const VerseCard: React.FC<VerseCardProps> = ({
  result,
  onWordClick,
  onViewInSurah,
  activePlayingAudio,
  onPlayAudio,
  onStopAudio,
}) => {
  const [copied, setCopied] = useState(false);
  const verse = result.verse;

  // Format surah and verse into standard 3-digit strings for audio URL
  const pad3 = (num: number) => num.toString().padStart(3, '0');
  const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${pad3(verse.surahIndex)}${pad3(verse.verseIndex)}.mp3`;
  const isPlaying = activePlayingAudio === audioUrl;

  const handleCopy = () => {
    const textToCopy = `﴿ ${verse.textUthmani} ﴾ [سورة ${verse.surahName}: ${verse.verseIndex}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAudio = () => {
    if (isPlaying) {
      onStopAudio();
    } else {
      onPlayAudio(audioUrl);
    }
  };

  // Helper to highlight matching words in the Uthmani text
  const renderHighlightedVerse = () => {
    const tokens = verse.textUthmani.split(' ');
    const matchedCleanSet = new Set(result.matchedWords);

    return tokens.map((word, idx) => {
      // Clean word for comparison
      const cleanW = word.replace(/[\u0617-\u061A\u064B-\u0652\u0656-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
        .replace(/[إأآٱ]/g, 'ا')
        .replace(/[ىي]/g, 'ي')
        .replace(/ة/g, 'ه');

      const isMatch = Array.from(matchedCleanSet).some(
        (m) => cleanW.includes(m) || m.includes(cleanW)
      );

      return (
        <span
          key={idx}
          onClick={() => onWordClick(word)}
          title={`انقر للتحليل الصرفي لكلمة: ${word}`}
          className={`inline-block mx-0.5 px-1 py-0.5 rounded cursor-pointer transition-colors ${
            isMatch
              ? 'bg-amber-400/25 text-amber-200 border-b-2 border-amber-400 font-bold hover:bg-amber-400/40'
              : 'hover:bg-slate-700/50 text-slate-100'
          }`}
        >
          {word}
        </span>
      );
    });
  };

  return (
    <div className="bg-slate-800/90 rounded-2xl border border-slate-700/70 p-5 sm:p-6 shadow-md hover:border-emerald-500/40 transition-all group">
      {/* Top Bar: Surah, Index, Revelation, Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-700/50 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold font-mono">
            {verse.surahIndex}
          </div>
          <span className="text-sm font-bold text-slate-100">
            سورة {verse.surahName}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[11px]">
            آية {verse.verseIndex}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              verse.surahType === 'meccan'
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                : 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
            }`}
          >
            {verse.surahType === 'meccan' ? 'مكية' : 'مدنية'}
          </span>
        </div>

        {/* Buttons: Audio, Copy, Context */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleAudio}
            className={`p-2 rounded-xl transition-all ${
              isPlaying
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-700 hover:text-emerald-300'
            }`}
            title={isPlaying ? 'إيقاف التلاوة' : 'استماع للتلاوة بصوت العفاسي'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:bg-slate-700 hover:text-emerald-300 transition-all"
            title="نسخ الآية مع المرجع"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onViewInSurah(verse.surahIndex, verse.verseIndex)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/80 text-slate-300 hover:bg-slate-700 hover:text-emerald-300 transition-all text-xs"
            title="عرض السورة كاملة"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">السورة</span>
          </button>
        </div>
      </div>

      {/* Quran Verse Text */}
      <div className="font-quran text-xl sm:text-2xl text-slate-100 text-right leading-loose tracking-wide py-2">
        {renderHighlightedVerse()}
        <span className="inline-block mx-2 text-emerald-400 font-sans font-bold text-base">
          ﴿{verse.verseIndex}﴾
        </span>
      </div>

      {/* Matched Details Bar */}
      <div className="mt-4 pt-3 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400">الكلمات المطابقة في الآية:</span>
          {result.matchedWords.map((mw, i) => (
            <span
              key={i}
              onClick={() => onWordClick(mw)}
              className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-pointer hover:bg-amber-500/25"
            >
              {mw}
            </span>
          ))}

          {result.matchedRoot && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>الجذر المستخرج: <strong>{result.matchedRoot}</strong></span>
            </span>
          )}
        </div>

        <span className="text-slate-400 text-[11px]">
          انقر على أي كلمة لعرض تحليلها الصرفي وجذرها
        </span>
      </div>
    </div>
  );
};
