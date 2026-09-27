import React, { useState } from 'react';
import { BarChart3, Search, Sparkles, BookOpen, Layers } from 'lucide-react';
import { QuranSearchEngine } from '../utils/quranSearch';

interface LexiconStatsProps {
  searchEngine: QuranSearchEngine;
  onSelectRoot: (root: string) => void;
}

export const LexiconStats: React.FC<LexiconStatsProps> = ({
  searchEngine,
  onSelectRoot,
}) => {
  const [rootFilter, setRootFilter] = useState('');
  const allRoots = searchEngine.getAllRoots();

  // Highlighted most frequent Quranic roots with rich linguistic notes
  const majorRoots = [
    { root: 'اله', meaning: 'الألوهية، الله، إله', count: 2851, category: 'العقيدة والتوحيد' },
    { root: 'قول', meaning: 'القول، قال، يقولون، قل', count: 1722, category: 'الخطاب والبيان' },
    { root: 'كون', meaning: 'كان، يكون، كُن', count: 1390, category: 'الوجود والقدرة' },
    { root: 'ربب', meaning: 'الرب، أرباب، ربكم', count: 975, category: 'الربوبية' },
    { root: 'امن', meaning: 'الإيمان، آمنوا، مؤمنين، أمانة', count: 879, category: 'الإيمان' },
    { root: 'علم', meaning: 'العلم، يعلمون، عليم، العالمين', count: 854, category: 'العلم والمعرفة' },
    { root: 'هدي', meaning: 'الهداية، هدى، مهتدين', count: 316, category: 'الهداية' },
    { root: 'رحم', meaning: 'الرحمة، الرحمن، الرحيم', count: 339, category: 'الرحمة' },
    { root: 'كفر', meaning: 'الكفر، كفروا، كافرين، كفار', count: 525, category: 'العقيدة' },
    { root: 'حمد', meaning: 'الحمد، يحمدون، حميد', count: 68, category: 'الثناء والعبادة' },
    { root: 'كتب', meaning: 'الكتاب، يكتبون، كتبنا', count: 319, category: 'الوحي والتشريع' },
    { root: 'جرم', meaning: 'الإجرام، المجرمين، أجرموا', count: 65, category: 'الأفعال والجزاء' },
    { root: 'صلح', meaning: 'الصلاح، الصالحات، أصلحوا', count: 180, category: 'العمل الصالح' },
    { root: 'فسد', meaning: 'الفساد، المفسدين، تفسدوا', count: 50, category: 'النهي والتحذير' },
    { root: 'شكر', meaning: 'الشكر، الشاكرين، شكورا', count: 75, category: 'العبادة والاعتراف' },
    { root: 'صبر', meaning: 'الصبر، الصابرين، اصبروا', count: 103, category: 'الأخلاق الفاضلة' },
    { root: 'ظلم', meaning: 'الظلم، الظالمين، يظلمون', count: 315, category: 'التحذير والعدالة' },
    { root: 'سمع', meaning: 'السمع، يسمعون، سميع', count: 185, category: 'الصفات والإدراك' },
    { root: 'بصر', meaning: 'البصر، الأبصار، بصير', count: 148, category: 'الصفات والإدراك' },
    { root: 'خلق', meaning: 'الخلق، يخلق، الخالق', count: 261, category: 'القدرة والنشأة' },
  ];

  const filteredRoots = allRoots.filter((r) => r.includes(rootFilter));

  return (
    <div className="space-y-6">
      {/* Top statistics banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">٦,٢٣٦</div>
            <div className="text-xs text-slate-400">إجمالي الآيات المفهرسة</div>
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{allRoots.length || '٣,٩١٧+'}</div>
            <div className="text-xs text-slate-400">جذراً لغوياً مستخرجاً</div>
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">١١٤</div>
            <div className="text-xs text-slate-400">سورة (٨٦ مكية + ٢٨ مدنية)</div>
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">٧٧,٤٠٠+</div>
            <div className="text-xs text-slate-400">مجموع كلمات القرآن المحللة</div>
          </div>
        </div>
      </div>

      {/* Major Roots Cards */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-700/70">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>أبرز الجذور القرآنية ودلالاتها الصرفية</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              انقر على أي جذر للانتقال المباشر لجميع الآيات والمشتقات الواردة له في المصحف
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {majorRoots.map((mr, idx) => (
            <div
              key={idx}
              onClick={() => onSelectRoot(mr.root)}
              className="bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl p-3.5 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-lg font-extrabold font-quran text-amber-300 group-hover:text-emerald-300 transition-colors">
                  جذر [{mr.root}]
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {mr.count} آية
                </span>
              </div>
              <div className="text-xs text-slate-300 line-clamp-1 mb-1 font-medium">
                {mr.meaning}
              </div>
              <div className="text-[10px] text-emerald-400/90 flex items-center justify-between">
                <span>{mr.category}</span>
                <span className="underline group-hover:text-amber-300">بحث الآن ←</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Root Dictionary Search */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-700/70">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-400" />
              <span>فهرس الجذور المستخرجة الكامل ({allRoots.length} جذراً)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              يمكنك كتابة أي حرفين أو ثلاثة لتصفية الجذور
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={rootFilter}
              onChange={(e) => setRootFilter(e.target.value)}
              placeholder="تصفية الجذور (مثال: رحم، علم، كتب...)"
              className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 pl-8 text-xs text-slate-100 placeholder-slate-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
          {filteredRoots.slice(0, 150).map((r, i) => (
            <button
              key={i}
              onClick={() => onSelectRoot(r)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 text-xs font-quran transition-all cursor-pointer"
            >
              {r}
            </button>
          ))}
          {filteredRoots.length > 150 && (
            <span className="text-xs text-slate-500 self-center">
              + {filteredRoots.length - 150} جذراً إضافياً (استخدم حقل التصفية أعلاه للبحث الدقيق)...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
