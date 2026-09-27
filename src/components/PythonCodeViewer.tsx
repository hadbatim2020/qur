import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, Terminal, Play, BookOpen, Layers } from 'lucide-react';

export const PythonCodeViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const sampleCommands = [
    { cmd: 'python3 quran_search.py --root "المجرمين"', desc: 'بحث جذري صرفي عن مشتقات جذر "جرم"' },
    { cmd: 'python3 quran_search.py --exact "الحمد لله"', desc: 'بحث تام عن عبارة مطابقة' },
    { cmd: 'python3 quran_search.py --prefix "فسي"', desc: 'بحث عن الكلمات التي تبدأ بسابقة معينة' },
    { cmd: 'python3 quran_search.py --suffix "ون"', desc: 'بحث عن الكلمات التي تنتهي بلاحقة معينة' },
    { cmd: 'python3 quran_search.py', desc: 'تشغيل القائمة التفاعلية في سطر الأوامر (Interactive CLI)' },
  ];

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadFile = (filename: string, url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const pythonSnippet = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
محرك البحث المتقدم في القرآن الكريم مع المعالجة الصرفية والنحوية للغة العربية
Advanced Quranic Search Engine with Arabic Morphological & Grammatical Analysis
"""

import json
import os
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple

# ==============================================================================
# 1. صنف معالجة وتطبيع النصوص العربية (Arabic Text Normalizer)
# ==============================================================================

class ArabicNormalizer:
    TASHKEEL = re.compile(r'[\\u0617-\\u061A\\u064B-\\u0652\\u0656-\\u065F\\u0670\\u06D6-\\u06ED]')
    QURANIC_MARKS = re.compile(r'[\\u06D6-\\u06E4\\u06E7\\u06E8\\u06EA-\\u06ED\\u0600-\\u0605\\u06DD\\u06DE]')
    TATWEEL = re.compile(r'\\u0640')

    @classmethod
    def remove_diacritics(cls, text: str) -> str:
        if not text: return ""
        cleaned = cls.TASHKEEL.sub('', text)
        cleaned = cls.QURANIC_MARKS.sub('', cleaned)
        cleaned = cls.TATWEEL.sub('', cleaned)
        cleaned = unicodedata.normalize('NFKD', cleaned)
        return ''.join(c for c in cleaned if unicodedata.category(c) != 'Mn')

    @classmethod
    def normalize_chars(cls, text: str, unify_alif=True, unify_yaa=True, unify_taa_marbuta=True) -> str:
        if not text: return ""
        if unify_alif:
            text = re.sub(r'[إأآٱ]', 'ا', text)
        if unify_yaa:
            text = re.sub(r'[ىي]', 'ي', text).replace('ئ', 'ي')
        if unify_taa_marbuta:
            text = re.sub(r'ة', 'ه', text)
        return text

    @classmethod
    def clean_text(cls, text: str, full_normalization=True) -> str:
        cleaned = cls.remove_diacritics(text)
        if full_normalization:
            cleaned = cls.normalize_chars(cleaned)
        cleaned = re.sub(r'[^\\w\\s\\u0621-\\u064A]', ' ', cleaned)
        return re.sub(r'\\s+', ' ', cleaned).strip()

    @classmethod
    def tokenize(cls, text: str) -> List[str]:
        return cls.clean_text(text).split()

# ==============================================================================
# 2. صنف التجذير والاستئصال الصرفي (Morphological Stemmer & Root Extractor)
# ==============================================================================

class QuranMorphology:
    QUAD_ROOTS = {'زلزل', 'وسوس', 'دحرج', 'بعثر', 'كبكب', 'عسعس', 'دمدم', 'حصحص', 'صرصر', 'قنطر', 'سلسل'}
    
    # معجم جذور قرآني موثوق
    KNOWN_QURAN_ROOTS = {
        'الله': 'اله', 'الرحمن': 'رحم', 'الرحيم': 'رحم', 'الحمد': 'حمد', 'العالمين': 'علم',
        'مالك': 'ملك', 'الدين': 'دين', 'نعبد': 'عبد', 'نستعين': 'عون', 'اهدنا': 'هدي',
        'المستقيم': 'قوم', 'المجرمين': 'جرم', 'مجرمون': 'جرم', 'اجرموا': 'جرم', 'جرم': 'جرم',
        'المتقين': 'وقي', 'المفلحون': 'فلح', 'الكافرين': 'كفر', 'المؤمنين': 'امن', 'المنافقين': 'نفق'
        # ... ومئات الجذور الأخرى المسجلة
    }

    @classmethod
    def extract_root(cls, word: str) -> str:
        w = ArabicNormalizer.clean_text(word)
        if w in cls.KNOWN_QURAN_ROOTS: return cls.KNOWN_QURAN_ROOTS[w]
        if len(w) == 3: return w
        if len(w) == 4 and w in cls.QUAD_ROOTS: return w

        # تجريد أل التعريف والسوابق (كال، بال، فال، وال، ال، لل...)
        stem = w
        if stem.startswith(('كال', 'بال', 'فال', 'وال')) and len(stem) > 5: stem = stem[3:]
        elif stem.startswith(('ال', 'لل')) and len(stem) > 4: stem = stem[2:]
        if stem in cls.KNOWN_QURAN_ROOTS: return cls.KNOWN_QURAN_ROOTS[stem]

        # تجريد اللواحق (تموها، ون، ين، ات، ان، هم، هن، كم، نا، ها...)
        suffixes = ['تموها', 'هما', 'كما', 'ون', 'ين', 'ات', 'ان', 'هم', 'هن', 'كم', 'كن', 'نا', 'وا', 'ها', 'ه', 'ك', 'ي', 'ت']
        for s in suffixes:
            if stem.endswith(s) and len(stem) - len(s) >= 3:
                cand = stem[:-len(s)]
                if cand in cls.KNOWN_QURAN_ROOTS: return cls.KNOWN_QURAN_ROOTS[cand]
                stem = cand
                break

        # تجريد السوابق (است، ف، و، ب، ك، ل، س، ي، ت، ن، ا)
        prefixes = ['است', 'فاس', 'واس', 'سي', 'ست', 'سن', 'سا', 'ي', 'ت', 'ن', 'ا', 'م', 'و', 'ف', 'ب', 'ل']
        for p in prefixes:
            if stem.startswith(p) and len(stem) - len(p) >= 3:
                cand = stem[len(p):]
                if cand in cls.KNOWN_QURAN_ROOTS: return cls.KNOWN_QURAN_ROOTS[cand]
                if len(cand) == 3: return cand
                stem = cand
                break

        # مراعاة الأوزان الصرفية (فاعل، مفعول، مفعل، فعيل، فعول، افتعل...)
        n = len(stem)
        chars = list(stem)
        if n == 4 and chars[1] == 'ا': return chars[0] + chars[2] + chars[3] # فاعل
        if n == 5 and chars[0] == 'م' and chars[3] == 'و': return chars[1] + chars[2] + chars[4] # مفعول
        if n == 4 and chars[0] == 'م': return chars[1] + chars[2] + chars[3] # مفعل
        if n == 4 and chars[2] == 'ي': return chars[0] + chars[1] + chars[3] # فعيل
        if n == 5 and chars[0] == 'ا' and chars[2] == 'ت': return chars[1] + chars[3] + chars[4] # افتعل
        
        return stem[:3] if len(stem) >= 3 else stem

# ==============================================================================
# 3. صنف قاعدة البيانات القرآنية ومحرك البحث
# ==============================================================================

class QuranDatabase:
    def __init__(self, json_path="quraan.json"):
        self.verses = []
        self.root_to_verses = {}
        self.root_to_words = {}
        self.load_and_index(json_path)

    def load_and_index(self, path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for s in data:
            s_idx = int(s['index'])
            s_name = s['name']
            for v in s['verses']:
                v_idx = int(v['index'])
                clean = ArabicNormalizer.clean_text(v['text'])
                words = ArabicNormalizer.tokenize(v['text'])
                vid = len(self.verses)
                self.verses.append({'surah_index': s_idx, 'surah_name': s_name, 'verse_index': v_idx, 'text': v['text'], 'clean': clean, 'words': words})
                for w in words:
                    r = QuranMorphology.extract_root(w)
                    if r:
                        self.root_to_verses.setdefault(r, []).append(vid)
                        self.root_to_words.setdefault(r, set()).add(w)

class QuranAdvancedSearch:
    def __init__(self, db: QuranDatabase):
        self.db = db

    def search_exact(self, query: str):
        q = ArabicNormalizer.clean_text(query)
        return [v for v in self.db.verses if q in v['clean']]

    def search_by_root(self, query: str):
        root = QuranMorphology.extract_root(ArabicNormalizer.clean_text(query).replace(' ', ''))
        v_ids = set(self.db.root_to_verses.get(root, []))
        derivs = self.db.root_to_words.get(root, set())
        results = [self.db.verses[vid] for vid in sorted(v_ids)]
        return root, derivs, results

    def search_pattern(self, prefix="", suffix="", substring=""):
        res = []
        p_c = ArabicNormalizer.clean_text(prefix) if prefix else ""
        s_c = ArabicNormalizer.clean_text(suffix) if suffix else ""
        for v in self.db.verses:
            matched = [w for w in v['words'] if (not p_c or w.startswith(p_c)) and (not s_c or w.endswith(s_c))]
            if matched: res.append((v, matched))
        return res
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
          <div>
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-100">
                برنامج Python المستقل: <code className="text-emerald-300 font-mono text-base">quran_search.py</code>
              </h2>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              كود بايثون متكامل مبني بالأصناف (OOP) وفق أعلى معايير الصرف العربي، يعمل عبر سطر الأوامر (CLI) أو كـ Module
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>نسخ الكود كاملاً</span>
            </button>
            <button
              onClick={() => handleDownloadFile('quran_search.py', '/quran_search.py')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/60"
            >
              <Download className="w-4 h-4" />
              <span>تحميل quran_search.py</span>
            </button>
            <button
              onClick={() => handleDownloadFile('quraan.json', '/quraan.json')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ملف quraan.json</span>
            </button>
          </div>
        </div>

        {/* CLI Commands Cheatsheet */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">
              أمثلة تشغيل البرنامج من الطرفية (Terminal / CMD):
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {sampleCommands.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                  <span className="text-emerald-500 font-mono select-none">$</span>
                  <code className="text-emerald-300 font-mono font-medium text-xs sm:text-sm whitespace-nowrap">
                    {item.cmd}
                  </code>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-slate-400 text-[11px]">{item.desc}</span>
                  <button
                    onClick={() => handleCopyCommand(item.cmd)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex-shrink-0"
                    title="نسخ الأمر"
                  >
                    {copiedCmd === item.cmd ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Display Window */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-left" dir="ltr">
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="text-xs text-slate-400 font-mono ml-2">quran_search.py</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">Python 3.10+ / UTF-8</span>
        </div>

        <pre className="p-5 text-xs sm:text-sm text-slate-300 font-mono overflow-x-auto leading-relaxed max-h-[550px] scrollbar-thin">
          <code>{pythonSnippet}</code>
        </pre>
      </div>
    </div>
  );
};
