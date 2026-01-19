
import React, { useState, useMemo } from 'react';
import { AccessLog, AccessStatus, User, Trainer } from '../types';
import { Language, translations } from '../utils/translations';
import { FileSpreadsheet, Clock, User as UserIcon, Smartphone, History, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import ExcelJS from 'exceljs';
import { MemberDetailsModal } from '../components/members/MemberDetailsModal';
import { TrainerDetailsModal } from '../components/trainers/TrainerDetailsModal';
import { CustomSelect } from '../components/shared/CustomSelect';
import { Employee, TrainerSchedule } from '../types';

interface LogsProps {
    logs: AccessLog[];
    users: User[];
    trainers: Trainer[];
    employees: Employee[];
    lang: Language;
    onUpdateUser?: (u: User) => void;
    onUpdateTrainer?: (t: Trainer) => void;
    onUpdateEmployee?: (e: Employee) => void;
    onUsePerk?: (userId: number, type: 'InBody' | 'Guest Pass') => void;
    onLogSession?: (userId: number, trainerId: number, price: number) => void;
    onLogServiceSession?: (userId: number, serviceId: number, price: number, serviceName: string) => void;
    onConfirmPayment?: (subId: number) => Promise<void>;
}

export const Logs: React.FC<LogsProps> = ({ logs, users, trainers, employees, lang, onUpdateUser, onUpdateTrainer, onUpdateEmployee, onUsePerk, onLogSession, onLogServiceSession, onConfirmPayment }) => {
    const t = translations[lang];
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | AccessStatus>('ALL');
    const [selectedMember, setSelectedMember] = useState<User | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<Trainer | Employee | null>(null);

    const filteredLogs = useMemo(() => {
        return logs
            .filter(log => {
                const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.deviceId.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, searchTerm, statusFilter]);

    const handleRowClick = (log: AccessLog) => {
        // 1. Try to find in users
        const member = users.find(u => u.id === log.userId);
        if (member) {
            setSelectedMember(member);
            setSelectedStaff(null);
            return;
        }

        // 2. Try to find in trainers
        const trainer = trainers.find(t => t.id === log.userId);
        if (trainer) {
            setSelectedStaff(trainer);
            setSelectedMember(null);
            return;
        }

        // 3. Try to find in employees
        const employee = employees.find(e => e.id === log.userId);
        if (employee) {
            setSelectedStaff(employee as any);
            setSelectedMember(null);
            return;
        }
    };

    const handleSingleScheduleUpdate = (day: string, type: 'startTime' | 'endTime', value: string) => {
        if (!selectedStaff || !onUpdateTrainer || !onUpdateEmployee) return;
        const currentStaff = selectedStaff as any;
        const currentSchedule = currentStaff.schedule || [];
        const existingIdx = currentSchedule.findIndex((s: any) => s.day === day);
        let newSchedule: TrainerSchedule[];

        if (existingIdx > -1) {
            newSchedule = currentSchedule.map((s: any, i: number) => i === existingIdx ? { ...s, [type]: value } : s);
        } else {
            newSchedule = [...currentSchedule, { day, startTime: type === 'startTime' ? value : '09:00', endTime: type === 'endTime' ? value : '17:00' }];
        }

        if (selectedStaff.role === 'TRAINER') onUpdateTrainer({ ...currentStaff, schedule: newSchedule });
        else onUpdateEmployee({ ...currentStaff, schedule: newSchedule });

        setSelectedStaff(prev => prev ? { ...prev, schedule: newSchedule } : null);
    };

    const handleBulkScheduleUpdate = (days: string[], start: string, end: string) => {
        if (!selectedStaff || !onUpdateTrainer || !onUpdateEmployee) return;
        const currentStaff = selectedStaff as any;
        let currentSchedule = [...(currentStaff.schedule || [])];
        days.forEach(day => {
            const idx = currentSchedule.findIndex(s => s.day === day);
            if (idx > -1) currentSchedule[idx] = { ...currentSchedule[idx], startTime: start, endTime: end };
            else currentSchedule.push({ day, startTime: start, endTime: end });
        });

        if (selectedStaff.role === 'TRAINER') onUpdateTrainer({ ...currentStaff, schedule: currentSchedule });
        else onUpdateEmployee({ ...currentStaff, schedule: currentSchedule });

        setSelectedStaff(prev => prev ? { ...prev, schedule: currentSchedule } : null);
    };

    const exportToExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Access Logs');
            worksheet.views = [{ rightToLeft: lang === 'ar' }];

            // Professional Columns Definition
            worksheet.columns = [
                { header: lang === 'ar' ? 'الوقت' : 'Time', key: 'time', width: 25 },
                { header: lang === 'ar' ? 'المستخدم' : 'Member', key: 'user', width: 30 },
                { header: lang === 'ar' ? 'الحالة' : 'Status', key: 'status', width: 15 },
                { header: lang === 'ar' ? 'الجهاز' : 'Device', key: 'device', width: 20 },
                { header: lang === 'ar' ? 'السبب' : 'Reason', key: 'reason', width: 35 }
            ];

            // Prepare rows for table
            const tableRows: any[] = filteredLogs.map(log => ([
                new Date(log.timestamp).toLocaleString(),
                log.userName,
                log.status,
                log.deviceId,
                log.reason || '-'
            ]));

            // Insert header row and add as a table
            const headers = [
                lang === 'ar' ? 'الوقت' : 'Time',
                lang === 'ar' ? 'المستخدم' : 'Member',
                lang === 'ar' ? 'الحالة' : 'Status',
                lang === 'ar' ? 'الجهاز' : 'Device',
                lang === 'ar' ? 'السبب' : 'Reason'
            ];

            // Add table at A1
            worksheet.addTable({
                name: 'AccessLogs',
                ref: 'A1',
                headerRow: true,
                totalsRow: false,
                style: { theme: 'TableStyleMedium9', showRowStripes: true },
                columns: headers.map(h => ({ name: h })),
                rows: tableRows
            });

            // Styling Header Row (after table creation, header is row 1)
            const headerRow = worksheet.getRow(1);
            headerRow.height = 30;
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // Indigo-800
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Styling Data Rows - center alignment and height
            worksheet.eachRow((row, rowNumber) => {
                row.height = rowNumber === 1 ? 30 : 22;
                row.eachCell((cell) => {
                    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                });
            });

            // Highlight DENIED cells in Status column (column C)
            const statusCol = 3;
            for (let i = 2; i <= worksheet.rowCount; i++) {
                const cell = worksheet.getRow(i).getCell(statusCol);
                if (String(cell.value).toUpperCase().includes('DENIED') || String(cell.value).toUpperCase().includes('MREFUD')) {
                    cell.font = { color: { argb: 'FFFF0000' }, bold: true };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } };
                }
            }

            // Set column widths
            worksheet.getColumn(1).width = 22;
            worksheet.getColumn(2).width = 30;
            worksheet.getColumn(3).width = 14;
            worksheet.getColumn(4).width = 20;
            worksheet.getColumn(5).width = 36;

            // Build multiple informative charts (stacked status per month, monthly trend, status breakdown) and insert images
            const counts: Record<string, number> = {};
            filteredLogs.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });
            const statusLabels = Object.keys(counts);
            const statusValues = statusLabels.map(k => counts[k]);

            // Helper to convert SVG -> PNG base64
            const svgToPngBase64 = async (svg: string, width = 480, height = 300) => {
                const img = new Image();
                const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Canvas unsupported');
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => { try { ctx.fillStyle = 'white'; ctx.fillRect(0, 0, width, height); ctx.drawImage(img, 0, 0, width, height); resolve(); } catch (e) { reject(e); } };
                    img.onerror = (e) => reject(new Error('Failed to load SVG')); img.src = url;
                });
                URL.revokeObjectURL(url);
                const dataUrl = canvas.toDataURL('image/png');
                return dataUrl.split(',')[1];
            };

            // Monthly aggregation (last 6 months)
            const now = new Date(); const months: string[] = []; const monthBuckets: Record<string, { GRANTED: number; DENIED: number; OTHER: number }> = {};
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = d.toLocaleString('default', { month: 'short' }); months.push(key);
                monthBuckets[key] = { GRANTED: 0, DENIED: 0, OTHER: 0 };
            }
            filteredLogs.forEach(l => {
                const d = new Date(l.timestamp);
                const key = d.toLocaleString('default', { month: 'short' });
                if (!monthBuckets[key]) return;
                if (l.status === 'GRANTED') monthBuckets[key].GRANTED += 1;
                else if (l.status === 'DENIED') monthBuckets[key].DENIED += 1;
                else monthBuckets[key].OTHER += 1;
            });

            const stackedData = months.map(m => ({ name: m, granted: monthBuckets[m].GRANTED, denied: monthBuckets[m].DENIED, other: monthBuckets[m].OTHER }));
            const trendData = months.map(m => ({ name: m, total: (monthBuckets[m].GRANTED + monthBuckets[m].DENIED + monthBuckets[m].OTHER) }));

            const genStackedSVG = (data: any[]) => {
                const width = 720, height = 320, pad = 50;
                const max = Math.max(...data.map(d => d.granted + d.denied + d.other), 1);
                const barW = Math.max(12, (width - pad * 2) / data.length - 6);
                let x = pad;
                const bars = data.map(d => {
                    const gH = Math.round((d.granted / max) * (height - pad * 1.5));
                    const deH = Math.round((d.denied / max) * (height - pad * 1.5));
                    const otH = Math.round((d.other / max) * (height - pad * 1.5));
                    const yG = height - pad - (deH + otH + gH) + 0;
                    const yD = yG + gH;
                    const yO = yD + deH;
                    const bar = `<rect x='${x}' y='${yG}' width='${barW}' height='${gH}' fill='#10B981' />` +
                        `<rect x='${x}' y='${yD}' width='${barW}' height='${deH}' fill='#EF4444' />` +
                        `<rect x='${x}' y='${yO}' width='${barW}' height='${otH}' fill='#F59E0B' />` +
                        `<text x='${x + barW / 2}' y='${height - pad + 14}' font-size='10' text-anchor='middle' fill='#111827'>${d.name}</text>`;
                    x += barW + 6; return bar;
                }).join('\n');
                return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><rect width='100%' height='100%' fill='white'/>${bars}</svg>`;
            };

            const genTrendSVG = (data: any[]) => {
                const width = 720, height = 320, pad = 50;
                const max = Math.max(...data.map(d => d.total), 1);
                const step = (width - pad * 2) / Math.max(1, data.length - 1);
                const points = data.map((d, i) => `${pad + i * step},${height - pad - Math.round((d.total / max) * (height - pad * 1.5))}`).join(' ');
                return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><rect width='100%' height='100%' fill='white'/><polyline fill='none' stroke='#3B82F6' stroke-width='3' points='${points}' /></svg>`;
            };

            const genPieSVG = (labels: string[], values: number[]) => {
                const total = values.reduce((s, v) => s + v, 0) || 1; const width = 400, height = 240, cx = 120, cy = 120, r = 80;
                const colors = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6']; let start = 0; const paths: string[] = [];
                labels.forEach((label, i) => { const val = values[i]; const angle = (val / total) * Math.PI * 2; const end = start + angle; const x1 = cx + r * Math.cos(start); const y1 = cy + r * Math.sin(start); const x2 = cx + r * Math.cos(end); const y2 = cy + r * Math.sin(end); const large = angle > Math.PI ? 1 : 0; paths.push(`<path d=\"M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z\" fill=\"${colors[i % colors.length]}\" />`); start = end; });
                let legend = ''; labels.forEach((label, i) => { const y = 20 + i * 20; legend += `<rect x=\"240\" y=\"${y - 8}\" width=\"12\" height=\"12\" fill=\"${colors[i % colors.length]}\" />` + `<text x=\"260\" y=\"${y}\" font-size=\"12\" fill=\"#111827\">${label} (${values[i]})</text>`; });
                return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><rect width='100%' height='100%' fill='white'/>${paths.join('\n')}${legend}</svg>`;
            };

            const stackedSvg = genStackedSVG(stackedData);
            const trendSvg = genTrendSVG(trendData);
            const pieSvg = genPieSVG(statusLabels, statusValues);

            const stackedBase64 = await svgToPngBase64(stackedSvg, 720, 320);
            const trendBase64 = await svgToPngBase64(trendSvg, 720, 320);
            const pieBase64 = await svgToPngBase64(pieSvg, 400, 240);

            const stackedId = workbook.addImage({ base64: stackedBase64, extension: 'png' });
            const trendId = workbook.addImage({ base64: trendBase64, extension: 'png' });
            const pieId = workbook.addImage({ base64: pieBase64, extension: 'png' });
            worksheet.addImage(stackedId, { tl: { col: 6, row: 1 }, ext: { width: 420, height: 240 } });
            worksheet.addImage(trendId, { tl: { col: 6, row: 12 }, ext: { width: 420, height: 240 } });
            worksheet.addImage(pieId, { tl: { col: 6, row: 24 }, ext: { width: 320, height: 200 } });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileUrl = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = fileUrl;
            a.download = `FitFlow_Logs_${new Date().toISOString().slice(0, 10)}.xlsx`;
            a.click();
            URL.revokeObjectURL(fileUrl);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-3 animate-slide-up pb-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 px-1">
                <div className="space-y-0.5">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white tracking-tight uppercase leading-none">{t.logs_title}</h2>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em]">{t.logs_subtitle}</p>
                </div>
                <button
                    onClick={exportToExcel}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <FileSpreadsheet size={14} /> {lang === 'ar' ? 'تصدير EXCEL' : 'EXPORT EXCEL'}
                </button>
            </header>

            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row gap-2 items-center">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder={t.search_placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full ps-9 pe-4 py-2 bg-gray-50 dark:bg-slate-950 border-none text-gray-900 dark:text-white rounded-lg text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner transition-all"
                    />
                </div>
                <div className="w-full md:w-48">
                    <CustomSelect
                        label=""
                        value={statusFilter}
                        onChange={val => setStatusFilter(val as any)}
                        options={[
                            { label: t.filter_all, value: 'ALL' },
                            { label: lang === 'ar' ? 'مسموح' : 'Granted', value: AccessStatus.GRANTED },
                            { label: lang === 'ar' ? 'مرفوض' : 'Denied', value: AccessStatus.DENIED }
                        ]}
                        className="!min-h-0 !p-1.5 !text-[9px]"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto code-scroll">
                    <table className="w-full text-start border-collapse min-w-[500px]">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-900/50 text-gray-400 text-[7px] uppercase font-black tracking-[0.2em] border-b dark:border-slate-700">
                                <th className="px-3 py-2 text-start">{t.time}</th>
                                <th className="px-3 py-2 text-start">{t.user}</th>
                                <th className="px-3 py-2 text-center">{t.status}</th>
                                <th className="px-3 py-2 text-start">{t.device}</th>
                                <th className="px-3 py-2 text-start hidden sm:table-cell">{t.message}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                            {filteredLogs.map(log => {
                                const isGranted = log.status === AccessStatus.GRANTED;
                                return (
                                    <tr
                                        key={log.id}
                                        onClick={() => handleRowClick(log)}
                                        className="hover:bg-blue-50/10 dark:hover:bg-slate-700/20 transition-all group animate-fade-in cursor-pointer active:scale-[0.99] transition-transform"
                                    >
                                        <td className="px-3 py-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                                                    <Clock size={12} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-tighter">
                                                        {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="text-[7px] font-mono text-gray-400">
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0 border border-white dark:border-slate-800 shadow-sm overflow-hidden">
                                                    {log.userPhoto ? <img src={log.userPhoto} className="w-full h-full object-cover" /> : <UserIcon size={10} className="text-gray-400" />}
                                                </div>
                                                <span className="text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-tighter truncate max-w-[100px]">
                                                    {log.userName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-1.5 text-center">
                                            <div className="flex justify-center">
                                                <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider ${isGranted ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                    {isGranted ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                    {isGranted ? (lang === 'ar' ? 'مسموح' : 'OK') : (lang === 'ar' ? 'مرفوض' : 'DENIED')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-1.5">
                                            <div className="flex items-center gap-1 text-gray-400 font-mono text-[8px] font-bold">
                                                <Smartphone size={10} />
                                                <span className="truncate max-w-[60px]">{log.deviceId}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-1.5 hidden sm:table-cell">
                                            <span className="text-[9px] font-bold text-gray-400 italic truncate block max-w-[120px]">
                                                {log.reason || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredLogs.length === 0 && (
                    <div className="py-16 text-center flex flex-col items-center gap-2">
                        <History size={32} className="text-gray-100 dark:text-slate-700" strokeWidth={1} />
                        <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[8px]">{lang === 'ar' ? 'لا يوجد نتائج' : 'No records found'}</p>
                    </div>
                )}
            </div>

            {selectedMember && (
                <MemberDetailsModal
                    member={selectedMember}
                    logs={logs}
                    trainers={trainers}
                    lang={lang}
                    onClose={() => setSelectedMember(null)}
                    onUsePerk={onUsePerk || (() => { })}
                    onLogSession={onLogSession || (() => { })}
                    onUpdateMember={onUpdateUser || (() => { })}
                    onLogServiceSession={onLogServiceSession}
                    onConfirmPayment={onConfirmPayment}
                />
            )}

            {selectedStaff && (
                <TrainerDetailsModal
                    trainer={selectedStaff as any}
                    assignedMembers={selectedStaff.role === 'TRAINER' ? users.filter(u => u.assignedTrainerId === selectedStaff.id) : []}
                    attendanceLogs={logs.filter(l => Number(l.userId) === Number(selectedStaff.id)).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())}
                    lang={lang}
                    onClose={() => setSelectedStaff(null)}
                    onViewMember={(id) => {
                        const m = users.find(u => u.id === id);
                        if (m) setSelectedMember(m);
                    }}
                    onUpdateSchedule={handleSingleScheduleUpdate}
                    onBulkSchedule={handleBulkScheduleUpdate}
                />
            )}
        </div>
    );
};
