
import React, { Suspense } from 'react';
import { UserRole, UserSession, GymProfile } from '../types';
import { Language } from '../utils/translations';

// استيراد الصفحات بشكل مباشر لضمان الأداء
import { Dashboard } from '../pages/Dashboard';
import { SuperAdmin } from '../pages/SuperAdmin';
import { MemberHome } from '../pages/MemberHome';
import { WorkoutPlanPage } from '../pages/WorkoutPlan';
import { CheckIn } from '../pages/CheckIn';
import { Members } from '../pages/Members';
import { POS } from '../pages/POS';
import { Financials } from '../pages/Financials';
import { Subscriptions } from '../pages/Subscriptions';
import { EquipmentPage } from '../pages/Equipment';
import { Trainers } from '../pages/Trainers';
import { Logs } from '../pages/Logs';
import { Profile } from '../pages/Profile';
import { Settings } from '../pages/Settings';
import { AccessControl } from '../pages/AccessControl';
import { ArchiveDashboard } from '../pages/ArchiveDashboard';
import { InBody } from '../pages/InBody';

interface AppRouterProps {
    currentPage: string;
    setCurrentPage: (p: string) => void;
    lang: Language;
    setLang: (l: Language) => void;
    currentUser: UserSession;
    data: any;
    actions: any;
    refreshData: () => void;
    gymInfo: any;
    gymProfile: GymProfile | null;
    refreshGymProfile: () => void;
    updateGymInfo: (n: string, l: string, e: string) => void;
    activeTheme: string;
    setActiveTheme: (t: string) => void;
    isSidebarOpen: boolean;
}

export const AppRouter: React.FC<AppRouterProps> = (props) => {
    const { currentPage, data, actions, currentUser, lang, setLang, refreshData } = props;
    const { users, logs, equipment, plans, offers, financials, trainers } = data;

    // دالة مساعدة لجلب بيانات العضو الحالي
    const getActiveMember = () => users.find((u: any) => u.id === currentUser.memberData?.id) || currentUser.memberData;

    const renderPage = () => {
        switch (currentPage) {
            case 'super_admin': return <SuperAdmin lang={lang} setLang={setLang} />;
            case 'dashboard': return <Dashboard users={users} logs={logs} equipment={equipment} financials={financials} lang={lang} activeTheme={props.activeTheme} />;
            case 'member_home': return currentUser.memberData ? <MemberHome member={getActiveMember()} logs={logs} services={data.services || []} serviceSubscriptions={data.serviceSubscriptions || []} lang={lang} onPurchaseService={actions.memberPurchaseService} /> : null;
            case 'workout_plan': return currentUser.memberData ? <WorkoutPlanPage member={getActiveMember()} lang={lang} onUpdateWorkout={actions.updateUser as any} onUpdateWater={actions.updateWater} /> : null;
            case 'inbody': return currentUser.memberData ? <InBody member={getActiveMember()} lang={lang} onAddMeasurement={actions.addInBodyMeasurement} onUpdateMeasurement={actions.updateInBodyMeasurement} onDeleteMeasurement={actions.deleteInBodyMeasurement} onUpdateSettings={actions.updateFitnessSettings} /> : null;
            case 'checkin': return <CheckIn lang={lang} onCheckIn={refreshData} />;
            case 'members': return <Members users={users} offers={offers} trainers={trainers} logs={logs} financials={financials} plans={plans} services={data.services || []} serviceSubscriptions={data.serviceSubscriptions || []} lang={lang} onAddUser={actions.addUser} onUpdateUser={actions.updateUser} onDeleteUser={actions.deleteUser} onAddFinancialRecord={actions.addFinancial} onLogServiceSession={actions.logServiceSession} onConfirmPayment={actions.confirmPayment} onUpdate={refreshData} isSidebarOpen={props.isSidebarOpen} branches={props.gymProfile?.branches || []} />;
            case 'pos': return <POS lang={lang} onUpdate={refreshData} />;
            case 'financials': return <Financials lang={lang} users={users} trainers={trainers} employees={data.employees} branches={props.gymProfile?.branches || []} currentUser={currentUser} onUpdate={refreshData} />;
            case 'subscriptions': {
                return <Subscriptions
                    plans={plans}
                    offers={offers}
                    services={data.services || []}
                    serviceSubscriptions={data.serviceSubscriptions || []}
                    users={users}
                    branches={props.gymProfile?.branches || []}
                    lang={lang}
                    onUpdatePrice={actions.updatePlan}
                    onAddOffer={actions.addOffer}
                    onDeleteOffer={actions.deleteOffer}
                    onAddService={actions.addService || (() => console.error('addService action not found'))}
                    onUpdateService={actions.updateService || (() => console.error('updateService action not found'))}
                    onDeleteService={actions.deleteService || (() => console.error('deleteService action not found'))}
                    onPurchaseService={actions.purchaseService || (() => console.error('purchaseService action not found'))}
                    onPurchaseServiceWithFinance={actions.memberPurchaseService || (() => console.error('memberPurchaseService action not found'))}
                    onDeleteServiceSubscription={actions.deleteServiceSubscription || (() => console.error('deleteServiceSubscription action not found'))}
                />;
            }
            case 'equipment': return <EquipmentPage equipment={equipment} lang={lang} onUpdateEquipment={actions.updateEquipment} onAddEquipment={actions.addEquipment} onDeleteEquipment={actions.deleteEquipment} />;
            case 'trainers': return (
                <Trainers
                    trainers={trainers}
                    users={users}
                    employees={data.employees}
                    logs={logs}
                    lang={lang}
                    onAddTrainer={actions.addTrainer}
                    onUpdateTrainer={actions.updateTrainer}
                    onDeleteTrainer={actions.deleteTrainer}
                    onAddEmployee={actions.addEmployee}
                    onUpdateEmployee={actions.updateEmployee}
                    onDeleteEmployee={actions.deleteEmployee}
                    onUpdateUser={actions.updateUser}
                    onUsePerk={actions.usePerk}
                    onLogSession={actions.logSession}
                    isSidebarOpen={props.isSidebarOpen}
                    branches={props.gymProfile?.branches || []}
                />
            );
            case 'logs': return <Logs logs={logs} users={users} trainers={trainers} employees={data.employees} lang={lang} onUpdateUser={actions.updateUser} onUpdateTrainer={actions.updateTrainer} onUpdateEmployee={actions.updateEmployee} onUsePerk={actions.usePerk} onLogSession={actions.logSession} />;
            case 'profile': return <Profile currentUser={currentUser} lang={lang} reloadProfile={props.refreshGymProfile} />;
            case 'settings': return <Settings lang={lang} setLang={props.setLang} role={currentUser.role} gymInfo={props.gymInfo} onUpdateGymInfo={props.updateGymInfo} activeTheme={props.activeTheme} onUpdateTheme={props.setActiveTheme} onNavigate={props.setCurrentPage} />;
            case 'access_control': return <AccessControl lang={lang} onBack={() => props.setCurrentPage('settings')} />;
            case 'archive': return <ArchiveDashboard lang={lang} />;
            default: return <Dashboard users={users} logs={logs} equipment={equipment} financials={financials} lang={lang} activeTheme={props.activeTheme} />;
        }
    };

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
            {renderPage()}
        </Suspense>
    );
};
