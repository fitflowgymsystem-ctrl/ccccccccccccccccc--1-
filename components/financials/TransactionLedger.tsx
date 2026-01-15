
import React from 'react';
import ReactDOM from 'react-dom';
import { Search, FileSpreadsheet, Image, X } from 'lucide-react';
import { FinancialRecord } from '../../types';
import { Language, translations } from '../../utils/translations';

interface TransactionLedgerProps {
  records: FinancialRecord[];
  searchTerm: string;
  onSearch: (v: string) => void;
  filterType: string;
  onFilterType: (v: any) => void;
  startDate: string;
  onStartDate: (v: string) => void;
  endDate: string;
  onEndDate: (v: string) => void;
  onExport: () => void;
  getCategoryLabel: (cat: string) => string;
  lang: Language;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  records, searchTerm, onSearch, filterType, onFilterType,
  startDate, onStartDate, endDate, onEndDate, onExport,
  getCategoryLabel, lang
}) => {
  const t = translations[lang];
  const [currentPage, setCurrentPage] = React.useState(1);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const itemsPerPage = 20;

  const sortedRecords = React.useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  // Reset page when records or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [records.length, searchTerm, filterType, startDate, endDate]);

  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const paginatedRecords = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRecords.slice(start, start + itemsPerPage);
  }, [sortedRecords, currentPage]);

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden">
        <div className="p-3 sm:p-4 border-b dark:border-slate-700 space-y-3">
          <div className="flex flex-col lg:flex-row justify-between gap-3">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-lg">
                {['ALL', 'INCOME', 'EXPENSE'].map(type => (
                  <button key={type} onClick={() => onFilterType(type as any)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === type ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>
                    {type === 'ALL' ? t.filter_all : (type === 'INCOME' ? t.income : t.expense)}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative w-full lg:w-64">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder={t.search_transactions} value={searchTerm} onChange={(e) => onSearch(e.target.value)} className="w-full ps-9 pe-4 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-600 dark:text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex gap-2 w-full sm:w-auto">
              <input type="date" value={startDate} onChange={e => onStartDate(e.target.value)} className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-[10px] dark:text-white" />
              <input type="date" value={endDate} onChange={e => onEndDate(e.target.value)} className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-[10px] dark:text-white" />
            </div>
            <button onClick={onExport} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold active:scale-95">
              <FileSpreadsheet size={14} /> {lang === 'ar' ? 'تصدير' : 'Export'}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 text-[10px] uppercase font-bold">
              <tr>
                <th className="p-3 text-start">{t.date}</th>
                <th className="p-3 text-start">{t.description}</th>
                <th className="p-3 text-start">{lang === 'ar' ? 'الموظف' : 'Operator'}</th>
                <th className="p-3 text-start">{lang === 'ar' ? 'التصنيف' : 'Category'}</th>
                <th className="p-3 text-center">{lang === 'ar' ? 'المرفق' : 'Receipt'}</th>
                <th className="p-3 text-end">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {paginatedRecords.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="p-3">
                    <p className="text-gray-900 dark:text-white font-mono text-[10px] font-bold">{new Date(r.date).toLocaleDateString()}</p>
                    <p className="text-[9px] text-gray-400 font-mono">{new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-bold dark:text-white truncate max-w-[120px] sm:max-w-none">{(r as any).translatedDescription || r.description}</p>
                    <span className="text-[9px] text-gray-400 uppercase sm:hidden">{getCategoryLabel(r.category)}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{(r as any).processedBy || '-'}</span>
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    <span className="text-[9px] text-gray-400 uppercase bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-md">{getCategoryLabel(r.category)}</span>
                  </td>
                  <td className="p-3 text-center">
                    {(r as any).attachmentUrl ? (
                      <button
                        onClick={() => setPreviewImage((r as any).attachmentUrl)}
                        className="w-10 h-10 rounded-xl overflow-hidden border-2 border-blue-500/30 hover:border-blue-500 transition-all shadow-sm hover:shadow-lg mx-auto block"
                      >
                        <img src={(r as any).attachmentUrl} alt="Receipt" className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <span className="text-gray-300 dark:text-slate-600"><Image size={16} className="mx-auto" /></span>
                    )}
                  </td>
                  <td className={`p-3 font-black text-end ${r.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>{r.type === 'INCOME' ? '+' : '-'}${r.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border dark:border-slate-700 text-[10px] font-bold dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest"
            >
              {lang === 'ar' ? 'السابق' : 'Previous'}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                {lang === 'ar' ? 'صفحة' : 'Page'} {currentPage} {lang === 'ar' ? 'من' : 'of'} {totalPages}
              </span>
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border dark:border-slate-700 text-[10px] font-bold dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest"
            >
              {lang === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        )}
      </div>

      {/* Image Preview Modal - Rendered via Portal to bypass parent overflow */}
      {previewImage && ReactDOM.createPortal(
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/90 z-[9999] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        >
          <div className="relative max-w-3xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-4 -right-4 bg-red-500 text-white p-3 rounded-full shadow-2xl hover:bg-red-600 transition-all z-10 border-4 border-white/20"
            >
              <X size={20} />
            </button>
            <img src={previewImage} alt="Receipt Preview" className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl object-contain border-4 border-white/10" />
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
