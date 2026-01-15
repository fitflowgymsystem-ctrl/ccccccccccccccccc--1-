
export interface FinancialRecord {
  id: number;
  gymId: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'MEMBERSHIP' | 'PRODUCT' | 'SALARY' | 'MAINTENANCE' | 'OTHER';
  amount: number;
  description: string;
  date: string;
  paymentMethod: 'CASH' | 'CARD';
  staffId?: string;
  branch?: string;
  memberId?: number;
  processedBy?: string;
  attachmentUrl?: string;
}

export interface Product {
  id: number;
  gymId: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStockAlert: number;
  barcode: string;
}

export interface PrivateSessionLog {
  id: number;
  date: string;
  trainerName: string;
  trainerId: number;
  price: number;
}

export interface Installment {
  id: number;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'UNPAID';
  paidDate?: string;
}

export interface InstallmentPlan {
  id: number;
  totalAmount: number;
  downPayment: number;
  remainingAmount: number;
  installmentsCount: number;
  installmentAmount: number;
  startDate: string;
  installments: Installment[];
  status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE';
  description: string;
}

export interface MonthlyStats {
  id: string; // "gymId_MM-YYYY"
  gymId: string;
  totalRevenue: number;
  totalExpenses: number;
  newMembers: number;
  classSales: { [className: string]: number };
}
