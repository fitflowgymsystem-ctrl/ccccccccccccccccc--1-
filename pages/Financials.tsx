
import React, { useState } from 'react';
import { addFinancialRecord } from '../services/gymService';
import { FinancialRecord, User, Branch } from '../types';
import { Language, translations } from '../utils/translations';
import { Plus } from 'lucide-react';
import ExcelJS from 'exceljs';
import { useFinancials } from '../hooks/useFinancials';
import { useToast } from '../hooks/useToast';

// Sub-components
import { FinancialSummary } from '../components/financials/FinancialSummary';
import { AccountingCharts } from '../components/financials/AccountingCharts';
import { TransactionLedger } from '../components/financials/TransactionLedger';
import { TransactionModal } from '../components/financials/TransactionModal';

interface FinancialsProps {
    lang: Language;
    users: User[];
    trainers: any[];
    employees: any[];
    branches?: Branch[];
    currentUser?: any;
    onUpdate?: () => void;
}

export const Financials: React.FC<FinancialsProps> = ({ lang, users, trainers, employees, branches = [], currentUser, onUpdate }) => {
    const t = translations[lang];
    const { filteredRecords, stats, chartData, refreshData, getCategoryLabel, filters } = useFinancials(lang, trainers, employees);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const defaultBranch = currentUser?.branch || (branches.length > 0 ? branches[0].name : 'Main Branch');

    const initialFormState = {
        type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
        category: 'MAINTENANCE' as FinancialRecord['category'],
        amount: undefined as unknown as number,
        description: '',
        paymentMethod: 'CASH' as 'CASH' | 'CARD',
        date: new Date().toISOString(),
        branch: defaultBranch,
        memberId: undefined as number | undefined,
        attachmentUrl: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const exportToExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Financial Transactions');
            worksheet.views = [{ rightToLeft: lang === 'ar' }];

            // Build table rows from records
            const rows = filteredRecords.map(r => [
                r.date,
                r.type,
                getCategoryLabel(r.category),
                (r as any).translatedDescription || r.description,
                Number(r.amount)
            ]);

            // Create table with headers
            worksheet.addTable({
                name: 'FinancialsTable',
                ref: 'A1',
                headerRow: true,
                totalsRow: false,
                style: { theme: 'TableStyleMedium9', showRowStripes: true },
                columns: [
                    { name: lang === 'ar' ? 'التاريخ' : 'Date' },
                    { name: lang === 'ar' ? 'النوع' : 'Type' },
                    { name: lang === 'ar' ? 'التصنيف' : 'Category' },
                    { name: lang === 'ar' ? 'الوصف' : 'Description' },
                    { name: lang === 'ar' ? 'المبلغ' : 'Amount' }
                ],
                rows
            });

            // Styling header row
            const headerRow = worksheet.getRow(1);
            headerRow.font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
            headerRow.height = 22;

            // Set column widths and number format for amount
            worksheet.getColumn(1).width = 18;
            worksheet.getColumn(2).width = 14;
            worksheet.getColumn(3).width = 20;
            worksheet.getColumn(4).width = 40;
            worksheet.getColumn(5).width = 16; worksheet.getColumn(5).numFmt = '[$$-409]#,##0.00;[Red]-[$$-409]#,##0.00';

            // Apply row styling for amounts and types
            const startRow = 2;
            for (let i = 0; i < rows.length; i++) {
                const r = worksheet.getRow(startRow + i);
                const typeCell = r.getCell(2);
                const amtCell = r.getCell(5);
                const typeVal = String(typeCell.value || '');
                if (typeVal === 'INCOME') {
                    amtCell.font = { color: { argb: 'FF10B981' }, bold: true };
                } else {
                    amtCell.font = { color: { argb: 'FFEF4444' }, bold: true };
                }
                amtCell.alignment = { horizontal: 'right' };
            }

            // Prepare charts: stacked bar (cashFlow), monthly trend, category pie
            const { cashFlow } = chartData;
            const expensePie = chartData.expensePie || [];

            const svgToPngBase64 = async (svg: string, width = 720, height = 360) => {
                const img = new Image();
                const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Canvas not supported');
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => { try { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height); ctx.drawImage(img, 0, 0, width, height); resolve(); } catch (e) { reject(e); } };
                    img.onerror = (e) => reject(new Error('Failed to load svg')); img.src = url;
                });
                URL.revokeObjectURL(url);
                const dataUrl = canvas.toDataURL('image/png');
                return dataUrl.split(',')[1];
            };

            const genStackedSVG = (data: any[]) => {
                const width = 720, height = 360;
                const padding = 40;
                const maxVal = Math.max(...data.map(d => (d.income || 0) + (d.expense || 0)), 1);
                const barW = Math.max(18, (width - padding * 2) / Math.max(1, data.length) - 6);
                let x = padding;
                const bars = data.map((d) => {
                    const incH = Math.round((d.income / maxVal) * (height - 120));
                    const expH = Math.round((d.expense / maxVal) * (height - 120));
                    const incY = height - padding - expH - incH;
                    const expY = height - padding - expH;
                    const bar = `<rect x='${x}' y='${incY}' width='${barW}' height='${incH}' fill='#10B981' rx='4' />` +
                        `<rect x='${x}' y='${expY}' width='${barW}' height='${expH}' fill='#EF4444' rx='4' />` +
                        `<text x='${x + barW / 2}' y='${height - padding + 14}' font-size='10' text-anchor='middle' fill='#374151'>${d.name}</text>`;
                    x += barW + 6;
                    return bar;
                }).join('\n');

                return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>\n<style>text{font-family:Inter, Roboto, Arial;}</style><rect width='100%' height='100%' fill='white' rx='8'/>\n<g transform='translate(0,0)'>\n<text x='20' y='22' font-size='16' font-weight='700' fill='#111827'>${lang === 'ar' ? 'الإيرادات مقابل المصروفات (مكدّسة)' : 'Income vs Expenses (Stacked)'}</text>\n${bars}\n</g>\n</svg>`;
            };

            const genTrendSVG = (data: any[]) => {
                const width = 720, height = 360;
                const padding = 50;
                const maxVal = Math.max(...data.map(d => Math.max(d.income || 0, d.expense || 0)), 1);
                const stepX = (width - padding * 2) / Math.max(1, data.length - 1);
                const linePoints = (key: string) => data.map((d, i) => `${padding + i * stepX},${height - padding - ((d[key] / maxVal) * (height - padding * 2))}`).join(' ');
                const incomePoints = linePoints('income');
                const expensePoints = linePoints('expense');
                return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>\n<style>text{font-family:Inter, Roboto, Arial;}</style><rect width='100%' height='100%' fill='white' rx='8'/>\n<g>\n<text x='20' y='22' font-size='16' font-weight='700' fill='#111827'>${lang === 'ar' ? 'اتجاه شهري' : 'Monthly Trend'}</text>\n<polyline fill='none' stroke='#10B981' stroke-width='3' points='${incomePoints}' />\n<polyline fill='none' stroke='#EF4444' stroke-width='3' points='${expensePoints}' />\n</g>\n</svg>`;
            };

            const genPieSVG = (items: any[]) => {
                const labels = items.map(i => i.name);
                const values = items.map(i => i.value);
                const total = values.reduce((s, v) => s + v, 0) || 1;
                const width = 480, height = 300, cx = 120, cy = 120, r = 80;
                let start = 0; const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                const paths: string[] = [];
                labels.forEach((label, i) => {
                    const val = values[i];
                    const angle = (val / total) * Math.PI * 2;
                    const end = start + angle;
                    const x1 = cx + r * Math.cos(start);
                    const y1 = cy + r * Math.sin(start);
                    const x2 = cx + r * Math.cos(end);
                    const y2 = cy + r * Math.sin(end);
                    const large = angle > Math.PI ? 1 : 0;
                    paths.push(`<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${colors[i % colors.length]}" />`);
                    start = end;
                });
                let legend = '';
                labels.forEach((label, i) => {
                    const y = 20 + i * 20;
                    legend += `<rect x="260" y="${y - 8}" width="12" height="12" fill="${colors[i % colors.length]}" />` +
                        `<text x="280" y="${y}" font-size="12" fill="#111827">${label} (${values[i]})</text>`;
                });
                return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>\n<style>text{font-family:Inter, Roboto, Arial;}</style><rect width='100%' height='100%' fill='white'/>${paths.join('\n')}${legend}</svg>`;
            };

            // Generate images and embed
            const stackedSvg = genStackedSVG(cashFlow);
            const trendSvg = genTrendSVG(cashFlow);
            const pieSvg = genPieSVG(expensePie);

            const stackedBase64 = await svgToPngBase64(stackedSvg, 720, 360);
            const trendBase64 = await svgToPngBase64(trendSvg, 720, 360);
            const pieBase64 = await svgToPngBase64(pieSvg, 480, 300);

            const stackedId = workbook.addImage({ base64: stackedBase64, extension: 'png' });
            const trendId = workbook.addImage({ base64: trendBase64, extension: 'png' });
            const pieId = workbook.addImage({ base64: pieBase64, extension: 'png' });

            worksheet.addImage(stackedId, { tl: { col: 6, row: 0 }, ext: { width: 420, height: 240 } });
            worksheet.addImage(trendId, { tl: { col: 6, row: 12 }, ext: { width: 420, height: 240 } });
            worksheet.addImage(pieId, { tl: { col: 6, row: 24 }, ext: { width: 320, height: 220 } });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileUrl = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = fileUrl;
            a.download = `Financials_${new Date().toISOString().slice(0, 10)}.xlsx`; a.click();
            URL.revokeObjectURL(fileUrl);
        } catch (e) { console.error(e); }
    };

    const { showToast } = useToast();

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        addFinancialRecord({
            ...formData,
            amount: Number(formData.amount || 0),
            id: Date.now(),
            date: new Date().toISOString(),
            gymId: '',
            processedBy: currentUser?.name || 'System'
        } as FinancialRecord);
        refreshData();
        showToast(lang === 'ar' ? 'تم حفظ المعاملة بنجاح' : 'Transaction saved successfully', 'success');
        setIsModalOpen(false);
        setFormData({
            ...initialFormState,
            date: new Date().toISOString()
        });
        if (onUpdate) onUpdate();
    };

    return (
        <>
            <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10 px-1 sm:px-0">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 px-1">
                    <div className="space-y-0.5">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white tracking-tight uppercase leading-none">{t.fin_title}</h2>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em]">SaaS Ledger & Revenue Tracking</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-[10px] font-black active:scale-95 transition-all uppercase tracking-widest">
                        <Plus size={16} /> {t.add_expense}
                    </button>
                </header>

                <FinancialSummary income={stats.income} expenses={stats.expenses} net={stats.net} storeProfit={stats.storeProfit} totalPrivateRevenue={stats.totalPrivate} lang={lang} />
                <AccountingCharts cashFlowData={chartData.cashFlow} expenseData={chartData.expensePie} lang={lang} />
                <TransactionLedger records={filteredRecords} searchTerm={filters.searchTerm} onSearch={filters.setSearchTerm} filterType={filters.filterType} onFilterType={filters.setFilterType} startDate={filters.startDate} onStartDate={filters.setStartDate} endDate={filters.endDate} onEndDate={filters.setEndDate} onExport={exportToExcel} getCategoryLabel={getCategoryLabel} lang={lang} />
            </div>

            {/* Modals خارج div المتحرك */}
            {isModalOpen && (
                <TransactionModal
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                    lang={lang}
                    branches={branches.length > 0 ? branches : [{ id: 'main', name: 'Main Branch' }]}
                    members={users}
                    currentUser={currentUser}
                />
            )}
        </>
    );
};
