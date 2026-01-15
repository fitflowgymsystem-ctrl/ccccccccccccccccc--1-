
import React from 'react';
import { Terminal, Cpu } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

interface TerminalLogsProps {
    logs: any[];
    lang: Language;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, lang }) => {
    const t = translations[lang];
    return (
        <div className="bg-slate-950 rounded-2xl p-4 shadow-2xl border border-white/5 flex flex-col h-[550px] overflow-hidden relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                     <Terminal size={14} className="text-blue-400" />
                     <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">SIG_EVENT Console</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[7px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse border border-emerald-500/20">
                    Live
                </div>
            </div>

            <div className="flex-1 overflow-y-auto code-scroll font-mono text-[9px] space-y-2 px-1">
                {logs.map(log => (
                    <div key={log.id} className="flex gap-3 group/item hover:bg-white/5 p-1 rounded transition-colors border border-transparent">
                        <span className="text-slate-600 shrink-0 font-bold">{log.time}</span>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-blue-400 font-bold truncate">[{log.action}]</span>
                                <span className={`text-[7px] px-1 rounded font-black ${log.status === 'SUCCESS' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {log.status}
                                </span>
                            </div>
                            <p className="text-slate-500 truncate">
                                <span className="text-slate-700">target:</span> {log.target}
                                <span className="mx-2 opacity-30">|</span>
                                <span className="text-slate-700">node:</span> cloud-01
                            </p>
                        </div>
                    </div>
                ))}
                
                <div className="pt-4 text-emerald-500/30 flex items-center gap-2 italic">
                     <Cpu size={10} className="animate-spin" /> 
                     <span>Nexus Node Listening...</span>
                </div>
            </div>
        </div>
    );
};
