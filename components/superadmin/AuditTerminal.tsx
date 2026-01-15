
import React from 'react';
import { Terminal as TerminalIcon, CheckCircle2 } from 'lucide-react';

interface AuditLog {
    id: number;
    time: string;
    action: string;
    target: string;
    status: string;
}

interface AuditTerminalProps {
    logs: AuditLog[];
}

export const AuditTerminal: React.FC<AuditTerminalProps> = ({ logs }) => {
    return (
        <div className="bg-slate-950 rounded-[2.5rem] p-6 shadow-2xl border border-slate-800 flex flex-col h-[480px] overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                     <TerminalIcon size={18} className="text-blue-400" />
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Global Event Console</h3>
                </div>
                <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">
                     Live Feed
                </span>
            </div>
            <div className="flex-1 overflow-y-auto code-scroll font-mono text-[10px] space-y-4">
                {logs.map(log => (
                    <div key={log.id} className="flex gap-4 group hover:bg-white/5 p-1 rounded-lg transition-colors cursor-default">
                        <span className="text-slate-600 shrink-0 font-bold">{log.time}</span>
                        <div className="space-y-0.5">
                            <p className="text-blue-400 font-black"># {log.action}</p>
                            <p className="text-slate-400">Target Object: <span className="text-emerald-500">{log.target}</span></p>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-600">Response:</span>
                                <span className={`flex items-center gap-1 ${log.status === 'SUCCESS' || log.status === 'COMPLETED' ? 'text-green-500' : 'text-amber-500'}`}>
                                    <CheckCircle2 size={10} /> {log.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="pt-4 text-emerald-500/50 flex items-center gap-2 italic">
                     <span className="animate-pulse">●</span> Nexus Node Listening for SIG_EVENT...
                </div>
            </div>
        </div>
    );
};
