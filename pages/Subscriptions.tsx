import React, { useState } from 'react';
import { MembershipPlan, Offer, MembershipType, GymService, Branch, User, ServiceSubscription } from '../types';
import { Plus, Tag, AlertTriangle, Crown, Sparkles, LayoutPanelTop, Grid, Clock } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { PlanPricingList } from '../components/subscriptions/PlanPricingList';
import { OfferCard } from '../components/subscriptions/OfferCard';
import { OfferFormModal } from '../components/subscriptions/OfferFormModal';
import { ServiceList } from '../components/subscriptions/ServiceList';
import { ServiceFormModal } from '../components/subscriptions/ServiceFormModal';
import { SubscriptionLog } from '../components/subscriptions/SubscriptionLog';
import { ServicePurchaseModal } from '../components/subscriptions/ServicePurchaseModal';
import { useToast } from '../hooks/useToast';

interface SubscriptionsProps {
    plans: MembershipPlan[];
    offers: Offer[];
    services: GymService[];
    serviceSubscriptions: ServiceSubscription[];
    users: User[];
    branches: Branch[];
    lang: Language;
    onUpdatePrice: (type: MembershipType, price: number) => void;
    onAddOffer: (offer: Offer) => void;
    onDeleteOffer: (id: number) => void;
    onAddService: (service: GymService) => void;
    onUpdateService: (service: GymService) => void;
    onDeleteService: (id: number) => void;
    onPurchaseService: (sub: Omit<ServiceSubscription, 'id'>) => void;
    onPurchaseServiceWithFinance: (userId: number, service: GymService) => void;
    onDeleteServiceSubscription: (id: number) => void;
}

export const Subscriptions: React.FC<SubscriptionsProps> = ({
    plans, offers, services, serviceSubscriptions, users, branches, lang,
    onUpdatePrice, onAddOffer, onDeleteOffer,
    onAddService, onUpdateService, onDeleteService,
    onPurchaseService, onPurchaseServiceWithFinance, onDeleteServiceSubscription
}) => {
    const t = translations[lang];
    const { showToast } = useToast();
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [purchasingService, setPurchasingService] = useState<GymService | null>(null);
    const [editingService, setEditingService] = useState<GymService | undefined>();
    const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
    const [subToDelete, setSubToDelete] = useState<ServiceSubscription | null>(null);

    const handleAddOffer = (formData: any) => {
        const newOffer: Offer = {
            id: Date.now(),
            gymId: '',
            title: formData.title,
            code: formData.code.toUpperCase(),
            discountValue: formData.discountValue || 0,
            discountType: formData.discountType,
            validUntil: formData.validUntil,
            isActive: true
        };
        onAddOffer(newOffer);
        setIsOfferModalOpen(false);
        showToast(lang === 'ar' ? 'تم إضافة العرض بنجاح' : 'Offer added successfully', 'success');
    };

    const handleSaveService = (service: GymService) => {
        try {
            if (editingService) {
                if (typeof onUpdateService === 'function') {
                    onUpdateService(service);
                } else {
                    console.error('[Subscriptions] onUpdateService is not a function');
                }
            } else {
                if (typeof onAddService === 'function') {
                    onAddService(service);
                } else {
                    console.error('[Subscriptions] onAddService is not a function');
                }
            }
        } catch (error) {
            console.error('[Subscriptions] Error saving service:', error);
            showToast(lang === 'ar' ? 'حدث خطأ أثناء حفظ الخدمة' : 'Error saving service', 'error');
            return;
        }

        setIsServiceModalOpen(false);
        setEditingService(undefined);
        showToast(lang === 'ar' ? 'تم حفظ الخدمة بنجاح' : 'Service saved successfully', 'success');
    };

    const handleConfirmPurchase = (userId: number) => {
        if (!purchasingService) return;

        onPurchaseServiceWithFinance(userId, purchasingService);
        setPurchasingService(null);
    };

    return (
        <>
            <div className="space-y-6 sm:space-y-8 animate-fade-in pb-20 px-1">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl">
                            <LayoutPanelTop size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white tracking-tight leading-none uppercase">{t.plans_title}</h2>
                            <p className="text-[8px] text-gray-400 font-bold uppercase mt-1 tracking-[0.2em] flex items-center gap-1 text-start">
                                <Sparkles size={10} className="text-blue-500" /> Revenue Infrastructure
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    <div className="xl:col-span-8 space-y-8 h-full animate-slide-up">
                        {/* Plans Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <LayoutPanelTop size={16} className="text-blue-500" />
                                <h3 className="text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-widest">Membership Plans</h3>
                            </div>
                            <PlanPricingList plans={plans} lang={lang} onUpdatePrice={onUpdatePrice} />
                        </div>

                        {/* Services Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <div className="flex items-center gap-2">
                                    <Grid size={16} className="text-indigo-500" />
                                    <h3 className="text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-widest">{t.services_title}</h3>
                                </div>
                                <button
                                    onClick={() => { setEditingService(undefined); setIsServiceModalOpen(true); }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all shadow-lg shadow-blue-600/20 text-[9px] font-black uppercase tracking-widest active:scale-95 flex items-center gap-1.5"
                                >
                                    <Plus size={14} />
                                    {t.add_service}
                                </button>
                            </div>
                            <ServiceList
                                services={services}
                                lang={lang}
                                onEdit={(s) => { setEditingService(s); setIsServiceModalOpen(true); }}
                                onDelete={setServiceToDelete}
                                onPurchase={(s) => setPurchasingService(s)}
                            />
                        </div>
                    </div>

                    <div className="xl:col-span-4 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <Tag size={16} className="text-purple-500" />
                                <h3 className="text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-widest">{t.offers_title}</h3>
                            </div>
                            <button
                                onClick={() => setIsOfferModalOpen(true)}
                                className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl hover:scale-105 transition-all shadow-lg text-[9px] font-black uppercase tracking-widest active:scale-95 flex items-center gap-1.5"
                            >
                                <Plus size={14} />
                                {t.add_offer}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {offers.length > 0 ? (
                                offers.map((offer) => (
                                    <OfferCard key={offer.id} offer={offer} lang={lang} onDelete={setOfferToDelete} />
                                ))
                            ) : (
                                <div className="bg-white dark:bg-slate-800 p-10 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-slate-700 text-center space-y-2 opacity-60">
                                    <Tag size={24} className="mx-auto text-gray-300" />
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.no_offers}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Subscription Log Section - Moved to Full Width */}
                <div className="space-y-4 pt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-2 px-1">
                        <Clock size={16} className="text-blue-500" />
                        <h3 className="text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-widest">Purchase History</h3>
                    </div>
                    <SubscriptionLog
                        subscriptions={serviceSubscriptions}
                        users={users}
                        lang={lang}
                        onDelete={(id) => {
                            const sub = serviceSubscriptions.find(s => s.id === id);
                            if (sub) setSubToDelete(sub);
                        }}
                    />
                </div>
            </div>

            {/* Modals */}
            {offerToDelete && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 text-center">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-700 animate-scale-in p-8">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="font-black text-lg dark:text-white mb-2 uppercase tracking-tighter">Disable Offer?</h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-6 px-4">This will permanently invalidate code <b>{offerToDelete.code}</b> from the system.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setOfferToDelete(null)} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-500 rounded-xl font-black uppercase text-[10px] transition-all">Cancel</button>
                            <button onClick={() => { onDeleteOffer(offerToDelete.id); setOfferToDelete(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-red-600/30 transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {serviceToDelete !== null && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 text-center">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-700 animate-scale-in p-8">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="font-black text-lg dark:text-white mb-2 uppercase tracking-tighter">Delete Service?</h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-6 px-4">Are you sure you want to delete this service? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setServiceToDelete(null)} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-500 rounded-xl font-black uppercase text-[10px] transition-all">Cancel</button>
                            <button onClick={() => { onDeleteService(serviceToDelete); setServiceToDelete(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-red-600/30 transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {subToDelete && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 text-center">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-700 animate-scale-in p-8">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="font-black text-lg dark:text-white mb-2 uppercase tracking-tighter">
                            {lang === 'ar' ? 'حذف السجل؟' : 'Delete Record?'}
                        </h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-6 px-4">
                            {lang === 'ar' ? (
                                <>هل أنت متأكد من حذف اشتراك <b>{users.find(u => u.id === subToDelete.userId)?.name || 'العضو'}</b> في <b>{subToDelete.serviceName}</b>؟</>
                            ) : (
                                <>Are you sure you want to delete the subscription for <b>{users.find(u => u.id === subToDelete.userId)?.name || 'Member'}</b> to <b>{subToDelete.serviceName}</b>?</>
                            )}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setSubToDelete(null)} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-500 rounded-xl font-black uppercase text-[10px] transition-all">
                                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button onClick={() => { onDeleteServiceSubscription(subToDelete.id); setSubToDelete(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-red-600/30 transition-all">
                                {lang === 'ar' ? 'حذف' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isOfferModalOpen && (
                <OfferFormModal lang={lang} onClose={() => setIsOfferModalOpen(false)} onSave={handleAddOffer} />
            )}

            {isServiceModalOpen && (
                <ServiceFormModal
                    lang={lang}
                    branches={branches}
                    editingService={editingService}
                    onClose={() => { setIsServiceModalOpen(false); setEditingService(undefined); }}
                    onSave={handleSaveService}
                />
            )}

            {purchasingService && (
                <ServicePurchaseModal
                    service={purchasingService}
                    users={users}
                    lang={lang}
                    onClose={() => setPurchasingService(null)}
                    onConfirm={handleConfirmPurchase}
                />
            )}
        </>
    );
};
