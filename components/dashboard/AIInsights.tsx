
import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Loader2, ChevronRight, AlertCircle } from 'lucide-react';
import { generateGymInsights } from '../../services/geminiService';
import { User, AccessLog, Equipment } from '../../types';
import { Language } from '../../utils/translations';

interface AIInsightsProps {
  users: User[];
  logs: AccessLog[];
  equipment: Equipment[];
  lang: Language;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ users, logs, equipment, lang }) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (users.length === 0) return;
    setLoading(true);
    try {
      const result = await generateGymInsights(users, logs, equipment);
      setInsights(result);
    } catch (error) {
      console.error("AI Insight Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [users.length]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent border border-indigo-500/20 rounded-[2rem] p-5 sm:p-6 mb-6 group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
        <BrainCircuit size={80} className="text-indigo-500" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg animate-pulse">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">FitFlow AI Insights</h3>
              <p className="text-[8px] text-indigo-500 font-bold uppercase tracking-[0.2em]">Powered by Gemini 3 Pro</p>
            </div>
          </div>
          <button 
            onClick={fetchInsights}
            disabled={loading}
            className="p-2 hover:bg-indigo-500/10 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <ChevronRight size={16} className="text-indigo-500" />}
          </button>
        </div>

        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-2xl p-4">
          {loading ? (
            <div className="flex flex-col items-center py-6 space-y-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Analyzing Gym Performance...</p>
            </div>
          ) : insights ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {insights}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 py-4 justify-center">
              <AlertCircle size={14} />
              <p className="text-[10px] font-bold uppercase tracking-widest">Add more members to unlock AI analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
