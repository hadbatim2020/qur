import React, { useState } from 'react';
import { Smartphone, Download, Check, X, ShieldCheck, Terminal, ExternalLink, Sparkles, Layers } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  // If already installed, show small badge or return null
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>تطبيق مثبت</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowAndroidModal(true);
      }
    } else {
      setShowAndroidModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 border border-emerald-400/30 transition-all cursor-pointer active:scale-95"
        title="تثبيت التطبيق على نظام أندرويد والأجهزة الذكية"
      >
        <Smartphone className="w-4 h-4 text-emerald-100" />
        <span>تثبيت على أندرويد (App)</span>
      </button>

      {/* Android & PWA Installation / Build Modal */}
      {showAndroidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl text-slate-100 relative animate-in fade-in zoom-in-95">
            {/* Close button */}
            <button
              onClick={() => setShowAndroidModal(false)}
              className="absolute left-4 top-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  تثبيت وبناء تطبيق أندرويد (Android Build)
                </h3>
                <p className="text-xs text-slate-400">
                  يدعم تطبيق القرآن التثبيت المباشر على أندرويد بصيغة WebAPK وحزمة PWA
                </p>
              </div>
            </div>

            {/* Content Tabs / Steps */}
            <div className="space-y-4 text-xs">
              {/* Option 1: Direct Android Install */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2 font-bold text-emerald-300">
                  <Download className="w-4 h-4" />
                  <span>١. التثبيت المباشر على هواتف أندرويد (بنقرة واحدة):</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  على متصفح Chrome أو Samsung Internet أو Edge في هاتف أندرويد:
                </p>
                <ol className="list-decimal list-inside space-y-1 mt-2 text-slate-300 pr-1">
                  <li>
                    اضغط على قائمة المتصفح <strong className="text-slate-100">(⋮ الثلاث نقاط)</strong> بالأعلى.
                  </li>
                  <li>
                    اختر <strong className="text-emerald-400">"تثبيت التطبيق" (Install app)</strong> أو <strong className="text-emerald-400">"إضافة إلى الشاشة الرئيسية"</strong>.
                  </li>
                  <li>
                    سيتم تثبيت التطبيق كـ APK حقيقي كامل الشاشة مع أيقونة مستقلة ويعمل بدون إنترنت (Offline).
                  </li>
                </ol>
              </div>

              {/* Option 2: Capacitor / Android Studio APK build */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2 font-bold text-amber-300">
                  <Terminal className="w-4 h-4" />
                  <span>٢. تحويل المشروع إلى تطبيق أندرويد نيتف (APK / Android Studio):</span>
                </div>
                <p className="text-slate-300 mb-2 leading-relaxed">
                  تم إعداد المشروع ليدعم حزم Capacitor و Bubblewrap TWA لبناء ملف APK في خطوتين:
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 space-y-1 select-all" dir="ltr">
                  <div>npm install @capacitor/core @capacitor/cli @capacitor/android</div>
                  <div>npx cap init "QuranSearch" "com.quran.search" --web-dir dist</div>
                  <div>npm run build &amp;&amp; npx cap add android</div>
                  <div>npx cap open android</div>
                </div>
              </div>

              {/* iOS Note if on Apple device */}
              {isIOS && (
                <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
                  <div className="font-bold text-teal-300 mb-1">لمستخدمي آيفون / آيباد (iOS):</div>
                  <p className="text-slate-300">
                    اضغط على زر المشاركة <strong className="text-slate-100">(Share)</strong> في شريط Safari ثم اختر <strong className="text-teal-400">"إضافة إلى الصفحة الرئيسية"</strong>.
                  </p>
                </div>
              )}

              {/* Service worker & Manifest verification note */}
              <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  ملف <code className="text-emerald-300">manifest.json</code> و <code className="text-emerald-300">service-worker</code> مدمجة ومفعلة تلقائياً للتخزين المؤقت والتشغيل بدون اتصال.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowAndroidModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  تثبيت الآن في المتصفح
                </button>
              )}
              <button
                onClick={() => setShowAndroidModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
