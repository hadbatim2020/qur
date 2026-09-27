#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
محرك البحث المتقدم في القرآن الكريم مع المعالجة الصرفية والنحوية للغة العربية
Advanced Quranic Search Engine with Arabic Morphological & Grammatical Analysis

الميزات الأساسية:
1. معالجة النصوص وتجريد التشكيل وتوحيد الأشكال الإملائية (Arabic Normalization).
2. استخراج الجذور الثلاثية والرباعية وتجريد السوابق واللواحق (Stemming & Root Extraction).
3. البحث التام (Exact Search) بالتشكيل وبدون تشكيل.
4. البحث الجذري (Root-based Search) لجلب جميع مشتقات الجذر في القرآن الكريم.
5. البحث بالنمط والجزء (Pattern, Prefix, Suffix, Substring & Regex Search).
6. تصنيف النتائج، وإبراز الكلمات المطابقة، والإحصائيات المفصلة.
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
    """
    صنف مسؤول عن تنظيف وتطبيع النصوص العربية:
    - إزالة التشكيل وعلامات الضبط المصحفي
    - توحيد صور الهمزات والألفات
    - توحيد الياء والألف المقصورة، والتاء المربوطة والهاء
    - إزالة علامات التطويل والتطريز والترقيم
    """

    # علامات التشكيل وحركات الإعراب
    TASHKEEL = re.compile(
        r'[\u0617-\u061A\u064B-\u0652\u0656-\u065F\u0670\u06D6-\u06ED]'
    )

    # علامات الوقف والرموز القرآنية الخاصة
    QURANIC_MARKS = re.compile(r'[\u06D6-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0600-\u0605\u06DD\u06DE]')

    # التطويل (الكشيدة)
    TATWEEL = re.compile(r'\u0640')

    @classmethod
    def remove_diacritics(cls, text: str) -> str:
        """
        إزالة كافة حركات التشكيل والتنوين والسكون وعلامات الضبط المصحفي
        مع الحفاظ على الحروف الأصلية فقط.
        """
        if not text:
            return ""
        # إزالة التشكيل القياسي وعلامات المصحف
        cleaned = cls.TASHKEEL.sub('', text)
        cleaned = cls.QURANIC_MARKS.sub('', cleaned)
        cleaned = cls.TATWEEL.sub('', cleaned)
        # إزالة أي علامات دمج شاذة عبر تفكيك Unicode
        cleaned = unicodedata.normalize('NFKD', cleaned)
        cleaned = ''.join(c for c in cleaned if unicodedata.category(c) != 'Mn')
        return cleaned

    @classmethod
    def normalize_chars(
        cls,
        text: str,
        unify_alif: bool = True,
        unify_yaa: bool = True,
        unify_taa_marbuta: bool = True,
        unify_waw_hamza: bool = False
    ) -> str:
        """
        توحيد صور الحروف المختلفة:
        - توحيد الألفات (أ، إ، آ، ٱ -> ا)
        - توحيد الياء والألف المقصورة (ى -> ي)
        - توحيد التاء المربوطة (ة -> ه)
        """
        if not text:
            return ""

        # توحيد الألفات
        if unify_alif:
            text = re.sub(r'[إأآٱ]', 'ا', text)

        # توحيد الألف المقصورة والياء
        if unify_yaa:
            text = re.sub(r'[ىي]', 'ي', text)
            text = re.sub(r'ئ', 'ي', text)

        # توحيد التاء المربوطة مع الهاء
        if unify_taa_marbuta:
            text = re.sub(r'ة', 'ه', text)

        if unify_waw_hamza:
            text = re.sub(r'ؤ', 'و', text)

        return text

    @classmethod
    def clean_text(cls, text: str, full_normalization: bool = True) -> str:
        """
        تنظيف وتطبيع شامل للنص القرآني لتسهيل المقارنة والبحث الدقيق والمرن
        """
        if not text:
            return ""
        # إزالة التشكيل
        cleaned = cls.remove_diacritics(text)
        # توحيد الحروف
        if full_normalization:
            cleaned = cls.normalize_chars(cleaned, unify_alif=True, unify_yaa=True, unify_taa_marbuta=True)
        # إزالة علامات الترقيم والأقواس والأرقام الزائدة
        cleaned = re.sub(r'[^\w\s\u0621-\u064A]', ' ', cleaned)
        # توحيد المسافات
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned

    @classmethod
    def tokenize(cls, text: str, full_normalization: bool = True) -> List[str]:
        """تقطيع النص إلى كلمات نظيفة"""
        cleaned = cls.clean_text(text, full_normalization=full_normalization)
        return [w for w in cleaned.split() if w]


# ==============================================================================
# 2. صنف التجذير والاستئصال الصرفي (Morphological Stemmer & Root Extractor)
# ==============================================================================

class QuranMorphology:
    """
    محلل صرفي خفيف ومُتقن مخصص لألفاظ القرآن الكريم:
    - يتعرف على السوابق (Prefixes) مثل: الواو، الفاء، الباء، الكاف، اللام، السين، أل التعريف...
    - يتعرف على اللواحق (Suffixes) مثل: ضمائر الغائب والمخاطب والمتكلم، علامات الجمع والمثنى...
    - يتعامل مع الأوزان الصرفية القياسية (افتعال، استفعال، تفعيل، فاعل، مفعول، مفعولين، إلخ).
    - يدعم الجذور الثلاثية والرباعية.
    """

    # قائمة السوابق المنظمة حسب الطول تنازلياً
    PREFIXES = [
        'كال', 'بال', 'فال', 'وال', 'ولل', 'فلل',
        'وبال', 'وفال', 'وللت', 'وبالت',
        'است', 'فاس', 'واس', 'سي', 'ست', 'سن', 'سا',
        'ال', 'لل',
        'ف', 'و', 'ب', 'ك', 'ل', 'س', 'ي', 'ت', 'ن', 'ا'
    ]

    # قائمة اللواحق المنظمة حسب الطول تنازلياً
    SUFFIXES = [
        'تموها', 'تموني', 'تمونا', 'تموه',
        'كما', 'هما', 'تان', 'تين',
        'هاتان', 'هاتين',
        'هم', 'هن', 'كم', 'كن', 'نا', 'ها', 'وا', 'ون', 'ين', 'ات', 'ان',
        'يه', 'يا', 'ني', 'تي', 'ته',
        'ه', 'ك', 'ي', 'ت', 'ا'
    ]

    # قائمة نماذج الجذور الرباعية الشهيرة في القرآن
    QUAD_ROOTS = {
        'زلزل', 'وسوس', 'دحرج', 'بعثر', 'كبكب', 'عسعس', 'دمدم',
        'حصحص', 'صرصر', 'قنطر', 'سلسل', 'زحزح', 'طأطأ', 'غربب',
        'عسقل', 'مرمر', 'شقشق', 'بلبل', 'جعجع', 'قرقر', 'طمطم',
        'جعفر', 'فردس', 'برقع', 'خندف', 'درهم', 'دينر', 'قسطر'
    }

    # معجم جذور قرآني موثوق وشامل لأشهر كلمات القرآن ومفرداته
    KNOWN_QURAN_ROOTS: Dict[str, str] = {
        # أمثلة شائعة وتطبيقات دقيقة
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
    }

    @classmethod
    def extract_root(cls, word: str) -> str:
        """
        استخراج الجذر التقديري للكلمة العربية:
        1. التحقق من المعجم القرآني الموثق.
        2. تجريد السوابق واللواحق بالتدريج.
        3. مراعاة الأوزان الصرفية وحروف الزيادة العشرة (سألتمونيها).
        4. التعامل مع الجذور الرباعية والثلاثية.
        """
        if not word:
            return ""

        # تنظيف الكلمة
        w = ArabicNormalizer.clean_text(word)

        # 1. فحص المعجم المباشر
        if w in cls.KNOWN_QURAN_ROOTS:
            return cls.KNOWN_QURAN_ROOTS[w]

        # فحص إذا كانت الكلمة نفسها جذراً ثلاثياً أو رباعياً
        if len(w) == 3:
            return w
        if len(w) == 4 and w in cls.QUAD_ROOTS:
            return w

        # 2. تجريد أل التعريف والسوابق الشائعة
        stem = w
        # تجريد أل التعريف
        if stem.startswith('ال') and len(stem) > 4:
            stem = stem[2:]
        elif stem.startswith('وال') and len(stem) > 5:
            stem = stem[3:]
        elif stem.startswith('فال') and len(stem) > 5:
            stem = stem[3:]
        elif stem.startswith('بال') and len(stem) > 5:
            stem = stem[3:]
        elif stem.startswith('كال') and len(stem) > 5:
            stem = stem[3:]
        elif stem.startswith('لل') and len(stem) > 4:
            stem = stem[2:]

        # فحص المعجم بعد إزالة التعريف
        if stem in cls.KNOWN_QURAN_ROOTS:
            return cls.KNOWN_QURAN_ROOTS[stem]

        # تجريد اللواحق الطويلة أولاً
        suffixes_to_try = [
            'تموها', 'تموني', 'تمونا', 'تان', 'تين', 'هما', 'كما',
            'ون', 'ين', 'ات', 'ان', 'هم', 'هن', 'كم', 'كن', 'نا',
            'وا', 'ها', 'يه', 'يا', 'ني', 'تي', 'ته', 'ه', 'ك', 'ي', 'ت'
        ]
        for suf in suffixes_to_try:
            if stem.endswith(suf) and len(stem) - len(suf) >= 3:
                cand = stem[:-len(suf)]
                if cand in cls.KNOWN_QURAN_ROOTS:
                    return cls.KNOWN_QURAN_ROOTS[cand]
                stem = cand
                break

        # فحص المعجم بعد إزالة اللاحقة
        if stem in cls.KNOWN_QURAN_ROOTS:
            return cls.KNOWN_QURAN_ROOTS[stem]

        # تجريد سوابق الأفعال والمضارعة
        prefixes_to_try = ['است', 'فاس', 'واس', 'سي', 'ست', 'سن', 'سا', 'ي', 'ت', 'ن', 'ا', 'م', 'و', 'ف', 'ب', 'ل']
        for pref in prefixes_to_try:
            if stem.startswith(pref) and len(stem) - len(pref) >= 3:
                cand = stem[len(pref):]
                if cand in cls.KNOWN_QURAN_ROOTS:
                    return cls.KNOWN_QURAN_ROOTS[cand]
                # إذا وصلنا إلى 3 حروف، قد نكون وصلنا للجذر
                if len(cand) == 3:
                    stem = cand
                    break

        if len(stem) == 3:
            return stem

        if len(stem) == 4 and stem in cls.QUAD_ROOTS:
            return stem

        # 3. إزالة أحرف الزيادة حسب الأوزان الصرفية
        # حروف الزيادة مجموعة في (سألتمونيها)
        chars = list(stem)
        n = len(chars)

        # وزن: فَعْلال للجذور الرباعية المضعفة (وسواس -> وسوس، زلزال -> زلزل، صلصال -> صلصل)
        if n == 5 and chars[3] == 'ا':
            quad_candidate = chars[0] + chars[1] + chars[2] + chars[4]
            if quad_candidate in cls.QUAD_ROOTS or (chars[0] == chars[2] and chars[1] == chars[4]):
                return quad_candidate

        # وزن: مُفَعْلِل / مُفَعْلَل للرباعي (موسوس -> وسوس، مزلزل -> زلزل، مبعثر -> بعثر)
        if n == 5 and chars[0] == 'م':
            quad_cand = chars[1] + chars[2] + chars[3] + chars[4]
            if quad_cand in cls.QUAD_ROOTS:
                return quad_cand

        # وزن: فاعل (كـاتب -> كتب)
        if n == 4 and chars[1] == 'ا':
            return chars[0] + chars[2] + chars[3]

        # وزن: مفعول (مكتوب -> كتب)
        if n == 5 and chars[0] == 'م' and chars[3] == 'و':
            return chars[1] + chars[2] + chars[4]

        # وزن: مفعل / مفعلة (مسجد -> سجد)
        if n == 4 and chars[0] == 'م':
            return chars[1] + chars[2] + chars[3]

        # وزن: فعيل (عليم / رحيم -> علم / رحم)
        if n == 4 and chars[2] == 'ي':
            return chars[0] + chars[1] + chars[3]

        # وزن: فعول (غفور -> غفر)
        if n == 4 and chars[2] == 'و':
            return chars[0] + chars[1] + chars[3]

        # وزن: افتعل (اجتمع -> جمع, اكتسب -> كسب)
        if n == 5 and chars[0] == 'ا' and chars[2] == 'ت':
            return chars[1] + chars[3] + chars[4]

        # وزن: تفاعل (تشارك -> شرك)
        if n == 5 and chars[0] == 'ت' and chars[2] == 'ا':
            return chars[1] + chars[3] + chars[4]

        # وزن: تفعيل (تكريم -> كرم)
        if n == 5 and chars[0] == 'ت' and chars[3] == 'ي':
            return chars[1] + chars[2] + chars[4]

        # وزن: استفعال (استغفار -> غفر)
        if n >= 6 and stem.startswith('است'):
            sub = stem[3:]
            if len(sub) == 4 and sub[2] == 'ا':  # استغفار
                return sub[0] + sub[1] + sub[3]
            if len(sub) == 3:
                return sub

        # وزن مـتـفـعـل
        if n == 5 and chars[0] == 'م' and chars[1] == 'ت':
            return chars[2] + chars[3] + chars[4]

        # كحل أخير إذا كانت الكلمة تزيد عن 3 أحرف، نستخلص أهم 3 أحرف غير الزائدة
        extra = set('سألتمونيها')
        essential = [c for c in stem if c not in extra]
        if len(essential) == 3:
            return ''.join(essential)
        elif len(stem) >= 3:
            return stem[:3]

        return stem


# ==============================================================================
# 3. هياكل البيانات للآيات والسور (Data Models)
# ==============================================================================

@dataclass
class Verse:
    surah_index: int
    surah_name: str
    verse_index: int
    text_uthmani: str
    text_clean: str
    words: List[str] = field(default_factory=list)
    roots: Set[str] = field(default_factory=set)

    def to_dict(self):
        return {
            'surah_index': self.surah_index,
            'surah_name': self.surah_name,
            'verse_index': self.verse_index,
            'text_uthmani': self.text_uthmani,
            'text_clean': self.text_clean,
            'roots': list(self.roots)
        }


@dataclass
class SearchResult:
    verse: Verse
    matched_word: str
    matched_root: Optional[str] = None
    search_type: str = "exact"
    highlight_positions: List[Tuple[int, int]] = field(default_factory=list)


# ==============================================================================
# 4. صنف قاعدة بيانات القرآن والفهرسة (Quran Database & Indexer)
# ==============================================================================

class QuranDatabase:
    """
    إدارة قاعدة بيانات القرآن الكريم:
    - تحميل ملف JSON (quraan.json)
    - بناء فهارس مقلوبة (Inverted Indexes):
        * فهرس الكلمات المنظفة (Word Index)
        * فهرس الجذور اللغوية (Root Index)
        * فهرس السور والآيات
    """

    def __init__(self, json_path: str = "quraan.json"):
        self.json_path = json_path
        self.verses: List[Verse] = []
        self.surahs_meta: List[Dict] = []
        self.word_to_verses: Dict[str, List[int]] = {}
        self.root_to_verses: Dict[str, List[int]] = {}
        self.root_to_words: Dict[str, Set[str]] = {}
        self.total_words_count = 0

        self.load_and_index()

    def load_and_index(self):
        """تحميل ملف JSON وتوليد الفهارس المقلوبة بدقة وسرعة عالية"""
        if not os.path.exists(self.json_path):
            raise FileNotFoundError(f"لم يتم العثور على ملف القرآن: {self.json_path}")

        with open(self.json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        verse_id = 0
        for surah_data in data:
            s_idx = int(surah_data.get('index', 0))
            s_name = surah_data.get('name', '')
            total_v = int(surah_data.get('total_verses', len(surah_data.get('verses', []))))
            s_type = surah_data.get('type', '')

            self.surahs_meta.append({
                'index': s_idx,
                'name': s_name,
                'total_verses': total_v,
                'type': s_type
            })

            verses_list = surah_data.get('verses', [])
            for v_data in verses_list:
                v_idx = int(v_data.get('index', 0))
                uthmani = v_data.get('text', '')
                clean = ArabicNormalizer.clean_text(uthmani)
                words = ArabicNormalizer.tokenize(uthmani)

                verse_obj = Verse(
                    surah_index=s_idx,
                    surah_name=s_name,
                    verse_index=v_idx,
                    text_uthmani=uthmani,
                    text_clean=clean,
                    words=words
                )

                # فهرسة الكلمات والجذور
                for word in words:
                    self.total_words_count += 1
                    # فهرس الكلمة
                    if word not in self.word_to_verses:
                        self.word_to_verses[word] = []
                    self.word_to_verses[word].append(verse_id)

                    # استخراج الجذر وفهرسته
                    root = QuranMorphology.extract_root(word)
                    if root:
                        verse_obj.roots.add(root)
                        if root not in self.root_to_verses:
                            self.root_to_verses[root] = []
                            self.root_to_words[root] = set()
                        self.root_to_verses[root].append(verse_id)
                        self.root_to_words[root].add(word)

                self.verses.append(verse_obj)
                verse_id += 1

        print(f"تم تحميل القرآن بنجاح: {len(self.surahs_meta)} سورة، {len(self.verses)} آية، {len(self.root_to_verses)} جذراً لغوياً.")


# ==============================================================================
# 5. محرك البحث القرآني المتقدم (Advanced Quran Search Engine)
# ==============================================================================

class QuranAdvancedSearch:
    """
    محرك البحث القرآني الذكي والمتقدم:
    - البحث التام (Exact Match)
    - البحث الجذري الشامل (Root-Based Search)
    - البحث باللواحق والسوابق والأنماط (Prefix/Suffix/Pattern)
    - البحث بالتعابير النمطية (Regex)
    """

    def __init__(self, db: QuranDatabase):
        self.db = db

    def search_exact(self, query: str, match_diacritics: bool = False) -> List[SearchResult]:
        """
        البحث التام عن كلمة أو جملة كاملة:
        - match_diacritics=True: مطابقة دقيقة بحركات التشكيل.
        - match_diacritics=False: مطابقة مرنة مع إهمال التشكيل وتوحيد الألفات والياء والتاء المربوطة.
        """
        results = []
        if not query or not query.strip():
            return results

        if match_diacritics:
            # بحث دقيق بالتشكيل
            q = query.strip()
            for v in self.db.verses:
                if q in v.text_uthmani:
                    results.append(SearchResult(
                        verse=v,
                        matched_word=q,
                        search_type="exact_diacritics"
                    ))
        else:
            # بحث تام بدون تشكيل
            q_clean = ArabicNormalizer.clean_text(query)
            q_pattern = re.compile(rf'\b{re.escape(q_clean)}\b' if ' ' not in q_clean else re.escape(q_clean))

            for v in self.db.verses:
                if q_clean in v.text_clean:
                    # تحقق من وجود المطابقة
                    results.append(SearchResult(
                        verse=v,
                        matched_word=q_clean,
                        search_type="exact"
                    ))

        return results

    def search_by_root(self, query: str) -> Tuple[str, Set[str], List[SearchResult]]:
        """
        البحث بالجذر اللغوي:
        1. إذا أدخل المستخدم جذر مفرّق (مثل: ج ر م أو جرم) أو كلمة مشتقة (مثل: المجرمين).
        2. يستخرج المحرك الجذر اللغوي الثلاثي أو الرباعي.
        3. يبحث عن جميع الآيات التي وردت فيها مشتقات هذا الجذر.
        يرجع: (الجذر المستخرج، قائمة المشتقات القرآنية لهذا الجذر، قائمة نتائج الآيات)
        """
        # تنظيف المدخل وإزالة المسافات بين الحروف إن وجدت (مثل: ك ت ب -> كتب)
        raw = ArabicNormalizer.clean_text(query).replace(" ", "")
        
        # استخراج الجذر
        root = QuranMorphology.extract_root(raw)
        
        # إذا كان المدخل 3 أو 4 حروف، قد يكون هو الجذر بذاته
        if len(raw) in (3, 4) and raw in self.db.root_to_verses:
            root = raw

        derivative_words = self.db.root_to_words.get(root, set())
        verse_ids = set(self.db.root_to_verses.get(root, []))

        results = []
        for vid in sorted(verse_ids):
            v = self.db.verses[vid]
            # تحديد الكلمات من نفس الجذر في هذه الآية
            matched_in_verse = [w for w in v.words if QuranMorphology.extract_root(w) == root]
            results.append(SearchResult(
                verse=v,
                matched_word=", ".join(set(matched_in_verse)),
                matched_root=root,
                search_type="root"
            ))

        return root, derivative_words, results

    def search_pattern(
        self,
        prefix: str = "",
        suffix: str = "",
        substring: str = "",
        regex_pattern: str = ""
    ) -> List[SearchResult]:
        """
        البحث بالنمط والأجزاء:
        - prefix: الكلمات التي تبدأ بمقطع معين (مثال: 'فسي', 'وال')
        - suffix: الكلمات التي تنتهي بمقطع معين (مثال: 'ون', 'ين')
        - substring: الكلمات التي تحتوي على مقطع معين
        - regex_pattern: تعبير نمطي مخصص
        """
        results = []
        pref_c = ArabicNormalizer.clean_text(prefix) if prefix else ""
        suf_c = ArabicNormalizer.clean_text(suffix) if suffix else ""
        sub_c = ArabicNormalizer.clean_text(substring) if substring else ""

        reg = None
        if regex_pattern:
            try:
                reg = re.compile(regex_pattern)
            except re.error as e:
                print(f"خطأ في صياغة التعبير النمطي: {e}")
                return []

        for v in self.db.verses:
            matched_words = []
            for w in v.words:
                match = True
                if pref_c and not w.startswith(pref_c):
                    match = False
                if suf_c and not w.endswith(suf_c):
                    match = False
                if sub_c and sub_c not in w:
                    match = False
                if reg and not reg.search(w):
                    match = False

                if match:
                    matched_words.append(w)

            if matched_words:
                results.append(SearchResult(
                    verse=v,
                    matched_word=", ".join(set(matched_words)),
                    search_type="pattern"
                ))

        return results

    def analyze_word(self, word: str) -> Dict:
        """تحليل صرفي كامل لمفردة قرآنية"""
        clean = ArabicNormalizer.clean_text(word)
        root = QuranMorphology.extract_root(word)
        derivatives = list(self.db.root_to_words.get(root, []))
        occurrences = len(self.db.root_to_verses.get(root, []))

        return {
            'original': word,
            'normalized': clean,
            'root': root,
            'root_length': len(root),
            'root_type': 'رباعي' if len(root) == 4 else ('ثلاثي' if len(root) == 3 else 'غير محدد'),
            'quran_derivatives_count': len(derivatives),
            'sample_derivatives': derivatives[:10],
            'verses_count_for_root': occurrences
        }


# ==============================================================================
# 6. واجهة سطر الأوامر التفاعلية (Interactive CLI)
# ==============================================================================

def print_banner():
    banner = """
========================================================================
   مُحرك البحث المتقدم في القرآن الكريم (Arabic Morphological Quran Search)
   يراعي بدقة: الجذور، السوابق، اللواحق، الأوزان، وإهمال التشكيل
========================================================================
    """
    print(banner)


def display_results(results: List[SearchResult], max_display: int = 15):
    """عرض منسق وجميل للنتائج في الطرفية"""
    total = len(results)
    print(f"\n[+] إجمالي الآيات المطابقة: {total}")
    if total == 0:
        print("[-] لم يتم العثور على نتائج مطابقة.")
        return

    display_count = min(total, max_display)
    print(f"[i] عرض أول {display_count} نتيجة:\n")

    for i, res in enumerate(results[:display_count], 1):
        v = res.verse
        print(f"--- ({i}) سورة {v.surah_name} [رقم السورة: {v.surah_index} - آية: {v.verse_index}] ---")
        print(f"النص العثماني: {v.text_uthmani}")
        if res.matched_root:
            print(f"الجذر: [{res.matched_root}] | الكلمات المطابقة: {res.matched_word}")
        else:
            print(f"المطابقة: {res.matched_word}")
        print()


def interactive_cli():
    print_banner()
    db_file = "quraan.json" if os.path.exists("quraan.json") else "public/quraan.json"
    print(f"[*] جاري تحميل قاعدة البيانات من '{db_file}'...")
    db = QuranDatabase(db_file)
    search_engine = QuranAdvancedSearch(db)
    print("[*] تم تهيئة المحرك بنجاح!")

    while True:
        print("\n" + "="*50)
        print("القائمة الرئيسية للبحث:")
        print("1. بحث تام (Exact Match - كلمة أو عبارة)")
        print("2. بحث جذري صرفي (Root-based Search - مشتقات الجذر)")
        print("3. بحث بالسوابق أو اللواحق أو الأنماط (Pattern Search)")
        print("4. تحليل صرفي لكلمة واستخراج جذرها (Morphology Analysis)")
        print("5. تصفح سورة معينة (Browse Surah)")
        print("0. خروج (Exit)")
        print("="*50)

        choice = input("اختر رقم العملية (0-5): ").strip()

        if choice == '1':
            q = input("\nأدخل الكلمة أو العبارة للبحث التام: ").strip()
            diac = input("هل تريد مطابقة التشكيل حرفياً؟ (نعم/لا) [افتراضي: لا]: ").strip().lower() in ['نعم', 'y', 'yes']
            res = search_engine.search_exact(q, match_diacritics=diac)
            display_results(res)

        elif choice == '2':
            q = input("\nأدخل الجذر (مثل: ج ر م أو جرم) أو كلمة مشتقة (مثل: المجرمين): ").strip()
            root, derivs, res = search_engine.search_by_root(q)
            print(f"\n[*] الجذر المستخلص: [{root}]")
            print(f"[*] المشتقات الواردة في القرآن ({len(derivs)} مشتق): {', '.join(sorted(derivs)[:15])}...")
            display_results(res)

        elif choice == '3':
            print("\nأدخل معايير النمط (يمكن ترك أي حقل فارغاً):")
            pref = input("تبدأ بـ (السابقة - Prefix): ").strip()
            suf = input("تنتهي بـ (اللاحقة - Suffix): ").strip()
            sub = input("تحتوي على (Substring): ").strip()
            res = search_engine.search_pattern(prefix=pref, suffix=suf, substring=sub)
            display_results(res)

        elif choice == '4':
            w = input("\nأدخل الكلمة المراد تحليلها: ").strip()
            info = search_engine.analyze_word(w)
            print("\n--- نتيجة التحليل الصرفي ---")
            print(f"الكلمة الأصلية: {info['original']}")
            print(f"النص بعد التطبيع: {info['normalized']}")
            print(f"الجذر المستخرج: {info['root']} ({info['root_type']})")
            print(f"عدد المشتقات المسجلة في القرآن: {info['quran_derivatives_count']}")
            print(f"عدد الآيات التي ورد فيها الجذر: {info['verses_count_for_root']}")
            print(f"أمثلة المشتقات: {', '.join(info['sample_derivatives'])}")

        elif choice == '5':
            s_name_or_num = input("\nأدخل اسم السورة أو رقمها (1-114): ").strip()
            found_surah = None
            if s_name_or_num.isdigit():
                num = int(s_name_or_num)
                found_surah = next((s for s in db.surahs_meta if s['index'] == num), None)
            else:
                found_surah = next((s for s in db.surahs_meta if s_name_or_num in s['name']), None)

            if found_surah:
                print(f"\n--- سورة {found_surah['name']} (رقم: {found_surah['index']}, عدد الآيات: {found_surah['total_verses']}) ---")
                surah_verses = [v for v in db.verses if v.surah_index == found_surah['index']]
                for v in surah_verses[:20]:
                    print(f"({v.verse_index}) {v.text_uthmani}")
                if len(surah_verses) > 20:
                    print(f"... وباقي الآيات ({len(surah_verses)} آية).")
            else:
                print("[-] لم يتم العثور على السورة المحددة.")

        elif choice == '0':
            print("شكراً لاستخدامك برنامج البحث القرآني. مع السلامة!")
            break
        else:
            print("خيار غير صحيح، يرجى المحاولة ثانية.")


if __name__ == '__main__':
    # اختبار تشغيل سريع في حال وجود وسائط
    if len(sys.argv) > 1:
        import argparse
        parser = argparse.ArgumentParser(description="محرك البحث المتقدم في القرآن الكريم")
        parser.add_argument("--exact", type=str, help="بحث تام عن كلمة أو عبارة")
        parser.add_argument("--root", type=str, help="بحث بالجذر اللغوي ومشتقاته")
        parser.add_argument("--prefix", type=str, default="", help="بحث بالكلمات التي تبدأ بسابقة معينة")
        parser.add_argument("--suffix", type=str, default="", help="بحث بالكلمات التي تنتهي بلاحقة معينة")
        parser.add_argument("--file", type=str, default="quraan.json", help="مسار ملف quraan.json")
        args = parser.parse_args()

        db_path = args.file if os.path.exists(args.file) else ("public/quraan.json" if os.path.exists("public/quraan.json") else "quraan.json")
        db = QuranDatabase(db_path)
        engine = QuranAdvancedSearch(db)

        if args.exact:
            print(f"نتائج البحث التام عن: '{args.exact}'")
            res = engine.search_exact(args.exact)
            display_results(res)
        elif args.root:
            r, derivs, res = engine.search_by_root(args.root)
            print(f"الجذر: {r} | المشتقات: {len(derivs)}")
            display_results(res)
        elif args.prefix or args.suffix:
            print(f"بحث بالنمط (بادئة: {args.prefix}, لاحقة: {args.suffix})")
            res = engine.search_pattern(prefix=args.prefix, suffix=args.suffix)
            display_results(res)
    else:
        interactive_cli()
