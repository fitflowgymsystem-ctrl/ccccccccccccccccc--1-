import React, { useEffect, useState } from 'react';
import { Database, Activity, ShieldCheck, Wifi, Cloud, Server, Zap } from 'lucide-react';
import { probeDatabase, probeSync, checkRlsEnforcement, getHardwareClusters } from '../../services/infrastructureService';
import { Language, translations } from '../../utils/translations';

interface InfrastructureProps {
    lang: Language;
}

export const Infrastructure: React.FC<InfrastructureProps> = ({ lang }) => {
    const t = translations[lang];
    const [dbStatus, setDbStatus] = useState<{ connected: boolean; latencyMs: number } | null>(null);
    const [syncMs, setSyncMs] = useState<number | null>(null);
    const [rls, setRls] = useState<{ enforced: boolean; details: string } | null>(null);
    const [devices, setDevices] = useState<any[]>([]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            const db = await probeDatabase();
            const sync = await probeSync();
            const r = await checkRlsEnforcement();
            const d = await getHardwareClusters();
            if (!mounted) return;
            setDbStatus(db);
            setSyncMs(sync.writeMs);
            setRls(r as any);
            setDevices(Array.isArray(d) ? d : []);
        };
        load();
        const iv = setInterval(load, 15000);
        return () => { mounted = false; clearInterval(iv); };
    }, []);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in">
            {/* Main Infrastructure Dashboard - Condensed */}
            <div className="lg:col-span-9 space-y-4">
                <div className="bg-slate-900 rounded-2xl p-6 border border-white/5 shadow-2xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Activity size={120} /></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 flex items-center gap-2">
                                    <Cloud size={16} className="animate-pulse" /> {t.dev_realtime_node}
                                </h3>
                                <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Region: DXB-CENTRAL-01</p>
                            </div>
                            <div className="px-3 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[7px] font-black uppercase tracking-widest animate-pulse">Running</div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <MetricItem label="DB Connect" value={dbStatus ? (dbStatus.connected ? 'ONLINE' : 'OFFLINE') : '—'} status="ok" sub={dbStatus ? `latency: ${dbStatus.latencyMs}ms` : 'checking...'} />
                            <MetricItem label="Enc Layer" value="AES-256" status="ok" sub="TLS 1.3" />
                            <MetricItem label="IoT Sync" value={`${devices.length} Active`} status="ok" sub={devices.length ? `avg ping: ${Math.round(devices.reduce((s,d)=>(s+(d.ping?parseInt(String(d.ping).replace(/ms/,'')):0)),0)/(devices.length||1))}ms` : 'n/a'} />
                            <MetricItem label="IO Speed" value={syncMs !== null ? `${syncMs}ms` : '—'} status="ok" sub={syncMs !== null ? 'last write' : '—'} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border dark:border-white/5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10"><ShieldCheck size={40} /></div>
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-500" /> Security Logic
                        </h3>
                        <div className="grid grid-cols-1 gap-2 relative z-10">
                            <PolicyStatus label="RLS Row Isolation" status={rls ? (rls.enforced ? 'Active' : 'Warning') : 'Checking'} icon={<Database size={8} />} details={rls ? rls.details : undefined} />
                            <PolicyStatus label="Tenancy Isolation" status={rls ? (rls.enforced ? 'Active' : 'Partial') : 'Checking'} icon={<Server size={8} />} />
                            <PolicyStatus label="Auth Encryption" status="Active" icon={<Zap size={8} />} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-5 text-white border border-white/5 shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-xl backdrop-blur-md text-blue-400 border border-blue-500/20">
                                <Zap size={18} />
                            </div>
                            <div>
                                <h4 className="font-black text-[10px] uppercase tracking-widest">Nexus Provisioner</h4>
                                <p className="text-[7px] text-slate-500 font-bold uppercase">Cloning: 1.1s avg</p>
                            </div>
                        </div>
                        <p className="text-[9px] font-medium leading-relaxed text-slate-400">
                            Nexus-Core utilizes isolated schema cloning to deploy full tenant stacks in sub-second response times.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sidebar Clusters - Condensed */}
            <div className="lg:col-span-3 h-full">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border dark:border-white/5 shadow-sm h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500">{t.dev_hardware_clusters}</h3>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                        {devices.length ? devices.map((d, idx) => (
                            <ClusterNode key={d.id || idx} name={d.name || d.id} status={d.status || 'unknown'} ip={d.ip} load={d.load} ping={d.ping} />
                        )) : (
                            <div className="text-[10px] text-slate-400 font-medium">No hardware clusters registered.</div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t dark:border-white/5">
                         <div className="flex items-center gap-2 text-[8px] font-black text-gray-500 uppercase italic">
                             <Wifi size={14} className="text-blue-500 animate-pulse" /> 
                             SIG_NODE_BROADCAST: OK
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricItem = ({ label, value, status, sub }: any) => (
    <div className="space-y-1">
        <p className="text-[7px] font-black uppercase text-slate-500 tracking-widest">{label}</p>
        <div className="flex items-center gap-1.5">
            <span className="text-sm font-black tracking-tighter font-mono">{value}</span>
        </div>
        <p className="text-[6px] text-slate-600 font-bold uppercase tracking-tighter">{sub}</p>
    </div>
);

const PolicyStatus = ({ label, status, icon, details }: any) => (
    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg border dark:border-white/5 group hover:border-blue-500/30 transition-all">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-colors">
                {icon}
            </div>
            <div>
                <span className="text-[8px] font-black dark:text-gray-400 uppercase tracking-widest">{label}</span>
                {details ? <div className="text-[6px] text-slate-400 font-bold uppercase">{details}</div> : null}
            </div>
        </div>
        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md ${status && status.toLowerCase().includes('act') ? 'text-emerald-500 bg-emerald-500/10' : status && status.toLowerCase().includes('warn') ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400 bg-slate-100/5'}`}>{status}</span>
    </div>
);

const ClusterNode = ({ name, load, status, ping, ip }: any) => (
    <div className="p-3 bg-gray-50/50 dark:bg-slate-800/30 border dark:border-white/5 rounded-xl transition-all">
        <div className="flex justify-between items-start mb-2">
            <div className="min-w-0">
                <span className="text-[9px] font-black dark:text-white uppercase truncate block tracking-tighter">{name}</span>
                <span className="text-[7px] text-gray-500 font-bold font-mono">{ip ? `IP: ${ip}` : (ping ? `LAT: ${ping}` : '')}</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500' : status === 'offline' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
        </div>
        <div className="space-y-1">
            <div className="flex justify-between text-[7px] font-black uppercase text-slate-500">
                <span>STATUS</span>
                <span className="text-blue-500">{String(status).toUpperCase()}</span>
            </div>
            {typeof load === 'number' ? (
                <div className="h-1 w-full bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-blue-500 transition-all duration-1000`} style={{ width: `${Math.max(0, Math.min(100, load))}%` }}></div>
                </div>
            ) : null}
        </div>
    </div>
);