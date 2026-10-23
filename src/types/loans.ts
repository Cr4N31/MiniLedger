export type LoanSummary = {
  totalLent: number | string;
  totalRepaid: number | string;
  overdueAmount: number | string;
  unpaidLoans: number | string;
  overdueLoans: number | string;
};

export type LoanRecord = {
  id: string | number;
  friendName: string;
  amount: number | string;
  dueDate: string;
  repaidAt: string | null;
  isOverdue: boolean;
};
