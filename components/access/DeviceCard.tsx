
import React from 'react';
import { Fingerprint, Activity, Layers, Edit, Trash2, Wifi, RefreshCw, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { AccessDevice } from '../../types';

interface DeviceCardProps {
    device: AccessDevice;
    isTesting: boolean;
    testResult: { success: boolean } | null;
    onEdit: (d: AccessDevice) => void;
    onDelete: (d: AccessDevice) => void;
    onTest: (id: string) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, isTesting, testResult, onEdit, onDelete, onTest }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden group hover:shadow-md transition-all">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${device.status === 'online' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {device.type === 'Fingerprint' ? <Fingerprint size={24} /> : device.type === 'FaceID' ? <Activity size={24} /> : <Layers size={24} />}
                        </div>
                        <div>
                            <h3 className="font-black text-xs uppercase tracking-tighter dark:text-white truncate max-w-[120px]">{device.name}</h3>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{device.status}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(device)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit size={14} /></button>
                        <button onClick={() => onDelete(device)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex justify-between p-3 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <Wifi size={12} className="text-gray-400" />
                            <span className="text-[8px] font-black text-gray-400 uppercase">Static IP</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold dark:text-white">{device.ip}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => onTest(device.id)} 
                        disabled={isTesting} 
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${isTesting ? 'bg-gray-100 text-gray-400' : testResult?.success ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}
                    >
                        {isTesting ? <Loader2 size={14} className="animate-spin" /> : testResult ? (testResult.success ? <CheckCircle2 size={14}/> : <XCircle size={14}/>) : <RefreshCw size={14} />} 
                        {isTesting ? 'Pinging...' : testResult ? (testResult.success ? 'Online' : 'Failed') : 'Test Link'}
                    </button>
                    <button onClick={() => onDelete(device)} className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-gray-300 rounded-xl text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">
                        <Trash2 size={14} /> Remove
                    </button>
                </div>
            </div>
        </div>
    );
};
