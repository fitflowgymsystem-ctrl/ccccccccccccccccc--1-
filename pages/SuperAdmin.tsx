
import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, LayoutGrid, Terminal, Settings, Server, CheckCircle2, Copy, X, Key, User as UserIcon, Megaphone
} from 'lucide-react';
import { useSuperAdmin } from '../hooks/useSuperAdmin';
import { Language, translations } from '../utils/translations';
import { AdminTab, FleetTabs } from '../components/superadmin/FleetTabs';
import { InstanceManagement } from './SuperAdmin/InstanceManagement';
import { Infrastructure } from './SuperAdmin/Infrastructure';
import { GlobalSettings } from './SuperAdmin/GlobalSettings';
import { TerminalLogs } from './SuperAdmin/TerminalLogs';
import { StatsOverview } from '../components/superadmin/StatsOverview';
import { FleetHeader } from '../components/superadmin/FleetHeader';
import { GymFormModal } from '../components/superadmin/GymFormModal';
import { BroadcastModal } from '../components/superadmin/BroadcastModal';
import { DeleteConfirmationModal } from '../components/superadmin/DeleteConfirmationModal';

interface SuperAdminProps {
    lang: Language;
    setLang: (l: Language) => void;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ lang, setLang }) => {
    const t = translations[lang];
    const [activeTab, setActiveTab] = useState<AdminTab>('INSTANCES');

    const {
        gyms, stats, isFormModalOpen, setIsFormModalOpen,
        isNotifModalOpen, setIsNotifModalOpen,
        deployedCredentials, setDeployedCredentials,
        searchTerm, setSearchTerm, systemLoad, editingGym, setEditingGym,
        gymToDelete, actions
    } = useSuperAdmin();

    const tabsConfig = [
        { id: 'INSTANCES' as AdminTab, label: t.dev_instances, icon: LayoutGrid },
        { id: 'INFRASTRUCTURE' as AdminTab, label: t.dev_infra, icon: Server },
        { id: 'SETTINGS' as AdminTab, label: t.dev_global_config, icon: Settings },
        { id: 'LOGS' as AdminTab, label: t.dev_system_logs, icon: Terminal },
    ];

    // Listen for sidebar dispatch to open the broadcast modal
    useEffect(() => {
        const handler = () => setIsNotifModalOpen(true);
        window.addEventListener('open_broadcast_modal', handler as EventListener);
        return () => window.removeEventListener('open_broadcast_modal', handler as EventListener);
    }, [setIsNotifModalOpen]);

    const auditLogs = [
        { id: 1, time: new Date().toLocaleTimeString(), action: "TENANT_PROVISIONING", target: "NEW_NODE_AUTO", status: "SUCCESS" },
        { id: 2, time: "14:21:48", action: "AUTH_TOKEN_GEN", target: "USER_ADMIN", status: "SUCCESS" },
        { id: 3, time: "14:20:15", action: "FIREBASE_SYNC", target: "FIRESTORE_REPLICA", status: "COMPLETED" },
    ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // يمكنك إضافة توست هنا لاحقاً
    };

    return (
        <>
            <div className="flex flex-col gap-4 animate-fade-in pb-10 max-w-[1600px] mx-auto min-h-screen px-2 sm:px-4 relative">
                <div className="flex items-start justify-between gap-4">
                    <FleetHeader systemLoad={systemLoad} />
                    <div className="pt-4">
                        <button onClick={() => setIsNotifModalOpen(true)} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all flex items-center gap-2">
                            <Megaphone size={14} /> Broadcast
                        </button>
                    </div>
                </div>

                <StatsOverview total={stats.total} active={stats.active} mrr={stats.mrr} apiCalls={stats.apiCalls} />

                <FleetTabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabsConfig} />

                <div className="min-h-[500px]">
                    {activeTab === 'INSTANCES' && (
                        <InstanceManagement
                            gyms={gyms}
                            searchTerm={searchTerm}
                            onSearch={setSearchTerm}
                            onAdd={() => { setEditingGym(null); setIsFormModalOpen(true); }}
                            onEdit={(gym) => { setEditingGym(gym); setIsFormModalOpen(true); }}
                            onDelete={actions.handleDeleteGym}
                            onImpersonate={actions.impersonate}
                            onToggleStatus={actions.toggleStatus}
                            lang={lang}
                        />
                    )}

                    {activeTab === 'INFRASTRUCTURE' && <Infrastructure lang={lang} />}
                    {activeTab === 'SETTINGS' && <GlobalSettings lang={lang} />}
                    {activeTab === 'LOGS' && <TerminalLogs logs={auditLogs} lang={lang} />}
                </div>
            </div>

            {/* Modals خارج div المتحرك */}
            {deployedCredentials && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-[2.5rem] shadow-[0_0_100px_rgba(16,185,129,0.1)] w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                                <CheckCircle2 size={40} className="text-emerald-500 animate-bounce" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Infrastructure Ready</h3>
                                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{deployedCredentials.name} Node Deployed</p>
                            </div>

                            <div className="bg-slate-950/50 rounded-3xl p-6 border border-white/5 space-y-4 text-start">
                                <div className="space-y-1.5">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <UserIcon size={10} /> Username
                                    </p>
                                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-white/5 group">
                                        <span className="text-blue-400 font-mono font-bold text-sm">{deployedCredentials.username}</span>
                                        <button onClick={() => copyToClipboard(deployedCredentials.username)} className="text-slate-600 hover:text-white transition-colors"><Copy size={14} /></button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Key size={10} /> Temporary Password
                                    </p>
                                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-white/5 group">
                                        <span className="text-amber-400 font-mono font-bold text-sm">{deployedCredentials.pass}</span>
                                        <button onClick={() => copyToClipboard(deployedCredentials.pass)} className="text-slate-600 hover:text-white transition-colors"><Copy size={14} /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic">
                                    * {lang === 'ar' ? 'يرجى تزويد العميل بهذه البيانات وإخباره بضرورة تغيير كلمة السر فور الدخول.' : 'Please provide these credentials to the client and ask them to update the password.'}
                                </p>
                            </div>

                            <button
                                onClick={() => setDeployedCredentials(null)}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                            >
                                Confirm Handover
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isFormModalOpen && (
                <GymFormModal
                    editingGym={editingGym}
                    onClose={() => setIsFormModalOpen(false)}
                    onSave={actions.handleSaveGym}
                    lang={lang}
                />
            )}

            {isNotifModalOpen && (
                <BroadcastModal
                    onClose={() => setIsNotifModalOpen(false)}
                    onSend={(n) => {
                        // Use the new Notification Service to fan-out alerts
                        import('../services/notificationService').then(mod => {
                            mod.notifyAllUsers(
                                n.title,
                                n.message,
                                n.type,
                                n.targetGymId // This comes from BroadcastModal state
                            ).then(count => {
                                console.log(`Broadcast sent to ${count} users.`);
                                // Optional: Show toast success
                            });
                        });
                        setIsNotifModalOpen(false);
                    }}
                    lang={lang}
                />
            )}

            <DeleteConfirmationModal
                isOpen={!!gymToDelete}
                onClose={actions.cancelDelete}
                onConfirm={actions.confirmDelete}
                gymName={gymToDelete?.name || ''}
                lang={lang}
            />
        </>
    );
};
