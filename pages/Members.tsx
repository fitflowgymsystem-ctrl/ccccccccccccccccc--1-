import React from 'react';
import { User, AccessLog, FinancialRecord, MembershipPlan, Offer, Trainer, Branch, ServiceSubscription, MembershipType } from '../types';
import { UserPlus, Search, MessageCircle, Filter } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { useMemberManager } from '../hooks/useMemberManager';
import { getCurrentGymId } from '../services/storage';
import { useToast } from '../hooks/useToast';

import { MemberDetailsModal } from '../components/members/MemberDetailsModal';
import { MemberFormModal } from '../components/members/MemberFormModal';
import { WhatsAppCampaignModal } from '../components/members/WhatsAppCampaignModal';
import { MemberTable } from '../components/members/MemberTable';
import { MemberDeleteModal } from '../components/members/MemberDeleteModal';
import { CredentialsSuccessModal } from '../components/shared/CredentialsSuccessModal';
import { CustomSelect } from '../components/shared/CustomSelect';

interface MembersProps {
  users: User[];
  offers: Offer[];
  trainers: Trainer[];
  logs: AccessLog[];
  financials: FinancialRecord[];
  plans: MembershipPlan[];
  lang: Language;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: number) => void;
  onAddFinancialRecord: (record: FinancialRecord) => void;
  onUpdate?: () => void;
  isSidebarOpen?: boolean;
  branches?: Branch[];
  services?: any[];
  serviceSubscriptions?: ServiceSubscription[];
  onLogServiceSession?: (userId: number, serviceId: number, price: number, serviceName: string) => void;
  onConfirmPayment?: (subId: number) => Promise<void>;
}

export const Members: React.FC<MembersProps> = (props) => {
  const { lang, trainers, offers, logs, plans, onAddUser, onUpdateUser, onDeleteUser, onAddFinancialRecord, branches = [], services = [], serviceSubscriptions = [], onLogServiceSession, onConfirmPayment } = props;
  const t = translations[lang];
  const { state, actions } = useMemberManager(props.users, props.onUpdate);
  const { showToast } = useToast();
  const [successData, setSuccessData] = React.useState<{ name: string, phone: string, email: string, password: string } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 20;

  // Calculate Pagination
  const totalPages = Math.ceil(state.filteredUsers.length / itemsPerPage);
  const paginatedUsers = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return state.filteredUsers.slice(start, start + itemsPerPage);
  }, [state.filteredUsers, currentPage]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [state.filterType, state.searchTerm]);

  // Use the actual Gym ID from storage to ensure consistency with other services
  const currentGymName = React.useMemo(() => {
    // We import this dynamically or rely on the prop if available, but for now we use the storage function
    // Since we can't easily import inside useMemo, we'll assume the helper is available or use a reliable fallback
    // Actually, let's use the helper directly if we import it at the top.

    // Fallback logic for display name only, but for ID we must use the session
    const adminUser = props.users.find(u => u.role === 'developer' || u.role === 'admin');
    return adminUser?.gym_name || 'GYM';
  }, [props.users]);

  // Get the authoritative Gym ID
  const currentGymId = getCurrentGymId();

  const handleSaveMember = async (formData: any) => {
    // [v4-CONSOLIDATED DIAGNOSTICS]
    const lookupType = (formData.membershipType || '').toString().trim().toUpperCase();
    const matchingPlan = plans.find(p => p.type?.toString().trim().toUpperCase() === lookupType);
    const planPrice = matchingPlan?.price || 0;
    const isInst = !!(formData.installmentPlan && (formData.installmentPlan.enabled === true || Number(formData.installmentPlan.total) > 0));

    let calcAmount = 0;
    let shouldRecord = false;

    if (Number(formData.totalPaid || 0) > 0) {
      calcAmount = Number(formData.totalPaid);
      shouldRecord = true;
    } else if (isInst) {
      calcAmount = Number(formData.installmentPlan?.downPayment || 0);
      const hadInst = !!(state.currentEditingMember?.installmentPlans && state.currentEditingMember.installmentPlans.length > 0);
      // Record if new member OR if existing member didn't have an installment plan before
      if (!state.currentEditingMember || (!hadInst && calcAmount > 0)) {
        shouldRecord = true;
      }
    } else if (!state.currentEditingMember) {
      calcAmount = planPrice;
      shouldRecord = true;
    }


    const { inbodySessions, guestPasses, ptSessions, groupClasses, freeGroupClassCount, freeGroupClassId, spaAccess, privateLocker, towelService, barDiscount, installmentPlan, ...rest } = formData;

    let transformedInstallmentPlans: any[] | undefined = undefined;
    if (isInst) {
      const remaining = Number(installmentPlan.total || 0) - Number(installmentPlan.downPayment || 0);
      const monthsCount = Number(installmentPlan.months || 1);
      const perMonth = Math.round(remaining / monthsCount);
      const installments = [];
      const today = new Date();
      for (let i = 1; i <= monthsCount; i++) {
        const d = new Date(today);
        d.setMonth(today.getMonth() + i);
        installments.push({
          id: Date.now() + i + Math.floor(Math.random() * 1000),
          dueDate: d.toISOString().split('T')[0],
          amount: perMonth,
          status: 'UNPAID'
        });
      }
      transformedInstallmentPlans = [{
        id: Date.now() + 50,
        totalAmount: Number(installmentPlan.total),
        downPayment: Number(installmentPlan.downPayment || 0),
        remainingAmount: remaining,
        installmentsCount: monthsCount,
        installmentAmount: perMonth,
        startDate: today.toISOString().split('T')[0],
        installments,
        status: 'ACTIVE',
        description: installmentPlan.description || 'New Installment Plan'
      }];
    }

    const commonData = {
      ...rest,
      installmentPlans: transformedInstallmentPlans,
      fingerprintId: formData.fingerprintId || `ID_${Math.floor(Math.random() * 10000)}`,
      activeOfferId: formData.activeOfferId ? Number(formData.activeOfferId) : null,
      assignedTrainerId: formData.assignedTrainerId ? Number(formData.assignedTrainerId) : null,
      perks: {
        inbodySessions: Number(inbodySessions || 0),
        guestPasses: Number(guestPasses || 0),
        ptSessions: Number(ptSessions || 0),
        groupClasses: !!groupClasses,
        freeGroupClassCount: Number(freeGroupClassCount || 0),
        freeGroupClassId: freeGroupClassId || null,
        spaAccess: !!spaAccess,
        privateLocker: !!privateLocker,
        towelService: !!towelService,
        barDiscount: !!barDiscount
      }
    };

    let finalStatus = '';
    try {
      // --- Record Financial Entry if needed (Shared Logic) ---
      if (shouldRecord && calcAmount > 0) {
        try {
          await onAddFinancialRecord({
            id: Date.now() + 100,
            gymId: currentGymId || currentGymName,
            type: 'INCOME',
            category: 'MEMBERSHIP',
            amount: calcAmount,
            description: `${state.currentEditingMember ? 'Payment/Update' : 'New Member'}: ${formData.name}${isInst ? ' (Down Payment)' : ''}`,
            date: new Date().toISOString(),
            paymentMethod: formData.paymentMethod || 'CASH'
          } as FinancialRecord);
          finalStatus += '✅ Finance Recorded\n';

          // [TRIGGER] New Installment Notification
          if (isInst) {
            const { notifyBranchStaff } = await import('../services/notificationService');
            // We need the full user list to find staff. We have props.users in scope? No, useMemberManager has users? 
            // Members component has `props.users`.
            await notifyBranchStaff(
              props.users,
              typeof formData.branch === 'string' ? formData.branch : (state.currentEditingMember?.branch || ''),
              lang === 'ar' ? 'قسط جديد' : 'New Installment',
              lang === 'ar'
                ? `تم إضافة خطة تقسيط جديدة للعضو ${formData.name}. المبلغ الكلي: ${installmentPlan.total}`
                : `New installment plan added for ${formData.name}. Total: ${installmentPlan.total}`,
              'info',
              state.currentEditingMember?.id
            );
          }

        } catch (fErr: any) {
          finalStatus += `❌ Finance Error: ${fErr.message}\n`;
          console.error('[v5] Finance record error:', fErr);
        }
      } else {
        finalStatus += '⚠️ Finance Skipped (0 or Existing)\n';
      }

      if (state.currentEditingMember) {
        const updatedMember = { ...state.currentEditingMember, ...commonData };
        await onUpdateUser(updatedMember as User);
        finalStatus += '✅ Member Updated';
        showToast(lang === 'ar' ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully', 'success');
      } else {
        if (!formData.email) {
          alert(lang === 'ar' ? 'البريد الإلكتروني مطلوب!' : 'Email is required!');
          return;
        }

        // --- Create Member in Auth and Database ---
        const { createMemberWithAuth } = await import('../services/userCreationService');
        const result = await createMemberWithAuth({
          ...commonData,
          gymId: currentGymId || currentGymName,
          isFrozen: false
        });

        console.log('[v5] Member created successfully:', result.data);

        // Wait for user to be locally added and global state refreshed
        // Since createMemberWithAuth already posted to the server, we just need to refresh the local list
        if (props.onUpdate) {
          props.onUpdate();
        } else {
          // Fallback if no update function, though there should be one
          // We can't use onAddUser() as it triggers a POST in useGymData
        }

        setSuccessData({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.phone
        });

        finalStatus += '✅ New Member Created';
        showToast(lang === 'ar' ? `تمت إضافة العضو ${formData.name} بنجاح` : `Member ${formData.name} added successfully`, 'success');
      }

      actions.closeModals();
      if (props.onUpdate) props.onUpdate();

      // No more alerts, the UI will update or successData modal will show for new members

    } catch (error: any) {
      console.error('[FATAL ERROR]', error);

      let errorMsg = lang === 'ar' ? 'فشل الحفظ' : 'Failed to save';
      if (error.message === 'WEAK_PASSWORD') {
        errorMsg = lang === 'ar' ? 'كلمة المرور (رقم الهاتف) يجب أن تكون 6 أرقام على الأقل!' : 'Phone number (password) must be at least 6 digits!';
      } else if (error.message === 'EMAIL_EXISTS') {
        errorMsg = lang === 'ar' ? 'هذا البريد الإلكتروني مسجل مسبقاً!' : 'Email already exists!';
      } else if (error.message === 'INVALID_EMAIL') {
        errorMsg = lang === 'ar' ? 'البريد الإلكتروني غير صحيح!' : 'Invalid email format!';
      }

      showToast(errorMsg, 'error');
    }
  };

  return (
    <>
      <div className="space-y-3 animate-slide-up pb-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 px-1">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white tracking-tight uppercase leading-none">{t.members_title}</h2>
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em]">{t.members_subtitle}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => actions.setActiveModal('WA_CAMPAIGN')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-green-500/20 active:scale-95 tracking-widest"><MessageCircle size={14} />{t.wa_campaign}</button>
            <button onClick={actions.handleOpenAdd} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg active:scale-95 transition-all uppercase tracking-widest hover:bg-blue-700"><UserPlus size={14} />{t.add_member}</button>
          </div>
        </header>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
          <div className="p-2 border-b dark:border-slate-700 flex flex-col lg:flex-row gap-2 bg-gray-50/50 dark:bg-slate-900/50 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="text"
                placeholder={t.search_placeholder}
                value={state.searchTerm}
                onChange={(e) => actions.setSearchTerm(e.target.value)}
                className="w-full ps-8 pe-3 py-1.5 bg-white dark:bg-slate-950 border-2 border-transparent focus:border-blue-500/30 text-gray-900 dark:text-white rounded-lg text-[10px] font-bold outline-none shadow-sm"
              />
            </div>
            <div className="w-full lg:w-48">
              <CustomSelect
                label=""
                value={state.filterType}
                onChange={val => actions.setFilterType(val)}
                options={['ALL', 'INSTALLMENTS', MembershipType.LIFETIME, ...plans.map(p => p.type)].map(opt => ({
                  label: opt === 'ALL' ? t.all_types :
                    opt === 'INSTALLMENTS' ? (lang === 'ar' ? 'أقساط' : 'Installments') :
                      opt === MembershipType.LIFETIME ? (lang === 'ar' ? 'اشتراك مدى الحياة' : 'Lifetime Subscription') :
                        opt,
                  value: opt
                }))}
                className="!min-h-0 !p-1.5 !text-[9px]"
              />
            </div>
          </div>
          <MemberTable users={paginatedUsers} lang={lang} onView={(id) => { actions.setViewMemberId(id); actions.setActiveModal('DETAILS'); }} onEdit={actions.handleOpenEdit} onDelete={(user) => actions.setUserToDelete(user)} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-3 border-t dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed dark:text-white"
              >
                {lang === 'ar' ? 'السابق' : 'Previous'}
              </button>
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {lang === 'ar' ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed dark:text-white"
              >
                {lang === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals خارج div المتحرك لإصلاح مشكلة backdrop */}
      {state.userToDelete && <MemberDeleteModal userName={state.userToDelete.name} lang={lang} onCancel={() => actions.setUserToDelete(null)} onConfirm={() => { onDeleteUser(state.userToDelete!.id); actions.setUserToDelete(null); }} />}
      {state.activeModal === 'FORM' && <MemberFormModal lang={lang} offers={offers} trainers={trainers} branches={branches} services={services} editingMember={state.currentEditingMember} onClose={actions.closeModals} onSave={handleSaveMember} />}
      {state.activeModal === 'DETAILS' && state.currentViewMember && <MemberDetailsModal lang={lang} member={state.currentViewMember} logs={logs} trainers={trainers} services={services} serviceSubscriptions={serviceSubscriptions} onClose={actions.closeModals} onUsePerk={actions.handleUsePerk} onLogSession={actions.handleLogSession}
        onLogServiceSession={onLogServiceSession}
        onConfirmPayment={onConfirmPayment}
        onUpdateMember={onUpdateUser}
      />}
      {state.activeModal === 'WA_CAMPAIGN' && <WhatsAppCampaignModal users={props.users} logs={logs} lang={lang} onClose={actions.closeModals} />}

      {successData && (
        <CredentialsSuccessModal
          lang={lang}
          userName={successData.name}
          phone={successData.phone}
          email={successData.email}
          password={successData.password}
          gymName={currentGymName}
          onClose={() => setSuccessData(null)}
        />
      )}
    </>
  );
};
