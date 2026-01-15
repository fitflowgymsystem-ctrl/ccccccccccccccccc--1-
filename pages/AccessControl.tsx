
import React from 'react';
import { Fingerprint, Plus, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { DeviceFormModal } from '../components/access/DeviceFormModal';
import { DeviceCard } from '../components/access/DeviceCard';
import { useAccessControl } from '../hooks/useAccessControl';

interface AccessControlProps {
    lang: Language;
    onBack?: () => void;
}

export const AccessControl: React.FC<AccessControlProps> = ({ lang, onBack }) => {
    const t = translations[lang];
    const {
        devices, activeModal, setActiveModal, editingDevice, setEditingDevice,
        deviceToDelete, setDeviceToDelete, isTesting, testResult, actions
    } = useAccessControl();

    return (
        <>
            <div className="space-y-6 animate-fade-in pb-20">
                <header className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        {onBack && <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ChevronLeft size={24} className="dark:text-white" /></button>}
                        <div>
                            <h2 className="text-xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                <Fingerprint size={32} className="text-blue-500" /> Access Nodes
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Biometric Infrastructure Management</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setEditingDevice(null); setActiveModal('FORM'); }}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg text-xs font-black flex items-center gap-2 active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Provision Node
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map(device => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            isTesting={isTesting === device.id}
                            testResult={testResult?.id === device.id ? { success: testResult.success } : null}
                            onEdit={(d) => { setEditingDevice(d); setActiveModal('FORM'); }}
                            onDelete={(d) => { setDeviceToDelete(d); setActiveModal('DELETE'); }}
                            onTest={actions.handleTestConnection}
                        />
                    ))}
                </div>
            </div>

            {/* Modals خارج div المتحرك */}
            {activeModal === 'FORM' && (
                <DeviceFormModal
                    editingDevice={editingDevice}
                    lang={lang}
                    onClose={() => setActiveModal('NONE')}
                    onSave={actions.handleSaveDevice}
                />
            )}

            {activeModal === 'DELETE' && deviceToDelete && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl border dark:border-slate-700 animate-scale-in">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={32} /></div>
                        <h3 className="font-black text-lg dark:text-white mb-2">Remove Device?</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Confirm removal of <b>{deviceToDelete.name}</b> from the network. This will disable entry logs for this gate.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setActiveModal('NONE')} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 dark:text-gray-300 rounded-xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
                            <button onClick={() => actions.handleDelete(deviceToDelete.id)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black shadow-lg shadow-red-600/20 text-[10px] uppercase tracking-widest">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
