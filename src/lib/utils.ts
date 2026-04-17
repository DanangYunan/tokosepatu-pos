import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined) {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(safeAmount);
}

export const formatInputNumber = (val: number | string) => {
  if (!val && val !== 0) return '';
  const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parseInputNumber = (val: string) => {
  return Number(val.replace(/\D/g, '')) || 0;
};
