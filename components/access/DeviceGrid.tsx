
import React from 'react';
import { Fingerprint, Activity, Layers, Edit, Trash2, Wifi, Monitor, RefreshCw, Loader2 } from 'lucide-react';
import { AccessDevice } from '../../types';

interface DeviceGridProps {
    devices: AccessDevice[];
    isTesting: string | null;
    testResult: { id: string, success: boolean } | null;
    onEdit: (d: AccessDevice) => void;
    onDelete: (d: AccessDevice) => void;
    onTest: (id: string) => void;
}

export const DeviceGrid: React.FC<DeviceGridProps> = ({ devices, isTesting, testResult, onEdit, onDelete, onTest }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map(device => (
                <div key={device.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border dark:border-slate-700 overflow-hidden group">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${device.status === 'online' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {device.type === 'Fingerprint' ? <Fingerprint size={24} /> : device.type === 'FaceID' ? <Activity size={24} /> : <Layers size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold dark:text-white truncate max-w-[120px]">{device.name}</h3>
                                    <div className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div><span className="text-[10px] font-black uppercase text-gray-400">{device.status}</span></div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => onEdit(device)} className="p-2 text-gray-400 hover:text-blue-500"><Edit size={16} /></button>
                                <button onClick={() => onDelete(device)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700">
                                <div className="flex items-center gap-2"><Wifi size={14} className="text-gray-400" /><span className="text-[10px] font-bold text-gray-500">IP ADDRESS</span></div>
                                <span className="text-[11px] font-mono font-bold dark:text-white">{device.ip}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => onTest(device.id)} disabled={isTesting === device.id} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${isTesting === device.id ? 'bg-gray-100 text-gray-400' : testResult?.id === device.id && testResult.success ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                {isTesting === device.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Test Link
                            </button>
                            <button onClick={() => onDelete(device)} className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
