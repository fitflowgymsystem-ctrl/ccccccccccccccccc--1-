
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { calculateExpiry } from '../utils/dateUtils';
import { calculateMRR } from '../services/saasService';
import { MembershipType, GymSubscriptionPlan, Gender } from '../types';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { MemberTable } from '../components/members/MemberTable';
import { MemberFormModal } from '../components/members/MemberFormModal';

describe('FitFlow SaaS Logic & UI Comprehensive Suite', () => {

  describe('1. Unit Tests: Business Logic & Calculations', () => {

    it('should correctly calculate expiry date for various tiers', () => {
      const start = '2025-01-01';
      expect(calculateExpiry(MembershipType.DAILY, start)).toBe('2025-01-02');
      expect(calculateExpiry(MembershipType.MONTHLY, start)).toBe('2025-02-01');
      expect(calculateExpiry(MembershipType.YEARLY, start)).toBe('2026-01-01');
    });

    it('should handle edge cases for leap years', () => {
      // 2024 was a leap year
      // Jan 31st + 1 Month should be Feb 29th (last day of Feb)
      expect(calculateExpiry(MembershipType.MONTHLY, '2024-01-31')).toBe('2024-02-29');
    });

    it('should calculate MRR correctly excluding inactive nodes', () => {
      const mockGyms = [
        { id: '1', isActive: true, subscriptionPlan: GymSubscriptionPlan.BASIC }, // $80
        { id: '2', isActive: true, subscriptionPlan: GymSubscriptionPlan.PRO },   // $150
        { id: '3', isActive: false, subscriptionPlan: GymSubscriptionPlan.PRO },  // Ignored
      ];
      const mrr = calculateMRR(mockGyms);
      // BASIC: 80 for 30 days -> monthly 80
      // PRO: 150 for 90 days -> monthly 150 * (30/90) = 50
      // Total monthly MRR = 80 + 50 = 130
      expect(Math.round(mrr)).toBe(130);
    });

    it('should handle invalid date formats gracefully', () => {
      expect(calculateExpiry(MembershipType.MONTHLY, 'not-a-date')).toBe('');
    });
  });

  describe('2. Component Tests: UI Data Rendering', () => {

    it('should render exact stat values in KPIGrid', () => {
      render(
        <KPIGrid
          occupancyCount={45}
          newSignups={12}
          signupsTrend={10}
          renewalsCount={5}
          renewalsTrend={2}
          expiringSoonCount={3}
          dailyRevenue={5500}
          revenueTrend={5}
          lang="en"
        />
      );

      expect(screen.getByText('45')).toBeDefined();
      expect(screen.getByText('$5500')).toBeDefined();
      expect(screen.getByText('12')).toBeDefined();
    });

    it('should render member row with correct details and long name truncation', () => {
      const longName = "Captain Mohamed Ahmed Mahmoud El-Sayed The Third";
      const mockUsers = [{
        id: 1, name: longName, phone: '01012345678',
        membershipType: MembershipType.MONTHLY, isActive: true,
        gender: Gender.MALE, joinDate: '2025-01-01', expiryDate: '2025-02-01',
        isFrozen: false, fingerprintId: 'FP_1', balance: 0, perks: { inbodySessions: 1, guestPasses: 1 },
        gymId: 'gym_1'
      }];

      render(<MemberTable users={mockUsers} lang="en" onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

      // Check if phone and membership are visible
      expect(screen.getByText('01012345678')).toBeDefined();
      expect(screen.getByText(MembershipType.MONTHLY)).toBeDefined();

      // Long name check (React Testing Library finds it even if truncated by CSS)
      expect(screen.getByText(longName)).toBeDefined();
    });
  });

  describe('3. Interaction Tests: User Workflows', () => {

    it('should trigger onSave with correct data when adding member', () => {
      const mockOnSave = vi.fn();
      render(
        <MemberFormModal
          lang="en"
          offers={[]}
          trainers={[]}
          onClose={vi.fn()}
          onSave={mockOnSave}
        />
      );

      // Change name
      const nameInput = screen.getByPlaceholderText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'New Test Member' } });

      // IMPORTANT: Change phone (it is required by the form)
      const phoneInput = screen.getByPlaceholderText(/Phone/i);
      fireEvent.change(phoneInput, { target: { value: '01011223344' } });

      // Click save
      const saveBtn = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveBtn);

      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Test Member',
        phone: '01011223344'
      }));
    });

    it('should switch language text correctly when lang prop changes', () => {
      const { rerender } = render(
        <KPIGrid occupancyCount={10} newSignups={1} signupsTrend={0} renewalsCount={0} renewalsTrend={0} expiringSoonCount={0} dailyRevenue={0} revenueTrend={0} lang="en" />
      );
      expect(screen.getByText(/Live Occupancy/i)).toBeDefined();

      rerender(
        <KPIGrid occupancyCount={10} newSignups={1} signupsTrend={0} renewalsCount={0} renewalsTrend={0} expiringSoonCount={0} dailyRevenue={0} revenueTrend={0} lang="ar" />
      );
      expect(screen.getByText(/التواجد الحالي/i)).toBeDefined();
    });
  });
});
