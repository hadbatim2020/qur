// src/utils/quranSearch.ts
// محرك البحث والتحليل الصرفي للقرآن الكريم متوافق تماماً مع محرك البايثون

export interface VerseItem {
  index: string;
  text: string;
}

export interface SurahItem {
  index: string;
  name: string;
  transliteration?: string;
  type?: 'meccan' | 'medinan' | string;
  total_verses?: number;
  verses: VerseItem[];
}

export interface FlatVerse {
  surahIndex: number;
  surahName: string;
  surahType: string;
  verseIndex: number;
  textUthmani: string;
  textClean: string;
  words: string[];
  roots: string[];
}

export interface SearchMatchResult {
  verse: FlatVerse;
  matchedWords: string[];
  matchedRoot?: string;
  searchType: 'exact' | 'root' | 'prefix' | 'suffix' | 'pattern';
}

export class ArabicNormalizer {
  private static TASHKEEL_REGEX = /[\u0617-\u061A\u064B-\u0652\u0656-\u065F\u0670\u06D6-\u06ED]/g;
  private static QURANIC_MARKS = /[\u06D6-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0600-\u0605\u06DD\u06DE]/g;
  private static TATWEEL_REGEX = /\u0640/g;

  static removeDiacritics(text: string): string {
    if (!text) return '';
    let cleaned = text.replace(this.TASHKEEL_REGEX, '');
    cleaned = cleaned.replace(this.QURANIC_MARKS, '');
    cleaned = cleaned.replace(this.TATWEEL_REGEX, '');
    // Normalize unicode decomposable characters
    cleaned = cleaned.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    return cleaned;
  }

  static normalizeChars(
    text: string,
    unifyAlif = true,
    unifyYaa = true,
    unifyTaaMarbuta = true
  ): string {
    if (!text) return '';
    let res = text;
    if (unifyAlif) {
      res = res.replace(/[إأآٱ]/g, 'ا');
    }
    if (unifyYaa) {
      res = res.replace(/[ىي]/g, 'ي').replace(/ئ/g, 'ي');
    }
    if (unifyTaaMarbuta) {
      res = res.replace(/ة/g, 'ه');
    }
    return res;
  }

  static cleanText(text: string, fullNormalize = true): string {
    if (!text) return '';
    let cleaned = this.removeDiacritics(text);
    if (fullNormalize) {
      cleaned = this.normalizeChars(cleaned, true, true, true);
    }
    cleaned = cleaned.replace(/[^\u0621-\u064A\s]/g, ' ');
    return cleaned.replace(/\s+/g, ' ').trim();
  }

  static tokenize(text: string, fullNormalize = true): string[] {
    const cleaned = this.cleanText(text, fullNormalize);
    return cleaned.split(' ').filter(Boolean);
  }
}

export class QuranMorphology {
  static QUAD_ROOTS = new Set([
    'زلزل', 'وسوس', 'دحرج', 'بعثر', 'كبكب', 'عسعس', 'دمدم',
    'حصحص', 'صرصر', 'قنطر', 'سلسل', 'زحزح', 'طأطأ', 'غربب'
  ]);

  static KNOWN_QURAN_ROOTS: Record<string, string> = {
    'الله': 'اله', 'الاله': 'اله', 'اله': 'اله', 'الهكم': 'اله', 'الهنا': 'اله',
    'الرحمن': 'رحم', 'الرحيم': 'رحم', 'ورحمه': 'رحم', 'ترحمنا': 'رحم', 'ارحم': 'رحم',
    'الحمد': 'حمد', 'يحمدون': 'حمد', 'حميدا': 'حمد', 'محمودا': 'حمد', 'احمد': 'حمد',
    'العالمين': 'علم', 'يعلمون': 'علم', 'تعلمون': 'علم', 'علم': 'علم', 'عليم': 'علم',
    'مالك': 'ملك', 'الملك': 'ملك', 'ملكوت': 'ملك', 'ملائكه': 'ملك', 'ملكا': 'ملك',
    'يوم': 'يوم', 'ايام': 'يوم', 'يومئذ': 'يوم',
    'الدين': 'دين', 'تدينتم': 'دين', 'مدينين': 'دين',
    'نعبد': 'عبد', 'اعبدوا': 'عبد', 'عباد': 'عبد', 'عباده': 'عبد', 'عبيد': 'عبد',
    'نستعين': 'عون', 'استعينوا': 'عون', 'عون': 'عون', 'معين': 'عون',
    'اهدنا': 'هدي', 'يهدي': 'هدي', 'اهتدوا': 'هدي', 'مهتدين': 'هدي', 'هدي': 'هدي',
    'الصراط': 'صرط',
    'المستقيم': 'قوم', 'يقيمون': 'قوم', 'قائم': 'قوم', 'قيامه': 'قوم', 'قوامين': 'قوم',
    'انعمت': 'نعم', 'نعمه': 'نعم', 'انعام': 'نعم', 'نعيم': 'نعم',
    'المغضوب': 'غضب', 'غضبا': 'غضب',
    'الضالين': 'ضلل', 'يضل': 'ضلل', 'ضلال': 'ضلل', 'اضل': 'ضلل',
    'المجرمين': 'جرم', 'مجرمون': 'جرم', 'اجرموا': 'جرم', 'اجرامي': 'جرم', 'جرم': 'جرم', 'يجرم': 'جرم',
    'المفسدين': 'فسد', 'تفسدوا': 'فسد', 'فساد': 'فسد', 'افسدوا': 'فسد',
    'المصلحين': 'صلح', 'اصلحوا': 'صلح', 'صالحات': 'صلح', 'صالح': 'صلح',
    'المتقين': 'وقي', 'اتقوا': 'وقي', 'تقوي': 'وقي', 'يتقون': 'وقي',
    'المفلحون': 'فلح', 'افلح': 'فلح',
    'الكافرين': 'كفر', 'كفروا': 'كفر', 'تكفرون': 'كفر', 'كفورا': 'كفر', 'كفار': 'كفر',
    'المؤمنين': 'امن', 'امنوا': 'امن', 'يؤمنون': 'امن', 'امانه': 'امن', 'امنين': 'امن',
    'المنافقين': 'نفق', 'نافقوا': 'نفق', 'ينفقون': 'نفق', 'انفقوا': 'نفق', 'نفقه': 'نفق',
    'السموات': 'سمو', 'السماء': 'سمو',
    'الارض': 'ارض',
    'الكتاب': 'كتب', 'يكتبون': 'كتب', 'كتب': 'كتب', 'كاتب': 'كتب',
    'القران': 'قرا', 'اقرا': 'قرا', 'يتلون': 'تلو', 'تلاوه': 'تلو',
    'الصلاه': 'صلو', 'يصلون': 'صلو', 'صلوات': 'صلو',
    'الزكاه': 'زكو', 'تزكي': 'زكو', 'ازكي': 'زكو',
    'الرسول': 'رسل', 'ارسلنا': 'رسل', 'رساله': 'رسل', 'مرسلين': 'رسل',
    'الشيطان': 'شطن', 'شياطين': 'شطن',
    'الظالمين': 'ظلم', 'ظلموا': 'ظلم', 'يظلمون': 'ظلم', 'مظلوم': 'ظلم',
    'الصابرين': 'صبر', 'اصبروا': 'صبر', 'صبر': 'صبر',
    'الشاكرين': 'شكر', 'يشكرون': 'شكر', 'شكورا': 'شكر',
    'الغفور': 'غفر', 'يغفر': 'غفر', 'مغفره': 'غفر', 'استغفر': 'غفر',
    'العزيز': 'عزز', 'عزه': 'عزز', 'تعز': 'عزز',
    'الحكيم': 'حكم', 'يحكم': 'حكم', 'حكمه': 'حكم', 'احكم': 'حكم',
    'الخالق': 'خلق', 'يخلق': 'خلق', 'خلقنا': 'خلق', 'خلائق': 'خلق',
    'النور': 'نور', 'انار': 'نور', 'منير': 'نور',
    'الظلمات': 'ظلم',
    'الحق': 'حقق', 'يحق': 'حقق',
    'الباطل': 'بطل', 'يبطل': 'بطل',
    'الجهاد': 'جهد', 'يجاهدون': 'جهد', 'جاهدوا': 'جهد',
    'الشهداء': 'شهد', 'يشهدون': 'شهد', 'شهاده': 'شهد',
    'النبيين': 'نبا', 'نبي': 'نبا', 'انباء': 'نبا',
    'البينات': 'بين', 'يبين': 'بين', 'تبيان': 'بين', 'مبين': 'بين',
    'الفوز': 'فوز', 'فاز': 'فوز', 'فائزون': 'فوز',
    'الجنه': 'جنن', 'جنات': 'جنن', 'مجنون': 'جنن', 'الجان': 'جنن',
    'النار': 'نور',
    'العذاب': 'عذب', 'يعذب': 'عذب',
    'القلوب': 'قلب', 'ينقلب': 'قلب', 'تقلب': 'قلب',
    'الابصار': 'بصر', 'يبصرون': 'بصر', 'بصير': 'بصير',
    'الاسماع': 'سمع', 'يسمعون': 'سمع', 'سميع': 'سمع'
  };

  static extractRoot(word: string): string {
    if (!word) return '';
    const w = ArabicNormalizer.cleanText(word);

    if (this.KNOWN_QURAN_ROOTS[w]) return this.KNOWN_QURAN_ROOTS[w];
    if (w.length === 3) return w;
    if (w.length === 4 && this.QUAD_ROOTS.has(w)) return w;

    let stem = w;
    // استئصال أل التعريف
    if (stem.startsWith('ال') && stem.length > 4) stem = stem.slice(2);
    else if (stem.startsWith('وال') && stem.length > 5) stem = stem.slice(3);
    else if (stem.startsWith('فال') && stem.length > 5) stem = stem.slice(3);
    else if (stem.startsWith('بال') && stem.length > 5) stem = stem.slice(3);
    else if (stem.startsWith('كال') && stem.length > 5) stem = stem.slice(3);
    else if (stem.startsWith('لل') && stem.length > 4) stem = stem.slice(2);

    if (this.KNOWN_QURAN_ROOTS[stem]) return this.KNOWN_QURAN_ROOTS[stem];

    // استئصال اللواحق
    const suffixes = [
      'تموها', 'تموني', 'تمونا', 'تان', 'تين', 'هما', 'كما',
      'ون', 'ين', 'ات', 'ان', 'هم', 'هن', 'كم', 'كن', 'نا',
      'وا', 'ها', 'يه', 'يا', 'ني', 'تي', 'ته', 'ه', 'ك', 'ي', 'ت'
    ];
    for (const suf of suffixes) {
      if (stem.endsWith(suf) && stem.length - suf.length >= 3) {
        const cand = stem.slice(0, -suf.length);
        if (this.KNOWN_QURAN_ROOTS[cand]) return this.KNOWN_QURAN_ROOTS[cand];
        stem = cand;
        break;
      }
    }

    if (this.KNOWN_QURAN_ROOTS[stem]) return this.KNOWN_QURAN_ROOTS[stem];

    // استئصال السوابق
    const prefixes = ['است', 'فاس', 'واس', 'سي', 'ست', 'سن', 'سا', 'ي', 'ت', 'ن', 'ا', 'م', 'و', 'ف', 'ب', 'ل'];
    for (const pref of prefixes) {
      if (stem.startsWith(pref) && stem.length - pref.length >= 3) {
        const cand = stem.slice(pref.length);
        if (this.KNOWN_QURAN_ROOTS[cand]) return this.KNOWN_QURAN_ROOTS[cand];
        if (cand.length === 3) {
          stem = cand;
          break;
        }
      }
    }

    if (stem.length === 3) return stem;
    if (stem.length === 4 && this.QUAD_ROOTS.has(stem)) return stem;

    // استئصال أحرف الزيادة حسب الأوزان
    const chars = stem.split('');
    const n = chars.length;

    // وزن: فَعْلال للجذور الرباعية المضعفة (وسواس -> وسوس، زلزال -> زلزل، صلصال -> صلصل)
    if (n === 5 && chars[3] === 'ا') {
      const quadCand = chars[0] + chars[1] + chars[2] + chars[4];
      if (this.QUAD_ROOTS.has(quadCand) || (chars[0] === chars[2] && chars[1] === chars[4])) {
        return quadCand;
      }
    }

    // وزن: مُفَعْلِل / مُفَعْلَل للرباعي (موسوس -> وسوس، مزلزل -> زلزل، مبعثر -> بعثر)
    if (n === 5 && chars[0] === 'م') {
      const quadCand = chars[1] + chars[2] + chars[3] + chars[4];
      if (this.QUAD_ROOTS.has(quadCand)) {
        return quadCand;
      }
    }

    // فاعل
    if (n === 4 && chars[1] === 'ا') return chars[0] + chars[2] + chars[3];
    // مفعول
    if (n === 5 && chars[0] === 'م' && chars[3] === 'و') return chars[1] + chars[2] + chars[4];
    // مفعل
    if (n === 4 && chars[0] === 'م') return chars[1] + chars[2] + chars[3];
    // فعيل
    if (n === 4 && chars[2] === 'ي') return chars[0] + chars[1] + chars[3];
    // فعول
    if (n === 4 && chars[2] === 'و') return chars[0] + chars[1] + chars[3];
    // افتعل
    if (n === 5 && chars[0] === 'ا' && chars[2] === 'ت') return chars[1] + chars[3] + chars[4];
    // تفاعل
    if (n === 5 && chars[0] === 'ت' && chars[2] === 'ا') return chars[1] + chars[3] + chars[4];
    // تفعيل
    if (n === 5 && chars[0] === 'ت' && chars[3] === 'ي') return chars[1] + chars[2] + chars[4];

    // استفعال
    if (n >= 6 && stem.startsWith('است')) {
      const sub = stem.slice(3);
      if (sub.length === 4 && sub[2] === 'ا') return sub[0] + sub[1] + sub[3];
      if (sub.length === 3) return sub;
    }

    // متفعل
    if (n === 5 && chars[0] === 'م' && chars[1] === 'ت') return chars[2] + chars[3] + chars[4];

    // تصفية الزوائد
    const extra = new Set('سألتمونيها'.split(''));
    const essential = chars.filter((c) => !extra.has(c));
    if (essential.length === 3) return essential.join('');
    if (stem.length >= 3) return stem.slice(0, 3);

    return stem;
  }
}

export class QuranSearchEngine {
  private verses: FlatVerse[] = [];
  private surahs: SurahItem[] = [];
  private rootIndex: Map<string, number[]> = new Map();
  private rootWords: Map<string, Set<string>> = new Map();
  private isLoaded = false;

  async loadDatabase(): Promise<boolean> {
    if (this.isLoaded) return true;
    try {
      const response = await fetch('/quraan.json');
      const data: SurahItem[] = await response.json();
      this.surahs = data;
      this.verses = [];

      let vId = 0;
      for (const surah of data) {
        const sIdx = parseInt(surah.index, 10);
        const sName = surah.name;
        const sType = surah.type || 'meccan';

        for (const v of surah.verses) {
          const vIdx = parseInt(v.index, 10);
          const clean = ArabicNormalizer.cleanText(v.text);
          const words = ArabicNormalizer.tokenize(v.text);
          const rootsSet = new Set<string>();

          for (const w of words) {
            const root = QuranMorphology.extractRoot(w);
            if (root) {
              rootsSet.add(root);
              if (!this.rootIndex.has(root)) {
                this.rootIndex.set(root, []);
                this.rootWords.set(root, new Set());
              }
              this.rootIndex.get(root)!.push(vId);
              this.rootWords.get(root)!.add(w);
            }
          }

          this.verses.push({
            surahIndex: sIdx,
            surahName: sName,
            surahType: sType,
            verseIndex: vIdx,
            textUthmani: v.text,
            textClean: clean,
            words,
            roots: Array.from(rootsSet)
          });
          vId++;
        }
      }

      this.isLoaded = true;
      return true;
    } catch (e) {
      console.error('Failed to load Quran database', e);
      return false;
    }
  }

  getSurahs(): SurahItem[] {
    return this.surahs;
  }

  getAllVerses(): FlatVerse[] {
    return this.verses;
  }

  searchExact(query: string, matchDiacritics = false, surahFilter?: number): SearchMatchResult[] {
    if (!query.trim()) return [];
    const results: SearchMatchResult[] = [];

    if (matchDiacritics) {
      const q = query.trim();
      for (const v of this.verses) {
        if (surahFilter && v.surahIndex !== surahFilter) continue;
        if (v.textUthmani.includes(q)) {
          results.push({
            verse: v,
            matchedWords: [q],
            searchType: 'exact'
          });
        }
      }
    } else {
      const qClean = ArabicNormalizer.cleanText(query);
      for (const v of this.verses) {
        if (surahFilter && v.surahIndex !== surahFilter) continue;
        if (v.textClean.includes(qClean)) {
          // Identify matching words
          const matched = v.words.filter((w) => w.includes(qClean) || qClean.includes(w));
          results.push({
            verse: v,
            matchedWords: matched.length > 0 ? matched : [qClean],
            searchType: 'exact'
          });
        }
      }
    }

    return results;
  }

  searchByRoot(query: string, surahFilter?: number): { root: string; derivatives: string[]; results: SearchMatchResult[] } {
    const raw = ArabicNormalizer.cleanText(query).replace(/\s+/g, '');
    let root = QuranMorphology.extractRoot(raw);
    if ((raw.length === 3 || raw.length === 4) && this.rootIndex.has(raw)) {
      root = raw;
    }

    const derivatives = Array.from(this.rootWords.get(root) || []);
    const verseIds = new Set(this.rootIndex.get(root) || []);
    const results: SearchMatchResult[] = [];

    for (const vid of verseIds) {
      const v = this.verses[vid];
      if (surahFilter && v.surahIndex !== surahFilter) continue;
      const matched = v.words.filter((w) => QuranMorphology.extractRoot(w) === root);
      results.push({
        verse: v,
        matchedWords: Array.from(new Set(matched)),
        matchedRoot: root,
        searchType: 'root'
      });
    }

    return { root, derivatives, results };
  }

  searchPattern(
    prefix = '',
    suffix = '',
    substring = '',
    regex = '',
    surahFilter?: number
  ): SearchMatchResult[] {
    const results: SearchMatchResult[] = [];
    const prefC = prefix ? ArabicNormalizer.cleanText(prefix) : '';
    const sufC = suffix ? ArabicNormalizer.cleanText(suffix) : '';
    const subC = substring ? ArabicNormalizer.cleanText(substring) : '';

    let regObj: RegExp | null = null;
    if (regex) {
      try {
        regObj = new RegExp(regex);
      } catch {
        // Ignore invalid regex
      }
    }

    for (const v of this.verses) {
      if (surahFilter && v.surahIndex !== surahFilter) continue;
      const matched: string[] = [];

      for (const w of v.words) {
        let match = true;
        if (prefC && !w.startsWith(prefC)) match = false;
        if (sufC && !w.endsWith(sufC)) match = false;
        if (subC && !w.includes(subC)) match = false;
        if (regObj && !regObj.test(w)) match = false;

        if (match) {
          matched.push(w);
        }
      }

      if (matched.length > 0) {
        results.push({
          verse: v,
          matchedWords: Array.from(new Set(matched)),
          searchType: 'pattern'
        });
      }
    }

    return results;
  }

  analyzeWord(word: string) {
    const clean = ArabicNormalizer.cleanText(word);
    const root = QuranMorphology.extractRoot(word);
    const derivatives = Array.from(this.rootWords.get(root) || []);
    const count = (this.rootIndex.get(root) || []).length;

    return {
      word,
      clean,
      root,
      type: root.length === 4 ? 'جذر رباعي' : (root.length === 3 ? 'جذر ثلاثي' : 'غير محدد'),
      derivativesCount: derivatives.length,
      sampleDerivatives: derivatives.slice(0, 15),
      versesCount: count
    };
  }

  getAllRoots(): string[] {
    return Array.from(this.rootIndex.keys()).sort();
  }
}
