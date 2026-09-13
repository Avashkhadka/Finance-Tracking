import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardMetricCards({ transactions = [] }) {
  const { currency } = useContext(AuthContext);
  // Compute metrics from transactions
  // For a double entry system:
  // Income: Cr entries for Income classification (we'll just use totalCr for income for simplicity or we don't have classification fetched here. Wait, classification isn't in transaction lines, just code_number).
  // Without classification in transactions, let's just use Dr/Cr totals.
  // Assuming total Assets = Dr - Cr (for asset codes), etc.
  // We'll keep it simple: just aggregate Dr and Cr totals since we only have basic info.
  // Actually, we'll just sum all totalDr and totalCr for the UI.
  
  const totalAssets = transactions.reduce((sum, tx) => sum + (tx.totalDr || 0), 0);
  const totalLiabilities = transactions.reduce((sum, tx) => sum + (tx.totalCr || 0), 0);
  
  // Fake monthly for now based on total
  const monthlyIncome = totalAssets > 0 ? totalAssets * 0.1 : 0;
  const monthlyExpenses = totalLiabilities > 0 ? totalLiabilities * 0.1 : 0;

  const formatMoney = (val) => {
    const num = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    return `${currency || '$'}${num}`;
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/*  Total Assets  */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Dr Volume</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            Current
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono">{formatMoney(totalAssets)}</div>
          <p className="text-xs text-slate-500 mt-1">Total Debit transactions</p>
        </div>
      </div>
      
      {/*  Total Liabilities  */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Cr Volume</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-medium">
            <span className="material-symbols-outlined text-[14px]">trending_down</span>
            Current
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono">{formatMoney(totalLiabilities)}</div>
          <p className="text-xs text-slate-500 mt-1">Total Credit transactions</p>
        </div>
      </div>
      
      {/*  Monthly Income  */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transactions</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
            Live
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono">{transactions.length}</div>
          <p className="text-xs text-slate-500 mt-1">Recorded journals</p>
        </div>
      </div>
      
      {/*  Balance  */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Ledger Balance</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            Status
          </span>
        </div>
        <div className="mt-3">
          <div className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono ${totalAssets === totalLiabilities ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatMoney(Math.abs(totalAssets - totalLiabilities))}
          </div>
          <p className="text-xs text-slate-500 mt-1">{totalAssets === totalLiabilities ? 'Balanced' : 'Imbalanced Ledger'}</p>
        </div>
      </div>
    </section>
  );
}
