import React, { useState } from 'react';
import { X, DollarSign, Tag, Info, Save, Building2, User, Camera, Upload, Trash2, Search } from 'lucide-react';
import { Language, translations } from '../../utils/translations';
import { Branch, User as Member } from '../../types';

interface TransactionModalProps {
  formData: any;
  setFormData: (d: any) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
  lang: Language;
  branches: Branch[];
  members: Member[];
  currentUser: any;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ formData, setFormData, onSave, onClose, lang, branches, members, currentUser }) => {
  const t = translations[lang];
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.phone.includes(memberSearch)
  ).slice(0, 5);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, attachmentUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm animate-fade-in cursor-pointer" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border dark:border-slate-700 animate-scale-in cursor-default flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-50 dark:bg-slate-900/50 px-6 py-4 border-b dark:border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
              <DollarSign size={18} />
            </div>
            <div>
              <h3 className="font-black text-xs dark:text-white uppercase tracking-widest leading-none">{t.add_expense}</h3>
              <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Financial Transaction Record</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 p-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 rounded-xl transition-all"><X size={20} /></button>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-4 overflow-y-auto code-scroll">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.type}</label>
              <select
                value={formData.type}
                onChange={e => {
                  const newType = e.target.value as 'INCOME' | 'EXPENSE';
                  setFormData({ ...formData, type: newType, category: newType === 'INCOME' ? 'MEMBERSHIP' : 'MAINTENANCE' });
                }}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-[10px] font-bold outline-none dark:text-white focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="INCOME">{t.income}</option>
                <option value="EXPENSE">{t.expense}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.amount}</label>
              <input
                type="number" required
                value={formData.amount === 0 ? '' : formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value === '' ? 0 : Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-xs font-black outline-none dark:text-white focus:ring-2 focus:ring-blue-500/20"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.category}</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-[10px] font-bold outline-none dark:text-white focus:ring-2 focus:ring-blue-500/20"
              >
                {formData.type === 'INCOME' ? (
                  <>
                    <option value="MEMBERSHIP">{t.cat_membership}</option>
                    <option value="PRODUCT">{t.cat_product}</option>
                    <option value="OTHER">{t.cat_other}</option>
                  </>
                ) : (
                  <>
                    <option value="MAINTENANCE">{t.cat_maintenance}</option>
                    <option value="SALARY">{t.cat_salary}</option>
                    <option value="PRODUCT">{t.cat_product}</option>
                    <option value="OTHER">{t.cat_other}</option>
                  </>
                )}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'الفرع' : 'Branch'}</label>
              <select
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-[10px] font-bold outline-none dark:text-white focus:ring-2 focus:ring-blue-500/20"
              >
                {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'العضو المرتبط (اختياري)' : 'Linked Member (Optional)'}</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={memberSearch}
                onFocus={() => setShowMemberDropdown(true)}
                onChange={e => {
                  setMemberSearch(e.target.value);
                  setShowMemberDropdown(true);
                }}
                placeholder={lang === 'ar' ? 'ابحث بالاسم أو الرقم...' : 'Search by name or phone...'}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-xs font-bold outline-none dark:text-white focus:ring-2 focus:ring-blue-500/20"
              />
              {formData.memberId && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, memberId: undefined });
                    setMemberSearch('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {showMemberDropdown && memberSearch && !formData.memberId && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                {filteredMembers.length > 0 ? filteredMembers.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, memberId: m.id });
                      setMemberSearch(m.name);
                      setShowMemberDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between border-b last:border-0 dark:border-slate-700"
                  >
                    <div>
                      <p className="text-[10px] font-black dark:text-white uppercase">{m.name}</p>
                      <p className="text-[8px] text-gray-400 font-bold">{m.phone}</p>
                    </div>
                    <User size={14} className="text-blue-600" />
                  </button>
                )) : (
                  <div className="px-4 py-3 text-[10px] text-gray-400 font-bold uppercase text-center italic">No results</div>
                )}
              </div>
            )}
          </div>


          <div className="space-y-1">
            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.description}</label>
            <input
              type="text" required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-xs font-bold outline-none dark:text-white focus:ring-2 focus:ring-blue-500/20"
              placeholder="Record details..."
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'المرفقات (اختياري)' : 'Attachment (Optional)'}</label>
            <div className="flex gap-4">
              <div className="relative w-24 h-24 shrink-0">
                <div className="w-full h-full rounded-2xl bg-gray-50 dark:bg-slate-950 border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-inner group">
                  {formData.attachmentUrl ? (
                    <>
                      <img src={formData.attachmentUrl} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, attachmentUrl: '' })}
                        className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                      >
                        <Trash2 size={24} />
                      </button>
                    </>
                  ) : (
                    <Camera className="text-gray-300" size={24} />
                  )}
                </div>
                {!formData.attachmentUrl && (
                  <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-xl cursor-pointer shadow-lg hover:bg-blue-700 transition-all border-4 border-white dark:border-slate-800 active:scale-90">
                    <Upload size={12} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>
              <div className="flex-1 bg-blue-50/30 dark:bg-blue-900/5 rounded-2xl p-3 border dark:border-slate-700 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <Info size={12} className="text-blue-600" />
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{lang === 'ar' ? 'بصمة العملية' : 'Transaction Stamp'}</span>
                </div>
                <p className="text-[8px] text-gray-500 font-bold">{lang === 'ar' ? 'سوف يتم تسجيل اسم الموظف والفرع والتاريخ تلقائياً لضمان الشفافية والتدقيق المالي.' : 'Staff name, branch, and timestamp will be recorded automatically for financial audit'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Operator: {currentUser?.name || 'System Auto'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase text-gray-400 rounded-[1.5rem] bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 transition-all active:scale-95 shadow-sm border dark:border-slate-600">Cancel</button>
            <button type="submit" className="flex-[2] py-4 text-[11px] font-black uppercase text-white bg-blue-600 rounded-[1.5rem] shadow-2xl shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-3 transition-all hover:bg-blue-700 tracking-[0.2em]">
              <Save size={18} /> {t.save}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};
