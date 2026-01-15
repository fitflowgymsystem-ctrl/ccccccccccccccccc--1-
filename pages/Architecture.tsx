
import React from 'react';
import { Database, Server, Cpu, Lock, ShieldCheck } from 'lucide-react';
import { SQL_SCHEMA, IOT_PSEUDO_CODE } from '../constants';
import { Language, translations } from '../utils/translations';

interface ArchitectureProps {
    lang: Language;
}

export const Architecture: React.FC<ArchitectureProps> = ({ lang }) => {
  const t = translations[lang];

  const RLS_POLICY_SQL = `-- 1. تفعيل الحماية لكل الجداول
ALTER TABLE [TABLE_NAME] ENABLE ROW LEVEL SECURITY;

-- 2. سياسة المستأجر المصححة (Type-Safe Isolation)
-- نستخدم ::text لتحويل الـ UUID إلى نص ومنع خطأ المزامنة
CREATE POLICY "Tenant Isolation" ON [TABLE_NAME] 
FOR ALL TO anon USING (
  gym_id::text = current_setting('app.current_gym_id', true)
);

-- 3. في حالة استخدام Supabase Auth الحقيقي:
-- USING (gym_id::text = (auth.jwt() ->> 'gym_id'));`;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-20">
      <header>
        <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">{t.arch_title}</h2>
        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">{t.arch_subtitle}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-indigo-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <Database size={24} />
            </div>
            <h3 className="font-black text-gray-800 dark:text-white mb-2 uppercase text-xs tracking-widest">{t.arch_db_title}</h3>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">{t.arch_db_desc}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-blue-100 dark:border-slate-700">
             <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Server size={24} />
            </div>
            <h3 className="font-black text-gray-800 dark:text-white mb-2 uppercase text-xs tracking-widest">{t.arch_api_title}</h3>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">{t.arch_api_desc}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-purple-100 dark:border-slate-700">
             <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                <Cpu size={24} />
            </div>
            <h3 className="font-black text-gray-800 dark:text-white mb-2 uppercase text-xs tracking-widest">{t.arch_iot_title}</h3>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">{t.arch_iot_desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-800 dark:text-white">
                <ShieldCheck size={20} className="text-emerald-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">Corrected RLS Security</h3>
            </div>
            <div className="bg-slate-900 rounded-[2rem] shadow-lg overflow-hidden border border-slate-700" dir="ltr">
                <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                    <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest">security_policy.sql</span>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                </div>
                <pre className="p-4 text-[10px] font-mono text-emerald-300 overflow-auto h-[400px] code-scroll text-left leading-relaxed">
                    <code>{RLS_POLICY_SQL}</code>
                </pre>
            </div>
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest text-center px-4">
                ✅ تم استخدام ::text لحل مشكلة عدم توافق أنواع البيانات.
            </p>
        </section>

        <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-800 dark:text-white">
                <Lock size={20} className="text-blue-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">{t.arch_logic_title}</h3>
            </div>
            <div className="bg-slate-900 rounded-[2rem] shadow-lg overflow-hidden border border-slate-700" dir="ltr">
                 <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                    <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest">controller.js</span>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                </div>
                <pre className="p-4 text-[10px] font-mono text-blue-300 overflow-auto h-[400px] code-scroll text-left leading-relaxed">
                    <code>{IOT_PSEUDO_CODE}</code>
                </pre>
            </div>
        </section>
      </div>
    </div>
  );
};