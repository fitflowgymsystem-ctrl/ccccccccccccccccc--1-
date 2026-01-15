
import { useState, useMemo } from 'react';
import { User, MembershipPlan, Offer, Trainer } from '../types';
import { logPrivateSession, useMockPerk } from '../services/gymService';

export const useMemberManager = (users: User[], onUpdate?: () => void) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [activeModal, setActiveModal] = useState<'NONE' | 'FORM' | 'ENROLL' | 'DETAILS' | 'WA_CAMPAIGN'>('NONE');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewMemberId, setViewMemberId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: number, name: string } | null>(null);
  const [tempFingerprint, setTempFingerprint] = useState<string>('');

  const currentViewMember = useMemo(() => users.find(u => u.id === viewMemberId), [users, viewMemberId]);
  const currentEditingMember = useMemo(() => users.find(u => u.id === editingId), [users, editingId]);

  const filteredUsers = useMemo(() => {
    return [...users].filter(user => {
      const matchesSearch = (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.phone.includes(searchTerm));
      let matchesFilter = false;

      if (filterType === 'ALL') {
        matchesFilter = true;
      } else if (filterType === 'INSTALLMENTS') {
        matchesFilter = !!(user.installmentPlans && user.installmentPlans.length > 0);
      } else {
        matchesFilter = user.membershipType === filterType;
      }

      return matchesSearch && matchesFilter;
    }).sort((a, b) => b.id - a.id);
  }, [users, searchTerm, filterType]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTempFingerprint('');
    setActiveModal('FORM');
  };

  const handleOpenEdit = (user: User) => {
    setEditingId(user.id);
    setTempFingerprint('');
    setActiveModal('FORM');
  };

  const closeModals = () => setActiveModal('NONE');

  const handleUsePerk = (userId: number, type: 'InBody' | 'Guest Pass' | 'PT Session' | 'Free Group Class') => {
    useMockPerk(userId, type);
    if (onUpdate) onUpdate();
  };

  const handleLogSession = (userId: number, trainerId: number, price: number) => {
    logPrivateSession(userId, trainerId, price);
    if (onUpdate) onUpdate();
  };

  return {
    state: {
      searchTerm,
      filterType,
      activeModal,
      userToDelete,
      tempFingerprint,
      filteredUsers,
      currentViewMember,
      currentEditingMember
    },
    actions: {
      setSearchTerm,
      setFilterType,
      setActiveModal,
      setUserToDelete,
      setTempFingerprint,
      setViewMemberId,
      handleOpenAdd,
      handleOpenEdit,
      closeModals,
      handleUsePerk,
      handleLogSession
    }
  };
};
